// External Canister: Bebb Protocol (aka NewWave) (for integration of neighbor connections)
import { Actor, HttpAgent } from "@dfinity/agent";

// Imports and re-exports candid interface
import { idlFactory } from "./newwave.did.js";
export { idlFactory } from "./newwave.did.js";

// CANISTER_ID is put manually
export const canisterId = process.env.NODE_ENV !== "development" ? "pzrof-pyaaa-aaaai-acnha-cai" : "br5f7-7uaaa-aaaaa-qaaca-cai";

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

export const newwave = createActor(canisterId);