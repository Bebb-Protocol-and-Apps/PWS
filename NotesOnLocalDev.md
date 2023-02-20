There are three files where I added a comment like Local vs Mainnet Development
For the two UI files, those parts are responsible for the UI communicating with the local backend (IC replica running the canisters including the backend canister)

There might be issues with my setup as I'm running the Linux subsystem on Windows, so when I run npm run vite it gives me
Local:   http://localhost:3000/
Network: http://172.30.141.44:3000/
but http://localhost:3000/ doesn't work for me
you could try uncommenting the block comment for the proxy in vite.config.ts (right under the comment with Local vs Mainnet Development) and see if that works for you

http://172.30.141.44:3000/ runs for me (i.e. shows the UI) but cannot access the backend canister. That's the error about the call to the backend canister being rejected and it saying something about the called function not being defined on the backend canister. It's not an issue with the backend canister but as far as I can see the call to the local IC replica is rejected (either because the UI isn't allowed to call the local IC replica or because it's running somewhere else). So e.g. the calls for creating a new space or loading a user's spaces on the landing page don't work.
but accessing e.g. the testroom page works (as the backend canister isn't involved): http://172.30.141.44:3000/#/testroom

Working with the UI spun up by npm run vite has the advantage that it supports hot reloading for changes made to the UI so one doesn't need to redeploy on every UI change.
that's not the case for the UI canister spun up with 
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
after running that command you get sth like
Deployed canisters.
URLs:
  Frontend canister via browser
    PersonalWebSpace_frontend: http://127.0.0.1:4943/?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai
  Backend canister via Candid interface:
    PersonalWebSpace_backend: http://127.0.0.1:4943/?canisterId=r7inp-6aaaa-aaaaa-aaabq-cai&id=rrkah-fqaaa-aaaaa-aaaaq-cai
http://127.0.0.1:4943/?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai doesn't work properly for me either (calls to the backend are also rejected) but http://localhost:4943/?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai actually works (which usually should be the same as far as I know but it might be that my Linux subsystem setup messes this up)
thus, http://localhost:4943/?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai can also call the backend successfully
creating a space still fails though as the local IC replica doesn't have the protocol canister running (which our backend uses). We could comment out the call to the protocol canister from the backend canister though (see comment with Local vs Mainnet Development in main.mo).
After commenting out the protocol call, the call to create a space is successful. Note that the preview shown in the section My Spaces points to the mainnet UI canister (i.e. doesn't show the local canisters). To see the local canister go to http://localhost:4943/?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai#/space/0 (might need to refresh to work).
for accessing routes with this, one can use e.g.
http://localhost:4943/?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai#/testroom
the disadvantage here is that there isn't any hot reloading, so after every change one has to redeploy the canisters with 
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

