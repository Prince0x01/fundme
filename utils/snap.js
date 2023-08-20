const defaultSnapOrigin = `npm:fundme-snap`;
// const defaultSnapOrigin =
//   process.env.SNAP_ORIGIN ?? `local:http://localhost:8080`;

/**
 * Get the installed snaps in MetaMask.
 *
 * @returns The snaps installed in MetaMask.
 */
export const getSnaps = async () => {
  return await window.ethereum.request({
    method: "wallet_getSnaps",
  });
};

/**
 * Connect a snap to MetaMask.
 *
 * @param snapId - The ID of the snap.
 * @param params - The params to pass with the snap to connect.
 */
export const connectSnap = async (snapId = defaultSnapOrigin, params = {}) => {
  await window.ethereum.request({
    method: "wallet_requestSnaps",
    params: {
      [snapId]: params,
    },
  });
};

/**
 * Get the snap from MetaMask.
 *
 * @param version - The version of the snap to install (optional).
 * @returns The snap object returned by the extension.
 */
export const getSnap = async (version) => {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(
      (snap) =>
        snap.id === defaultSnapOrigin && (!version || snap.version === version)
    );
  } catch (e) {
    console.log("Failed to obtain installed snap", e);
    return undefined;
  }
};

/**
 * Invoke the "notification" method from the example snap.
 */

export const sendNotification = async (message) => {
  await window.ethereum.request({
    method: "wallet_invokeSnap",
    params: {
      snapId: defaultSnapOrigin,
      request: { method: "notification", params: { message } },
    },
  });
};

export const isLocalSnap = (snapId) => snapId.startsWith("local:");
