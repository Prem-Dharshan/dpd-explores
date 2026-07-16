import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseCSV, extractPlaceIdFromUrl, validatePlace } from './csv-parser';
import Papa from 'papaparse';

// Mock papaparse
vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn(),
  },
}));

describe('csv-parser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseCSV', () => {
    it('should parse valid CSV data and map to RawPlace', async () => {
      // Setup mock to simulate a successful parse
      vi.mocked(Papa.parse).mockImplementation((file, options) => {
        // @ts-ignore
        options.complete({
          data: [
            { Title: 'Place 1', Note: 'A note', URL: 'http://g.co/1', Comment: 'Good' },
            { Title: 'Place 2', Note: '', URL: '', Comment: '' }, // Should still work
            { Title: '', Note: 'No title' } // Should be filtered out
          ]
        });
        return Papa; // papaparse parse returns papaparse
      });

      const file = new File(['dummy content'], 'test.csv', { type: 'text/csv' });
      const result = await parseCSV(file);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'Place 1',
        notes: 'A note',
        gmaps_url: 'http://g.co/1',
        comment: 'Good',
      });
      expect(result[1]).toEqual({
        name: 'Place 2',
        notes: undefined,
        gmaps_url: undefined,
        comment: undefined,
      });
    });

    it('should reject promise if Papa.parse triggers error callback', async () => {
      vi.mocked(Papa.parse).mockImplementation((file, options) => {
        // @ts-ignore
        options.error(new Error('Parse failure'));
        return Papa;
      });

      const file = new File(['dummy'], 'test.csv', { type: 'text/csv' });
      await expect(parseCSV(file)).rejects.toThrow('CSV parsing error: Parse failure');
    });

    it('should reject promise if a mapping error occurs inside the complete callback', async () => {
      vi.mocked(Papa.parse).mockImplementation((file, options) => {
        // @ts-ignore
        options.complete({
          data: [null] // This will cause row.Title to throw an error since row is null
        });
        return Papa;
      });

      const file = new File(['dummy'], 'test.csv', { type: 'text/csv' });
      await expect(parseCSV(file)).rejects.toThrow();
    });
  });

  describe('extractPlaceIdFromUrl', () => {
    it('should extract place ID from URL', () => {
      expect(extractPlaceIdFromUrl('https://maps.google.com/?cid=123')).toBeNull();
      expect(extractPlaceIdFromUrl('https://www.google.com/maps/place/Some+Place/data=!4m2!3m1!1s0x123:0x456')).toBe('0x123:0x456');
    });

    it('should return null for invalid URL or empty input', () => {
      expect(extractPlaceIdFromUrl('')).toBeNull();
      // @ts-ignore
      expect(extractPlaceIdFromUrl(null)).toBeNull();
    });
  });

  describe('validatePlace', () => {
    it('should return errors for missing name', () => {
      const place = { name: '' };
      expect(validatePlace(place)).toEqual(['Place name is required']);
    });

    it('should return errors for long name', () => {
      const place = { name: 'a'.repeat(256) };
      expect(validatePlace(place)).toEqual(['Place name must be less than 255 characters']);
    });

    it('should return empty array for valid place', () => {
      const place = { name: 'Valid Place' };
      expect(validatePlace(place)).toEqual([]);
    });
  });
});
