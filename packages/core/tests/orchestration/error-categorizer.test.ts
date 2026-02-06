/**
 * Tests for ErrorCategorizer — pure functions, no mocking required
 */

import {
  categorizeError,
  isRetryable,
  getRetryDelayMultiplier,
  analyzeError,
  type ErrorCategory
} from '../../src/orchestration/errors/error-categorizer'

describe('ErrorCategorizer', () => {
  // =========================================================================
  // categorizeError
  // =========================================================================

  describe('categorizeError', () => {
    describe('rate_limit', () => {
      it('should detect rate_limit from message keyword', () => {
        expect(categorizeError(new Error('rate limit exceeded'))).toBe('rate_limit')
      })

      it('should detect rate_limit from 429 status code', () => {
        const err = Object.assign(new Error('Too Many Requests'), { statusCode: 429 })
        expect(categorizeError(err)).toBe('rate_limit')
      })

      it('should detect rate_limit from "throttled" keyword', () => {
        expect(categorizeError(new Error('Request throttled by API'))).toBe('rate_limit')
      })

      it('should detect rate_limit from "too many requests" message', () => {
        expect(categorizeError(new Error('too many requests'))).toBe('rate_limit')
      })
    })

    describe('timeout', () => {
      it('should detect timeout from message keyword', () => {
        expect(categorizeError(new Error('Connection timeout'))).toBe('timeout')
      })

      it('should detect timeout from 408 status code', () => {
        const err = Object.assign(new Error('Request Timeout'), { statusCode: 408 })
        expect(categorizeError(err)).toBe('timeout')
      })

      it('should detect timeout from "deadline exceeded"', () => {
        expect(categorizeError(new Error('deadline exceeded'))).toBe('timeout')
      })
    })

    describe('validation', () => {
      it('should detect validation from message keyword', () => {
        expect(categorizeError(new Error('Validation failed for input'))).toBe('validation')
      })

      it('should detect validation from "invalid" keyword', () => {
        expect(categorizeError(new Error('Invalid input parameter'))).toBe('validation')
      })

      it('should detect validation from "schema" keyword', () => {
        expect(categorizeError(new Error('Schema mismatch in response'))).toBe('validation')
      })
    })

    describe('network', () => {
      it('should detect network from ECONNREFUSED', () => {
        expect(categorizeError(new Error('connect ECONNREFUSED 127.0.0.1:3000'))).toBe('network')
      })

      it('should detect network from ENOTFOUND', () => {
        expect(categorizeError(new Error('getaddrinfo ENOTFOUND example.com'))).toBe('network')
      })

      it('should detect network from "network" keyword', () => {
        expect(categorizeError(new Error('network error'))).toBe('network')
      })
    })

    describe('agent_error', () => {
      it('should detect agent_error from "agent error" message', () => {
        expect(categorizeError(new Error('agent execution error'))).toBe('agent_error')
      })

      it('should detect agent_error from "execution failed" message', () => {
        expect(categorizeError(new Error('execution failed with code 1'))).toBe('agent_error')
      })
    })

    describe('api_error', () => {
      it('should detect api_error from 4xx HTTP status', () => {
        const err = Object.assign(new Error('Not Found'), { statusCode: 404 })
        expect(categorizeError(err)).toBe('api_error')
      })

      it('should detect api_error from 5xx HTTP status', () => {
        const err = Object.assign(new Error('Internal Server Error'), { statusCode: 500 })
        expect(categorizeError(err)).toBe('api_error')
      })

      it('should extract HTTP status from message string', () => {
        expect(categorizeError(new Error('HTTP 503 Service Unavailable'))).toBe('api_error')
      })
    })

    describe('unknown', () => {
      it('should return unknown for unrecognized errors', () => {
        expect(categorizeError(new Error('Something completely different happened'))).toBe('unknown')
      })
    })
  })

  // =========================================================================
  // isRetryable
  // =========================================================================

  describe('isRetryable', () => {
    it.each([
      ['rate_limit', true],
      ['timeout', true],
      ['network', true],
      ['api_error', true],
      ['validation', false],
      ['agent_error', false],
      ['unknown', false],
    ] as [ErrorCategory, boolean][])('should return %s for %s', (category, expected) => {
      expect(isRetryable(category)).toBe(expected)
    })
  })

  // =========================================================================
  // getRetryDelayMultiplier
  // =========================================================================

  describe('getRetryDelayMultiplier', () => {
    it('should return 3 for rate_limit', () => {
      expect(getRetryDelayMultiplier('rate_limit')).toBe(3)
    })

    it('should return 2 for network', () => {
      expect(getRetryDelayMultiplier('network')).toBe(2)
    })

    it('should return 2 for api_error', () => {
      expect(getRetryDelayMultiplier('api_error')).toBe(2)
    })

    it('should return 1.5 for timeout', () => {
      expect(getRetryDelayMultiplier('timeout')).toBe(1.5)
    })

    it('should return 1 for unknown', () => {
      expect(getRetryDelayMultiplier('unknown')).toBe(1)
    })
  })

  // =========================================================================
  // analyzeError
  // =========================================================================

  describe('analyzeError', () => {
    it('should return combined category, retryable flag, and delay multiplier', () => {
      const result = analyzeError(new Error('rate limit exceeded'))
      expect(result).toEqual({
        category: 'rate_limit',
        retryable: true,
        delayMultiplier: 3
      })
    })

    it('should mark validation errors as non-retryable', () => {
      const result = analyzeError(new Error('Validation failed'))
      expect(result.retryable).toBe(false)
    })

    it('should mark unknown errors as non-retryable', () => {
      const result = analyzeError(new Error('Some random error'))
      expect(result.retryable).toBe(false)
      expect(result.delayMultiplier).toBe(1)
    })
  })
})
