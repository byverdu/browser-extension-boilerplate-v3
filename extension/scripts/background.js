import { api, ACTIONS } from '../api/index.js';

/**
 * @type {API}
 */
const { onMessage, getStorage, setStorage, removeStorage } = api;

const { GET_STORAGE, SET_STORAGE, REMOVE_STORAGE } = ACTIONS;

/**
 * @param {APIKey} key
 * @param {VisitedLink[]} values
 */
async function setStorageAsync(key, values) {
  await setStorage(key, values);
}

/**
 * @param {(response: SyncStorage) => void} sendResponse
 * @param {APIKey} key
 */
async function getStorageAsync(sendResponse, key) {
  const items = await getStorage(key);

  sendResponse(items[key]);
}

/**
 * @param {APIKey} key
 */
async function removeStorageAsync(key) {
  await removeStorage(key);
}

/**
 *
 * @param {SendMsgParams} msg
 * @param {chrome.runtime.MessageSender} sender
 * @param {(response: unknown) => void} sendResponse
 * @returns void
 */
function onMessageCallback(msg, sender, sendResponse) {
  if (sender && msg && msg.type) {
    if (msg.type === SET_STORAGE) {
      /**
       * @type {SendMsgPayload<SyncStorage>}
       */
      const { key, value } = msg.payload;
      setStorageAsync(key, value);
    }

    if (msg.type === GET_STORAGE) {
      /**
       * @type {SendMsgPayload<ExtensionItems>}
       */
      const { value } = msg.payload;
      getStorageAsync(sendResponse, value);

      // make it asynchronously by returning true
      return true;
    }

    if (msg.type === REMOVE_STORAGE) {
      /**
       * @type {SendMsgPayload<ExtensionItems[]>}
       */
      const { value } = msg.payload;
      removeStorageAsync(value);
    }
  } else {
    console.info('No messages found');
  }
}

onMessage(onMessageCallback);
