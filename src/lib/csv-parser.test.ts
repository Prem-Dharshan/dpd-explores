import { describe, it, expect } from 'vitest';
import { extractPlaceIdFromUrl } from './csv-parser';

describe('extractPlaceIdFromUrl', () => {
  it('should extract the place ID from a valid URL', () => {
    const url = 'https://www.google.com/maps/place/Name/data=!4m2!3m1!1s0x1234567890abcdef:0xabcdef1234567890';
    const result = extractPlaceIdFromUrl(url);
    expect(result).toBe('0x1234567890abcdef:0xabcdef1234567890');
  });

  it('should return null for an invalid URL without the CID format', () => {
    const url = 'https://www.google.com/maps/place/Name/data=!4m2!3m1!';
    const result = extractPlaceIdFromUrl(url);
    expect(result).toBeNull();
  });

  it('should return null for an empty string', () => {
    const result = extractPlaceIdFromUrl('');
    expect(result).toBeNull();
  });

  it('should return null for undefined', () => {
    // @ts-expect-error - testing invalid input
    const result = extractPlaceIdFromUrl(undefined);
    expect(result).toBeNull();
  });

  it('should extract the place ID from a URL with additional parameters', () => {
    const url = 'https://www.google.com/maps/place/Name/data=!4m2!3m1!1s0x123:0x456!8m2!3d12.34!4d56.78';
    const result = extractPlaceIdFromUrl(url);
    expect(result).toBe('0x123:0x456');
  });
});
