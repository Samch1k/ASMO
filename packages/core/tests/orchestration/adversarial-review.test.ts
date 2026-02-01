import { AdversarialReviewSession } from '../../src/orchestration/adversarial-review'

/**
 * Tests for BMAD Integration: Adversarial Review
 */
describe('BMAD Integration: Adversarial Review', () => {
  describe('AdversarialReviewSession', () => {
    it('should be importable', () => {
      expect(AdversarialReviewSession).toBeDefined()
      expect(typeof AdversarialReviewSession).toBe('function')
    })

    it('should instantiate with default config', () => {
      const session = new AdversarialReviewSession()
      expect(session).toBeDefined()
    })

    it('should instantiate with custom config', () => {
      const session = new AdversarialReviewSession({
        minIssuesRequired: 2,
        maxRetries: 5,
        blockingSeverities: ['critical'],
        verbose: true
      })
      expect(session).toBeDefined()
    })

    it('should have executeReview method', () => {
      const session = new AdversarialReviewSession()
      expect(typeof session.executeReview).toBe('function')
    })

    it('should have quickReview method', () => {
      const session = new AdversarialReviewSession()
      expect(typeof session.quickReview).toBe('function')
    })

    it('should have validateArtifact method', () => {
      const session = new AdversarialReviewSession()
      expect(typeof session.validateArtifact).toBe('function')
    })
  })
})
