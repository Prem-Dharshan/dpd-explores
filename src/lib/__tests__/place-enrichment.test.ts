import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('place-enrichment', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('enrichPlaceFromAPI', () => {
    it('should return error when GMAPS_API_KEY is not configured', async () => {
      // Stub the environment variable to be empty
      vi.stubEnv('VITE_GMAPS_API_KEY', '')

      // Import dynamically to pick up the stubbed env var
      const { enrichPlaceFromAPI } = await import('../place-enrichment')

      const mockPlace = {
        name: 'Test Place',
        gmaps_url: 'https://maps.google.com/place/Test/data=!4m2!3m1!1s0x123:0x456'
      }

      const result = await enrichPlaceFromAPI(mockPlace, 'user-1')

      expect(result.error).toBe('GMAPS_API_KEY not configured')
      expect(result.enriched).toEqual({
        name: 'Test Place',
        gmaps_url: 'https://maps.google.com/place/Test/data=!4m2!3m1!1s0x123:0x456',
        user_id: 'user-1'
      })
    })

    it('should proceed if GMAPS_API_KEY is configured', async () => {
      vi.stubEnv('VITE_GMAPS_API_KEY', 'fake-api-key')

      const { enrichPlaceFromAPI } = await import('../place-enrichment')

      // Mock fetch to simulate failure extracting place ID or a successful API call
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          formattedAddress: '123 Test St',
        })
      });

      const mockPlace = {
        name: 'Test Place',
        gmaps_url: 'https://maps.google.com/place/Test/data=!4m2!3m1!1s0x123:0x456'
      }

      const result = await enrichPlaceFromAPI(mockPlace, 'user-1')

      expect(result.error).toBeUndefined()
      expect(result.enriched.address).toBe('123 Test St')
    })
  })
})
