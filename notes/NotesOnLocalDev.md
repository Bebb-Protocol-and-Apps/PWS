# Some Details on Local Development

## Running Bebb Protocol locally
This project's dfx.json specifies Bebb Protocol as a remote canister (i.e. can be used by project's canisters locally but isn't built as it relies on the remote canister being deployed to the local replica from another project). It's canister bebbprotocol. The files for the integration (wasm, did, js, ts) need to be copied over to the integrations/BebbProtocol folder manually if changed.

- Clone Bebb Protocol's repo: https://github.com/Bebb-Protocol-and-Apps/BebbProtocol
- And use the latest version (e.g. 0.0.4 as of 2023-07)
- Go to OIM's codebase (where the file you're reading is in)
- Start a local replica in this project (OIM)
- Deploy this project's canisters, PersonalWebSpace_backend and PersonalWebSpace_frontend, see deploy command in README (after these steps the following canister ids should be assigned: PersonalWebSpace_backend canister id: rrkah-fqaaa-aaaaa-aaaaq-cai; PersonalWebSpace_frontend canister id: ryjl3-tyaaa-aaaaa-aaaba-cai)
- Go to the folder with Bebb Protocol's latest version and run dfx deploy there (this creates the local Bebb Protocol canister on the local replica started earlier which is thus the same replica this project's canisters are running on)
- Make sure the local canister id for the deployed Bebb Protocol canister is br5f7-7uaaa-aaaaa-qaaca-cai (required by this project to make the calls on the local replica)
- This project's canisters (OIM) should now successfully call the locally deployed Bebb Protocol canister (i.e. all functionality works, same as on mainnet)
- Test via npm run vite

# Other notes

There are three files where I added a comment like Local vs Mainnet Development

For the two UI files, those parts are responsible for the UI communicating with the local backend (IC replica running the canisters including the backend canister)

There might be issues with my setup as I'm running the Linux subsystem on Windows, so when I run npm run vite it gives me

Local:   http://localhost:3000/

Network: http://172.30.141.44:3000/

but http://localhost:3000/ doesn't work for me

you could try uncommenting the block comment for the proxy in vite.config.ts (right under the comment with Local vs Mainnet Development) and see if that works for you

Currently http://172.29.55.198:3000/ from the hot reloading npm run vite is able to access the backend cansiter. The system seems to be able to call the replica and load rooms from the canisters. To get it to work you need to run npm run dev which starts the backend canister, the downside is that the hot reloading links will call the deployed canisters from npm run dev which means that those pages are not hot reloading. But at least the calls work

Working with the UI spun up by npm run vite has the advantage that it supports hot reloading for changes made to the UI so one doesn't need to redeploy on every UI change.

that's not the case for the UI canister spun up with 
```bash
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
```

after running that command you get sth like
```bash
Deployed canisters.
URLs:
  Frontend canister via browser
    PersonalWebSpace_frontend: http://127.0.0.1:4943/?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai
  Backend canister via Candid interface:
    PersonalWebSpace_backend: http://127.0.0.1:4943/?canisterId=r7inp-6aaaa-aaaaa-aaabq-cai&id=rrkah-fqaaa-aaaaa-aaaaq-cai
```

http://127.0.0.1:4943/?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai doesn't work properly for me either (calls to the backend are also rejected) but http://localhost:4943/?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai actually works (which usually should be the same as far as I know but it might be that my Linux subsystem setup messes this up)

Thus, http://localhost:4943/?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai can also call the backend successfully
creating a space still fails though as the local IC replica doesn't have the protocol canister running (which our backend uses). We could comment out the call to the protocol canister from the backend canister though (see comment with Local vs Mainnet Development in main.mo).

After commenting out the protocol call, the call to create a space is successful. Note that the preview shown in the section My Spaces points to the mainnet UI canister (i.e. doesn't show the local canisters). 

To see the local canister go to http://localhost:4943/?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai#/space/0 (might need to refresh to work).

For accessing routes with this, one can use e.g.
http://localhost:4943/?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai#/testroom

the disadvantage here is that there isn't any hot reloading, so after every change one has to redeploy the canisters with 
```bash
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
```

