import { describe, it, expect } from 'vitest'
import { validatePlace } from './csv-parser'
import type { RawPlace } from '@/types'

describe('validatePlace', () => {
  it('should return an empty array for a valid place', () => {
    const validPlace: RawPlace = {
      name: 'Central Park',
      notes: 'A great park',
      gmaps_url: 'https://maps.google.com/etc',
      comment: 'Loved it'
    }
    const errors = validatePlace(validPlace)
    expect(errors).toEqual([])
  })

  it('should return an error when name is empty', () => {
    const invalidPlace: RawPlace = {
      name: '',
    }
    const errors = validatePlace(invalidPlace)
    expect(errors).toEqual(['Place name is required'])
  })

  it('should return an error when name is undefined', () => {
    const invalidPlace = {
      notes: 'No name provided'
    } as RawPlace
    const errors = validatePlace(invalidPlace)
    expect(errors).toEqual(['Place name is required'])
  })

  it('should return an error when name is greater than 255 characters', () => {
    const invalidPlace: RawPlace = {
      name: 'a'.repeat(256),
    }
    const errors = validatePlace(invalidPlace)
    expect(errors).toEqual(['Place name must be less than 255 characters'])
  })

  it('should return an empty array for a name exactly 255 characters', () => {
    const validPlace: RawPlace = {
      name: 'a'.repeat(255),
    }
    const errors = validatePlace(validPlace)
    expect(errors).toEqual([])
  })
})
