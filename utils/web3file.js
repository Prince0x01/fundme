import { Web3Storage } from "web3.storage";

/**
 * Retrieves the access token for the Web3Storage API.
 *
 * @return {string} The Web3Storage API access token.
 */
export function getAccessToken() {
  return process.env.NEXT_PUBLIC_WEB3STORAGE_API_TOKEN;
}

/**
 * Returns a new instance of `Web3Storage` client with the `accessToken` obtained from `getAccessToken()`.
 *
 * @returns {Web3Storage} A new `Web3Storage` client instance.
 */
function makeStorageClient() {
  return new Web3Storage({ token: getAccessToken() });
}

/**
 * Asynchronously stores the given files using a storage client and returns the
 * content identifier (cid) of the stored files.
 *
 * @param {Array} files - The array of files to be stored.
 * @return {string} The content identifier (cid) of the stored files.
 */
export async function storeFiles(files) {
  const client = makeStorageClient();
  const cid = await client.put(files);
  console.log("stored files with cid:", cid);
  return cid;
}

/**
 * Asynchronously stores the given files to web3.storage with progress updates.
 *
 * @param {Array} files - An array containing the files to store.
 * @return {Promise<string>} A Promise that resolves with the root CID of the stored data.
 */
export async function storeWithProgress(files) {
  // show the root cid as soon as it's ready
  const onRootCidReady = (cid) => {
    console.log("uploading files with cid:", cid);
  };

  // when each chunk is stored, update the percentage complete and display
  const totalSize = files.map((f) => f.size).reduce((a, b) => a + b, 0);
  let uploaded = 0;

  const onStoredChunk = (size) => {
    uploaded += size;
    const pct = 100 * (uploaded / totalSize);
    console.log(`Uploading... ${pct.toFixed(2)}% complete`);
  };

  // makeStorageClient returns an authorized web3.storage client instance
  const client = makeStorageClient();

  // client.put will invoke our callbacks during the upload
  // and return the root cid when the upload completes
  return client.put(files, { onRootCidReady, onStoredChunk });
}

export async function retrieve(cid) {
  const client = makeStorageClient();
  const res = await client.get(cid);
  console.log(`Got a response! [${res.status}] ${res.statusText}`);
  if (!res.ok) {
    throw new Error(`failed to get ${cid}`);
  }
  return res;
  // request succeeded! do something with the response object here...
}

export async function retrieveFiles(cid) {
  const client = makeStorageClient();
  const res = await client.get(cid);
  console.log(`Got a response! [${res.status}] ${res.statusText}`);
  if (!res.ok) {
    throw new Error(`failed to get ${cid} - [${res.status}] ${res.statusText}`);
  }

  // unpack File objects from the response
  const files = await res.files();
  for (const file of files) {
    console.log(`${file.cid} -- ${file.path} -- ${file.size}`);
  }
}

export const createImageUrl = (cid, fileName, fileType) => {
  return `https://${cid}.ipfs.w3s.link/${encodeURI(fileName)}.${fileType}`;
};

export const changeFileName = (file, newName) => {
  return new File([file], `${newName}.${file.type.split("/")[1]}`, {
    type: file.type,
  });
};
