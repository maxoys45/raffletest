// Make sure event is a coin.TRANSFER
export const isCoinTransfer = (ev) => {
  return (
    ev &&
    ev.module &&
    ev.module.name === "coin" &&
    // ev.module.namespace === null && // I'm not sure it's namespace being 'null' is required?
    (ev.name === "TRANSFER" ||
      ev.name === "coin.TRANSFER" ||
      ev.name?.toUpperCase() === "TRANSFER")
  );
};

// Make sure where the transaction is going to matches the ezkda wallet address.
export const toMatchesAddress = (to, watched) => {
  if (!to) return false;

  to = String(to);

  if (to === watched) return true;

  // handle case where event gives raw pubkey (no 'k:' prefix) but your address includes 'k:'
  if (watched.startsWith("k:") && to === watched.slice(2)) return true;

  // reverse: event might have 'k:' but watched is pubkey
  if (to.startsWith("k:") && to === `k:${watched}`) return true;

  return false;
};

export const validateTransferInputs = (
  ezKdaWallet,
  publicKey,
  privateKey,
  toAddress,
  amount
) => {
  if (!ezKdaWallet || typeof ezKdaWallet !== "string") {
    throw new Error("Invalid ezKdaWallet: must be a string");
  }
  if (!publicKey || publicKey.length !== 64) {
    throw new Error("Invalid publicKey: must be 64 hex chars");
  }
  if (!privateKey || privateKey.length !== 64) {
    throw new Error("Invalid privateKey: must be 64 hex chars");
  }
  if (!toAddress || !toAddress.startsWith("k:")) {
    throw new Error(`Invalid recipient address: ${toAddress}`);
  }
  if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
    throw new Error(`Invalid amount: ${amount}`);
  }
};
