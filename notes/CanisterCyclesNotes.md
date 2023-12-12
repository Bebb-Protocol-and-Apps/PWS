# Cycles for Mainnet Canisters
Fund wallet with cycles (from ICP): https://medium.com/dfinity/internet-computer-basics-part-3-funding-a-cycles-wallet-a724efebd111

## Top up cycles:
- dfx identity --network=ic get-wallet
- dfx wallet --network ic balance
- dfx canister --network ic status PersonalWebSpace_backend
- dfx canister --network ic status PersonalWebSpace_frontend
- dfx canister --network ic --wallet 3v5vy-2aaaa-aaaai-aapla-cai deposit-cycles 3000000000000 PersonalWebSpace_backend
- dfx canister --network ic --wallet 3v5vy-2aaaa-aaaai-aapla-cai deposit-cycles 300000000000 PersonalWebSpace_frontend

## Top up history
2023-02-16:
  - topped up 7T cycles each for new balances:
  - PersonalWebSpace_backend Balance: 10_896_387_427_956 Cycles (2023-03-06: 10.895, 2023-07-05: 10_882_246_216_265)
  - PersonalWebSpace_frontend Balance: 10_220_358_949_308 Cycles (2023-03-06: 10.079, 2023-07-05: 9_481_199_655_794)