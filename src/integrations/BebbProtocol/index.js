// External Canister: Bebb Protocol (aka NewWave) (for integration of neighbor connections)
import { Actor, HttpAgent } from "@dfinity/agent";

// Imports and re-exports candid interface
import { idlFactory } from "./bebb.did.js";
export { idlFactory } from "./bebb.did.js";

/* CANISTER_ID is replaced by webpack based on node environment
 * Note: canister environment variable will be standardized as
 * process.env.CANISTER_ID_<CANISTER_NAME_UPPERCASE>
 * beginning in dfx 0.15.0
export const canisterId =
  process.env.CANISTER_ID_BEBB ||
  process.env.BEBB_CANISTER_ID; */

// CANISTER_ID is put manually
//export const canisterId = process.env.NODE_ENV !== "development" ? "pzrof-pyaaa-aaaai-acnha-cai" : "br5f7-7uaaa-aaaaa-qaaca-cai";
export let canisterId;
if (process.env.DFX_NETWORK === "ic") {
  // production
  canisterId = "pzrof-pyaaa-aaaai-acnha-cai";
} else if (process.env.DFX_NETWORK === "local") {
  // on localhost
  canisterId = "br5f7-7uaaa-aaaaa-qaaca-cai";
} else if (process.env.DFX_NETWORK === "development") {
  // development canister on mainnet (for network development)
  canisterId = "tsmol-tqaaa-aaaag-abt2a-cai";
} else if (process.env.DFX_NETWORK === "testing") {
  // testing canister on mainnet (for network testing)
  canisterId = "t6nyb-faaaa-aaaal-qcbaa-cai";
} else if (process.env.DFX_NETWORK === "alexStaging") {
  // testing canister on mainnet (for network testing for Alex)
  canisterId = "yqn2i-hyaaa-aaaap-qbmiq-cai";
} else {
  canisterId = "pzrof-pyaaa-aaaai-acnha-cai";
};

export const createActor = (canisterId, options = {}) => {
  const agent = options.agent || new HttpAgent({ ...options.agentOptions });

  if (options.agent && options.agentOptions) {
    console.warn(
      "Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent."
    );
  }

  // Fetch root key for certificate validation during development
  if (process.env.DFX_NETWORK === "local") {
    agent.fetchRootKey().catch((err) => {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running"
      );
      console.error(err);
    });
  }

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
};

export const bebb = createActor(canisterId);
