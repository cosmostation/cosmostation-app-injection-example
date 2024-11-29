export function convertPubKeyToHex(pubKey?: Uint8Array) {
  if (!pubKey) {
    return "";
  }

  return Array.from(pubKey)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
