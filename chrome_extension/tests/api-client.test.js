/**
 * Unit tests for API client
 */

import { describe, it, expect, vi } from 'vitest';
import { factCheckWithGemini, factCheckWithOpenAI } from '../src/utils/api-client.js';

// Mock global fetch
global.fetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('factCheckWithGemini', () => {
    it('should make correct API call', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{ text: 'Test response' }]
          }
        }]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await factCheckWithGemini('test text', 'test-key');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('generativelanguage.googleapis.com'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );

      expect(result).toHaveProperty('summary', 'Test response');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('model', 'gemini-1.5-flash');
    });

    it('should throw error on API failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: { message: 'Not found' } })
      });

      await expect(
        factCheckWithGemini('test', 'bad-key')
      ).rejects.toThrow('Gemini API error');
    });
  });

  describe('factCheckWithOpenAI', () => {
    it('should make correct API call', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Test response'
          }
        }]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await factCheckWithOpenAI('test text', 'test-key');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key'
          })
        })
      );

      expect(result).toHaveProperty('summary', 'Test response');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('model', 'gpt-4o');
    });
  });
});

