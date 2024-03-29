import { when } from 'jest-when';
import * as api from '../extension/api';
import utilsRewire from '../extension/scripts/background.js';

jest.mock('../extension/api');

const sendResponse = jest.fn();
const onMessageCallback = utilsRewire.__get__('onMessageCallback');
const onInstalledCallback = utilsRewire.__get__('onInstalledCallback');
const onclickContextMenu = utilsRewire.__get__('onclickContextMenu');
const links = [{ url: 'some_url', title: 'some title', date: 0 }];
const {
  api: extApi,
  ACTIONS: { SET_STORAGE, GET_STORAGE, REMOVE_STORAGE, UPDATE_STORAGE },
  EXTENSION_NAME,
  EXTENSION_OPTIONS,
} = api;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('onMessageCallback', () => {
  it('should call console.info if message.type is not defined', () => {
    jest.spyOn(console, 'info');
    onMessageCallback({}, {});

    expect(console.info).toHaveBeenCalledTimes(1);
    expect(console.info).toHaveBeenCalledWith('No messages found');
  });

  describe('SET_STORAGE', () => {
    it('should call api.setStorage', async () => {
      jest.spyOn(extApi, 'setStorage');

      await onMessageCallback(
        {
          type: SET_STORAGE,
          payload: {
            key: EXTENSION_NAME,
            value: links,
          },
        },
        {},
      );

      expect(extApi.setStorage).toHaveBeenCalledTimes(1);
      expect(extApi.setStorage).toHaveBeenCalledWith(EXTENSION_NAME, links);
    });
  });
  describe('GET_STORAGE', () => {
    it('should call api.getStorage', async () => {
      jest.spyOn(extApi, 'getStorage');

      when(extApi.getStorage)
        .calledWith(EXTENSION_NAME)
        .mockResolvedValue({ [EXTENSION_NAME]: links });

      await onMessageCallback(
        {
          type: GET_STORAGE,
          payload: {
            key: EXTENSION_NAME,
          },
        },
        {},
        sendResponse,
      );

      expect(extApi.getStorage).toHaveBeenCalledTimes(1);
      expect(extApi.getStorage).toHaveBeenCalledWith(EXTENSION_NAME);
      expect(sendResponse).toHaveBeenCalledWith(links);
    });
  });

  describe('REMOVE_STORAGE', () => {
    it('should call api.setStorage', async () => {
      jest.spyOn(extApi, 'removeStorage');

      onMessageCallback(
        {
          type: REMOVE_STORAGE,
          payload: { key: EXTENSION_NAME },
        },
        {},
      );

      expect(extApi.removeStorage).toHaveBeenCalledTimes(1);
      expect(extApi.removeStorage).toHaveBeenCalledWith(EXTENSION_NAME);
    });
  });

  describe('UPDATE_STORAGE', () => {
    it('should call api.setStorage', async () => {
      jest.spyOn(extApi, 'updateStorage');

      await onMessageCallback(
        {
          type: UPDATE_STORAGE,
          payload: { key: EXTENSION_NAME, value: { id: '456' } },
        },
        {},
      );

      expect(extApi.updateStorage).toHaveBeenCalledTimes(1);
      expect(extApi.updateStorage).toHaveBeenCalledWith(EXTENSION_NAME, {
        id: '456',
      });
    });
  });
});

describe('onInstalledCallback', () => {
  it('should call setStorage if the details reason is "install"', () => {
    jest.spyOn(extApi, 'setStorage');

    onInstalledCallback({ reason: 'install' });

    expect(extApi.setStorage).toHaveBeenCalledTimes(2);
    expect(extApi.setStorage).toHaveBeenNthCalledWith(1, EXTENSION_NAME, []);
    expect(extApi.setStorage).toHaveBeenNthCalledWith(2, EXTENSION_OPTIONS, {
      sort: 'asc',
    });
  });
  it('should not call setStorage if the details reason is different than "install"', () => {
    jest.spyOn(extApi, 'setStorage');

    onInstalledCallback({ reason: 'chrome_update' });

    expect(extApi.setStorage).toHaveBeenCalledTimes(0);
  });

  it('should create a ContextMenu', () => {
    jest.spyOn(extApi, 'createContextMenu');

    onInstalledCallback({ reason: 'chrome_update' });

    expect(extApi.createContextMenu).toHaveBeenCalledTimes(1);
    expect(extApi.createContextMenu).toHaveBeenCalledWith({
      id: EXTENSION_NAME,
      title: 'Save link?',
      contexts: ['link'],
    });
  });

  it('should set ContextMenu onclick callback', () => {
    jest.spyOn(extApi, 'contextMenuOnClick');

    onInstalledCallback({ reason: 'chrome_update' });

    expect(extApi.contextMenuOnClick).toHaveBeenCalledTimes(1);
    expect(extApi.contextMenuOnClick).toHaveBeenCalledWith(
      utilsRewire.__get__('onclickContextMenu'),
    );
  });
});

describe('onclickContextMenu', () => {
  it('should call api.updateStorage', async () => {
    jest.spyOn(extApi, 'updateStorage');

    await onclickContextMenu({
      linkUrl: 'some_link',
      selectionText: 'some link',
    });

    const result = {
      date: expect.any(Number),
      title: 'some link',
      url: 'some_link',
    };

    expect(extApi.updateStorage).toHaveBeenCalledTimes(1);
    expect(extApi.updateStorage).toHaveBeenCalledWith(EXTENSION_NAME, result);
  });
});
