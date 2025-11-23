/**
 * Unit tests for storage utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSettings, saveSettings, getHistory, saveToHistory, clearHistory } from '../src/utils/storage.js';

// Mock chrome.storage API
global.chrome = {
  storage: {
    sync: {
      get: vi.fn(),
      set: vi.fn()
    },
    local: {
      get: vi.fn(),
      set: vi.fn()
    }
  }
};

describe('Storage Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSettings', () => {
    it('should return default settings if none exist', async () => {
      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({});
      });

      const settings = await getSettings();

      expect(settings).toEqual({
        geminiApiKey: '',
        openaiApiKey: '',
        preferredModel: 'gemini'
      });
    });

    it('should return saved settings', async () => {
      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          geminiApiKey: 'test-key',
          openaiApiKey: 'test-key-2',
          preferredModel: 'openai'
        });
      });

      const settings = await getSettings();

      expect(settings.geminiApiKey).toBe('test-key');
      expect(settings.preferredModel).toBe('openai');
    });
  });

  describe('saveSettings', () => {
    it('should save settings to chrome.storage', async () => {
      chrome.storage.sync.set.mockImplementation((data, callback) => {
        callback();
      });

      await saveSettings({
        geminiApiKey: 'new-key',
        preferredModel: 'gemini'
      });

      expect(chrome.storage.sync.set).toHaveBeenCalledWith(
        expect.objectContaining({ geminiApiKey: 'new-key' }),
        expect.any(Function)
      );
    });
  });

  describe('getHistory', () => {
    it('should return empty array if no history', async () => {
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({});
      });

      const history = await getHistory();

      expect(history).toEqual([]);
    });
  });

  describe('saveToHistory', () => {
    it('should add item to history', async () => {
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ history: [] });
      });

      chrome.storage.local.set.mockImplementation((data, callback) => {
        callback();
      });

      const item = {
        text: 'Test',
        result: 'Result',
        score: 0.8,
        timestamp: Date.now()
      };

      await saveToHistory(item);

      expect(chrome.storage.local.set).toHaveBeenCalled();
    });

    it('should trim history to 50 items', async () => {
      const largeHistory = Array(60).fill(null).map((_, i) => ({
        text: `Item ${i}`,
        timestamp: Date.now()
      }));

      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ history: largeHistory });
      });

      chrome.storage.local.set.mockImplementation((data, callback) => {
        expect(data.history.length).toBe(50);
        callback();
      });

      await saveToHistory({ text: 'New item', timestamp: Date.now() });
    });
  });
});

