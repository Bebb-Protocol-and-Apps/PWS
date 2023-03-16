/* import { Secp256k1KeyIdentity } from "@dfinity/identity";
import hdkey from "hdkey";
import bip39 from "bip39";
``;
// Completely insecure seed phrase. Do not use for any purpose other than testing.
// Resolves to "wnkwv-wdqb5-7wlzr-azfpw-5e5n5-dyxrf-uug7x-qxb55-mkmpa-5jqik-tqe"
const seed =
  "peacock peacock peacock peacock peacock peacock peacock peacock peacock peacock peacock peacock";

export const identityFromSeed = async (phrase) => {
  const seed = await bip39.mnemonicToSeed(phrase);
  const root = hdkey.fromMasterSeed(seed);
  const addrnode = root.derive("m/44'/223'/0'/0/0");

  return Secp256k1KeyIdentity.fromSecretKey(addrnode.privateKey);
}; 

export const identity = identityFromSeed(seed); */

import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1';

// Resolves to Principal "cbydt-onhgx-x3fxj-j2xef-dsb4e-o2bqx-5oln4-koufv-wufn6-wsc54-sae"
let seed = Buffer.from("peacock peacock peacock peacock peacock peacock peacock peacock peacock peacock peacock peacock", 'utf8');
const totalLength = 32;
seed = Buffer.concat([seed], totalLength);
export const identity = Secp256k1KeyIdentity.generate(seed);