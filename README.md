Overview
================

WIP: This document and project are a work in progress

### SMART CONTRACTS ###

Smart contracts are cloned from stakewise.

**important** Implementing the extra feature to allow token minting without first staking in the pool requires special configuration. 

Open the contracts/StakingEthToken.sol file and hardcode the minter address by setting the following line in the initialize() function

`minter = [0xMINTERADDRESS]`

note this change has not been tested and is not deployed on the testnet. Handle with care. 

### Network Setting ###

in buidler.config.js set account privatekey and web3 endpoint under the networks config.

### Contract Settings ###

In deployments/settings.js set the VRC contract address to the deposit contract deployed by the ethereum foundation

Set the withdrawal credential for the pool validator

Set the admin address to the account that will manage roles within the contracts

Set the maintainer address to the account that will collect fees from the contract services

Set the `validatorPrice` to the monthly subscription fee for a solo validator

Set the `maintainerFee` to the fee of the staking pool as a percent * 100

### Deploy ###

`yarn install`

`yarn compile --optimizer`

`yarn deploy --network [NETOWRK_NAME]`

### Artifacts ###

Copy the json artifacts from /artifacts dir to web3watcher/importedArtifacts

run the web3watcher/scripts/importArtifacts.js script to export truffle-compliant scripts to the front end app

`$ node importArtifacts.js`

This script can be modified to place artifacts in the path of the front end.

### WEB3WATCHER ###

The web3watcher app directory is a truffle project, so in order to utilize the scripts, simply import the account to use in the truffle-config file under the desired network provider.

when Initializing the contracts set the truffle account to the admin address.

execute the setOperator script to set the operator role in the contracts to the operator address defined in the environment variable `OPERATORACCOUNT` 

`$ truffle exec setOperator.js` 

Now that the operator role is set, this is the account that web3watcher will use to execute the RegisterValidator function. Therefore this account must maintain some eth in order to cover gas costs. 

This account must also be unlocked via the provider, the current version of this app creates an HDWalllet provider from the wallets mnemonic read it from the .env file. In production this should be read in from a secret volume or transaction should be sign in some other secure fashion. 

Once all ENV variable are set the app can be run with

`npm run start`

### Django Registration Backend ###

The registration backend implements a simple API to store records of deposits, generate associated validator credentials and deposit data.

The backend is called by the web3watcher app whenever is recieves a DepositAdded event, in which case the backend creates a record of this deposit. 

When a new Deposit is recieved by the backend, django fires a task generating a set of validator credentials. When these credentials and their associated deposit data are created and sign, the pertinent info is sent in a request back to the web3watcher app for inclusion in the block chain. 

When the validator creds are included in the blcokchain web3watcher again calls the backend in this case the web3watcher app updates the status of a validator record by keying on it pubkey field. This also triggers an update of the Solo record's amountStaked field. 

The backend data can be accessed from the django admin panel at /admin and by logging in with the admin credentials.

Further development of the backend api is neccesary in order to reconcile and manange all deposits and validators.

### Pool ###

The pooled staking contract allows users to deposit any mount of eth less than 32 and participate in staking. The contract executes a RegisterValidator function, which can only be called by the operator account. 

When a user deposits into the pool contract they recieve LETH in return a liquid tokenized representation of the ETH they have staked. 

As return accumulate in the pool, a `reporter` account reports this informatino via the BalanceReporter contract which updates and distribute a second token called RewardToken to the LETH holders.

### Pool Balance Reporters ###

To set an address as a balance reporter set the ENV variable for `BALANCEREPORTERSCONTRACT` and `REPORTERACCOUNT` then simply execute:

`$ truffle exec setReporter.js`

In order to report a a rewards balance simply execute the script and pass the `rewards_amount` as a CLI argument:

`$ truffle exec voteForTotalRewards.js 1000000000000000000`

### Scripts ###

To mint tokens to an address simply execute the `mintLeth.js` script:

`truffle exec mintLeth.js [ADDRESS] {TOKENS_IN_WEI]`

# StakeWise smart contracts

[![CircleCI](https://circleci.com/gh/stakewise/contracts.svg?style=svg)](https://circleci.com/gh/stakewise/contracts)
[![CodeCov](https://codecov.io/gh/stakewise/contracts/branch/master/graph/badge.svg)](https://codecov.io/gh/stakewise/contracts)
[![Discord](https://user-images.githubusercontent.com/7288322/34471967-1df7808a-efbb-11e7-9088-ed0b04151291.png)](https://discord.gg/2BSdr2g)

The StakeWise smart contracts for tokenized staking and non-custodial validators.

- **Extensible:** It is possible to create your own contract with logic for accumulating validator deposit amount.
- **Upgradable:** By using [OpenZeppelin Upgrades](https://github.com/OpenZeppelin/openzeppelin-upgrades), it's possible to fix bugs and critical issues when the contracts are deployed to the production network.
- **Role-based access:** By having [Operators](./contracts/access/Operators.sol), [Admins](./contracts/access/Admins.sol), and [Managers](./contracts/access/Managers.sol) contracts, it is possible to restrict user capabilities.
- **Integration friendly:** Any contract state change is always followed by an emitted event. Applications can monitor and act on these events.
- **Configurable:** Any global setting can be managed through the separate [Settings](./contracts/Settings.sol) contract.

## Deployment

1. Install dependencies:

   ```shell script
   yarn install
   ```

2. Compile optimized contracts:

   ```shell script
   yarn compile --optimizer
   ```

3. Define network parameters in `buidler.config.js`. Learn more at [Buidler config options](https://hardhat.org/config/#available-config-options).

4. Change [initial settings](./deployments/settings.js) accordingly.

5. If you are deploying to the network without [ETH2 deposit contract](https://github.com/ethereum/eth2.0-specs/tree/dev/solidity_deposit_contract), run the following commands:

   ```shell script
   yarn deployVRC --network rinkeby
   ```

6. If you are deploying to the network without `DAI contract`, run the following commands:
   ```shell script
   yarn deployDAI --network rinkeby
   ```

7. Deploy StakeWise contracts to the selected network:

   ```shell script
   yarn deploy --network rinkeby
   ```

## Documentation

You can find the documentation for every contract in the `contracts` directory. In the future, the documentation will be hosted on a dedicated webpage.

## Contributing

Development of the project happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements.

### License

The project is [GNU GPL v3](./LICENSE.md).
