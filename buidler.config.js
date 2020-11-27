require('dotenv').config();
const MNEMONIC = process.env.MNEMONIC
const {
  usePlugin,
  task,
  extendEnvironment,
} = require('@nomiclabs/buidler/config');
const { gray, yellow } = require('chalk');

usePlugin('@nomiclabs/buidler-ethers');
usePlugin('@openzeppelin/buidler-upgrades');
usePlugin('@nomiclabs/buidler-truffle5');
usePlugin('solidity-coverage');
usePlugin('buidler-gas-reporter');
usePlugin('buidler-contract-sizer');
usePlugin('buidler-abi-exporter');

const optimizerRuns = 10000000;
const log = (...text) => console.log(gray(...['└─> [DEBUG]'].concat(text)));

extendEnvironment((bre) => {
  bre.log = log;
});

function optimizeIfRequired({ bre, taskArguments: { optimizer } }) {
  if (optimizer || bre.optimizer) {
    // only show message once if re-run
    if (bre.optimizer === undefined) {
      console.log(
        gray('Adding optimizer, runs', yellow(optimizerRuns.toString()))
      );
    }

    // Use optimizer (slower) but simulates real contract size limits and gas usage
    bre.config.solc.optimizer = { enabled: true, runs: optimizerRuns };
    bre.config.networks.buidlerevm.allowUnlimitedContractSize = false;
  } else {
    if (bre.optimizer === undefined) {
      console.log(
        gray('Optimizer disabled. Unlimited contract sizes allowed.')
      );
    }
    bre.config.solc.optimizer = { enabled: false };
    bre.config.networks.buidlerevm.allowUnlimitedContractSize = true;
  }

  // flag here so that if invoked via "buidler test" the argument will persist to the compile stage
  bre.optimizer = !!optimizer;
}

task('compile')
  .addFlag('optimizer', 'Compile with the optimizer')
  .setAction(async (taskArguments, bre, runSuper) => {
    optimizeIfRequired({ bre, taskArguments });
    await runSuper(taskArguments);
  });

task('test')
  .addFlag('optimizer', 'Compile with the optimizer')
  .addFlag('gas', 'Compile gas usage')
  .addOptionalParam('grep', 'Filter tests to only those with given logic')
  .setAction(async (taskArguments, bre, runSuper) => {
    const { gas, grep } = taskArguments;

    optimizeIfRequired({ bre, taskArguments });

    if (grep) {
      console.log(gray('Filtering tests to those containing'), yellow(grep));
      bre.config.mocha.grep = grep;
    }

    if (gas) {
      console.log(
        gray(`Enabling ${yellow('gas')} reports, tests will run slower`)
      );
      bre.config.gasReporter.enabled = true;
      bre.config.mocha.timeout = 180000;
    }

    // suppress logs for tests
    bre.config.suppressLogs = true;

    await runSuper(taskArguments);
  });

const GAS_PRICE = 20e9; // 20 Gwei

module.exports = {
  solc: {
    version: '0.6.12',
  },
  networks: {
    buidlerevm: {
      blockGasLimit: 0x1fffffffffffff,
      gasPrice: GAS_PRICE,
      allowUnlimitedContractSize: true,
    },
    coverage: {
      url: 'http://localhost:8555',
      blockGasLimit: 0x1fffffffffffff,
      gasPrice: GAS_PRICE,
      allowUnlimitedContractSize: true,
    },
    local: {
      url: 'http://localhost:8545',
      blockGasLimit: 0x1fffffffffffff,
      gas: "auto",
      gasPrice: GAS_PRICE,
    },
    goerli: {
      url: 'https://goerli.infura.io/v3/6e0059b45c724e3aa7718d1212295bf5',
      accounts: ['0x43e1de18ed61d930dd9e92098d58de9fddd76b4444c32e7a05c238007c893910']
      // mnemonic: MNEMONIC,
      // path: "m/44'/60'/0'/0/",
      // initialIndex: 0,
      // count: 20
    },
    mainnet: {
      url: 'https://mainnet.infura.io/v3/6e0059b45c724e3aa7718d1212295bf5'
    }
  },
  throwOnTransactionFailures: true,
  gasReporter: {
    enabled: false,
    showTimeSpent: true,
    currency: 'USD',
    maxMethodDiff: 25, // CI will fail if gas usage is > than this %
  },
  abiExporter: {
    path: './abi',
    only: [
      'IAdmins',
      'IBalanceReporters',
      'IManagers',
      'IOperators',
      'IPayments',
      'ISettings',
      'IERC20',
      'IStakingEthToken',
      'IRewardEthToken',
      'IValidatorRegistration',
      'IValidators',
      'ISolos',
      'IPool',
    ],
    clear: true,
  },

};
