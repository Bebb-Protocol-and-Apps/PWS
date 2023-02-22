# PersonalWebSpace

Welcome to your new PersonalWebSpace project and to the internet computer development community. By default, creating a new project adds this README and some template files to your project directory. You can edit these template files to customize your project and to include your own code to speed up the development cycle.

To get started, you might want to explore the project directory structure and the default configuration file. Working with this project in your development environment will not affect any production deployment or identity tokens.

To learn more before you start working with PersonalWebSpace, see the following documentation available online:

- [Quick Start](https://sdk.dfinity.org/docs/quickstart/quickstart-intro.html)
- [SDK Developer Tools](https://sdk.dfinity.org/docs/developers-guide/sdk-guide.html)
- [Motoko Programming Language Guide](https://sdk.dfinity.org/docs/language-guide/motoko.html)
- [Motoko Language Quick Reference](https://sdk.dfinity.org/docs/language-guide/language-manual.html)
- [JavaScript API Reference](https://erxue-5aaaa-aaaab-qaagq-cai.raw.ic0.app)

If you want to start working on your project right away, you might want to try the following commands:

```bash
cd PersonalWebSpace/
dfx help
dfx canister --help
```

## Running the project locally

If you want to test your project locally, you can use the following commands:

```bash

# 1. Install dependencies
npm install

# 2. Install Vessel which is a dependency
https://github.com/dfinity/vessel:

npm run dev
Note: this starts a replica which includes the canisters state stored from previous sessions.
If you want to start a clean local IC replica (i.e. all canister state is erased) run instead: npm run erase-replica

# 3. Deploys your canisters to the replica and generates your candid interface
Local:
dfx deploy --argument "(
  principal\"$(dfx identity get-principal)\",
  record {
    logo = record {
      logo_type = \"image/png\";
      data = \"\";
    };
    name = \"PersonalWebSpace\";
    symbol = \"PWS\";
    maxLimit = 65535;
  }
)"

--> access frontend at http://localhost:4943/?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai
access routes like so http://localhost:4943/?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai#/testroom
needs to be redeployed after every change

# Alternative 3. Run a local vite UI (note that this had issues communicating to the backend canister for some setups in the past)
npm run vite
--> runs on port 3000
access routes like "http://172.30.141.44:3000/#/testroom" (same as on Mainnet)
hot reloads with every UI change

For more detailed notes on running this locally, also see NotesOnLocalDev.md

# Production Deployement
npm install

dfx start --background

Deploy to Mainnet (live IC):
Ensure that all changes needed for Mainnet deployment have been made (e.g. define HOST in store.ts)

dfx deploy --network ic --argument "(
  principal\"$(dfx identity get-principal)\",
  record {
    logo = record {
      logo_type = \"image/png\";
      data = \"\";
    };
    name = \"PersonalWebSpace\";
    symbol = \"PWS\";
    maxLimit = 65535;
  }
)"

In case there are authentication issues, you could try this command
Note that only authorized identities which are set up as canister controllers may deploy the production canisters
dfx deploy --network ic --wallet "$(dfx identity --network ic get-wallet)" --argument "(
  principal\"$(dfx identity get-principal)\",
  record {
    logo = record {
      logo_type = \"image/png\";
      data = \"\";
    };
    name = \"PersonalWebSpace\";
    symbol = \"PWS\";
    maxLimit = 65535;
  }
)"

# Cycles for Production Canisters
Fund wallet with cycles (from ICP): https://medium.com/dfinity/internet-computer-basics-part-3-funding-a-cycles-wallet-a724efebd111

Top up cycles:
dfx identity --network=ic get-wallet
dfx wallet --network ic balance
dfx canister --network ic status PersonalWebSpace_backend
dfx canister --network ic status PersonalWebSpace_frontend
dfx canister --network ic --wallet 3v5vy-2aaaa-aaaai-aapla-cai deposit-cycles 3000000000000 PersonalWebSpace_backend
dfx canister --network ic --wallet 3v5vy-2aaaa-aaaai-aapla-cai deposit-cycles 300000000000 PersonalWebSpace_frontend

2023-02-16:
  topped up 7T cycles each for new balances:
  PersonalWebSpace_backend Balance: 10_896_387_427_956 Cycles
  PersonalWebSpace_frontend Balance: 10_220_358_949_308 Cycles

### Note on frontend environment variables

If you are hosting frontend code somewhere without using DFX, you may need to make one of the following adjustments to ensure your project does not fetch the root key in production:

- set`NODE_ENV` to `production` if you are using Webpack
- use your own preferred method to replace `process.env.NODE_ENV` in the autogenerated declarations
- Write your own `createActor` constructor

### Dev Notes
need to use single quotes in HTML to store as Text (which has double quotes)
remove all newlines and other space (used for exampleString): https://www.textfixer.com/tools/remove-line-breaks.php
