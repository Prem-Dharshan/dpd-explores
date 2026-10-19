import { describe, it, expect } from 'vitest';
import { getGmapsUrl } from './gmaps';

describe('getGmapsUrl', () => {
  it('returns gmaps_url when it is provided', () => {
    const place = { gmaps_url: 'https://maps.google.com/?cid=123', name: 'Test Place' };
    expect(getGmapsUrl(place)).toBe('https://maps.google.com/?cid=123');
  });

  it('returns a place_id deep link when gmaps_url is missing but place_id is provided', () => {
    const place = { place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4', name: 'Test Place' };
    expect(getGmapsUrl(place)).toBe('https://www.google.com/maps/place/?q=place_id:ChIJN1t_tDeuEmsRUsoyG83frY4');
  });

  it('falls back to a name search query when both gmaps_url and place_id are missing', () => {
    const place = { name: 'Test Place' };
    expect(getGmapsUrl(place)).toBe('https://www.google.com/maps/search/?api=1&query=Test%20Place');
  });

  it('properly encodes special characters in the name during fallback', () => {
    const place = { name: 'Cafe & Restaurant (Best)!' };
    expect(getGmapsUrl(place)).toBe('https://www.google.com/maps/search/?api=1&query=Cafe%20%26%20Restaurant%20(Best)!');
  });
});
