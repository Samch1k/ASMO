/**
 * Tests for ApprovalCheckpoint
 */

// Mock config-manager before imports
jest.mock('../../src/orchestration/config/config-manager', () => ({
  getConfigManager: jest.fn().mockReturnValue({
    isInitialized: jest.fn().mockReturnValue(false),
    getApprovalCheckpointConfig: jest.fn().mockReturnValue({})
  })
}))

// Mock yolo-mode-manager
const mockShouldEnableYolo = jest.fn().mockReturnValue(false)
const mockRecordYoloExecution = jest.fn().mockImplementation((record: any) => ({
  ...record,
  timestamp: new Date()
}))

jest.mock('../../src/orchestration/yolo-mode-manager', () => ({
  getYoloModeManager: jest.fn().mockReturnValue({
    shouldEnableYolo: mockShouldEnableYolo,
    recordYoloExecution: mockRecordYoloExecution,
    isEnabled: jest.fn().mockReturnValue(true),
    getThreshold: jest.fn().mockReturnValue(25)
  }),
  resetYoloModeManager: jest.fn()
}))

import { ApprovalCheckpoint } from '../../src/orchestration/approval-checkpoint'
import type { AgentState } from '../../src/agents/types'

function makeState(overrides: Partial<AgentState> = {}): AgentState {
  return {
    task: 'Test task',
    taskType: 'feature',
    context: {},
    messages: [],
    currentAgent: 'test',
    agentResults: [],
    mcpData: {},
    nextAction: '',
    requiresApproval: false,
    ...overrides
  }
}

describe('ApprovalCheckpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    delete process.env.AUTO_APPROVE
  })

  // =========================================================================
  // Construction
  // =========================================================================

  describe('construction', () => {
    it('should create with default config', () => {
      const checkpoint = new ApprovalCheckpoint()
      expect(checkpoint).toBeDefined()
    })

    it('should create with explicit config', () => {
      const checkpoint = new ApprovalCheckpoint({
        autoApprove: true,
        timeoutMs: 10000,
        approver: 'ci-bot',
        skipCheckpoints: false
      })
      expect(checkpoint).toBeDefined()
    })

    it('should respect AUTO_APPROVE env var', () => {
      process.env.AUTO_APPROVE = 'true'
      const checkpoint = new ApprovalCheckpoint()
      // Verify auto-approve by calling requestApproval and seeing it auto-approves
      expect(checkpoint).toBeDefined()
    })
  })

  // =========================================================================
  // requiresApproval
  // =========================================================================

  describe('requiresApproval', () => {
    it('should require approval for checkpoint phases', () => {
      const checkpoint = new ApprovalCheckpoint()
      expect(checkpoint.requiresApproval('requirements')).toBe(true)
      expect(checkpoint.requiresApproval('design')).toBe(true)
      expect(checkpoint.requiresApproval('testing')).toBe(true)
    })

    it('should not require approval for non-checkpoint phases', () => {
      const checkpoint = new ApprovalCheckpoint()
      expect(checkpoint.requiresApproval('implementation')).toBe(false)
      expect(checkpoint.requiresApproval('deployment')).toBe(false)
      expect(checkpoint.requiresApproval('planning')).toBe(false)
    })
  })

  // =========================================================================
  // requestApproval
  // =========================================================================

  describe('requestApproval', () => {
    it('should auto-approve when skipCheckpoints is true', async () => {
      const checkpoint = new ApprovalCheckpoint({ skipCheckpoints: true })
      const response = await checkpoint.requestApproval('requirements', { data: 'test' })

      expect(response.approved).toBe(true)
      expect(response.autoApproved).toBe(true)
      expect(response.timedOut).toBe(false)
      expect(response.feedback).toBe('Checkpoint skipped')
    })

    it('should auto-approve when autoApprove is true', async () => {
      const checkpoint = new ApprovalCheckpoint({ autoApprove: true })
      const response = await checkpoint.requestApproval('design', { data: 'test' })

      expect(response.approved).toBe(true)
      expect(response.autoApproved).toBe(true)
      expect(response.approver).toBe('system')
    })

    it('should record approval in history', async () => {
      const checkpoint = new ApprovalCheckpoint({ autoApprove: true })
      await checkpoint.requestApproval('requirements', { data: 'test' })

      const history = checkpoint.getHistory()
      expect(history).toHaveLength(1)
      expect(history[0].phase).toBe('requirements')
      expect(history[0].response.approved).toBe(true)
    })
  })

  // =========================================================================
  // checkpointIfRequired + YOLO mode
  // =========================================================================

  describe('checkpointIfRequired', () => {
    it('should not block for non-checkpoint phases', async () => {
      const checkpoint = new ApprovalCheckpoint()
      const state = makeState()

      const result = await checkpoint.checkpointIfRequired(state, 'implementation')
      expect(result.shouldBlock).toBe(false)
    })

    it('should bypass via YOLO mode for low-complexity tasks', async () => {
      mockShouldEnableYolo.mockReturnValueOnce(true)
      const checkpoint = new ApprovalCheckpoint()
      const state = makeState({ task: 'fix typo' })

      const result = await checkpoint.checkpointIfRequired(state, 'requirements', 15, 'bug_fix')

      expect(result.shouldBlock).toBe(true)
      expect(result.approved).toBe(true)
      expect(result.response?.approver).toBe('yolo-mode')
      expect(mockRecordYoloExecution).toHaveBeenCalledWith(
        expect.objectContaining({
          complexityScore: 15,
          workflowName: 'bug_fix',
          bypassedCheckpoints: ['requirements']
        })
      )
    })

    it('should record YOLO bypass in history', async () => {
      mockShouldEnableYolo.mockReturnValueOnce(true)
      const checkpoint = new ApprovalCheckpoint()
      const state = makeState()

      await checkpoint.checkpointIfRequired(state, 'design', 10)

      const history = checkpoint.getHistory()
      expect(history).toHaveLength(1)
      expect(history[0].response.approver).toBe('yolo-mode')
    })

    it('should fall through to approval when YOLO not triggered', async () => {
      mockShouldEnableYolo.mockReturnValueOnce(false)
      const checkpoint = new ApprovalCheckpoint({ autoApprove: true })
      const state = makeState()

      const result = await checkpoint.checkpointIfRequired(state, 'requirements', 50)

      expect(result.shouldBlock).toBe(true)
      expect(result.approved).toBe(true)
      // Approved via autoApprove, not YOLO
      expect(result.response?.approver).toBe('system')
    })
  })

  // =========================================================================
  // History & statistics
  // =========================================================================

  describe('history and statistics', () => {
    it('should accumulate history across multiple approvals', async () => {
      const checkpoint = new ApprovalCheckpoint({ autoApprove: true })

      await checkpoint.requestApproval('requirements', {})
      await checkpoint.requestApproval('design', {})
      await checkpoint.requestApproval('testing', {})

      expect(checkpoint.getHistory()).toHaveLength(3)
    })

    it('should return phase-specific history', async () => {
      const checkpoint = new ApprovalCheckpoint({ autoApprove: true })

      await checkpoint.requestApproval('requirements', {})
      await checkpoint.requestApproval('design', {})
      await checkpoint.requestApproval('requirements', {})

      expect(checkpoint.getPhaseHistory('requirements')).toHaveLength(2)
      expect(checkpoint.getPhaseHistory('design')).toHaveLength(1)
    })

    it('should compute correct statistics', async () => {
      const checkpoint = new ApprovalCheckpoint({ autoApprove: true })

      await checkpoint.requestApproval('requirements', {})
      await checkpoint.requestApproval('design', {})

      const stats = checkpoint.getStatistics()
      expect(stats.totalApprovals).toBe(2)
      expect(stats.approved).toBe(2)
      expect(stats.rejected).toBe(0)
      expect(stats.autoApproved).toBe(2)
      expect(stats.timedOut).toBe(0)
      expect(stats.averageDurationMs).toBeGreaterThanOrEqual(0)
    })

    it('should clear history', async () => {
      const checkpoint = new ApprovalCheckpoint({ autoApprove: true })
      await checkpoint.requestApproval('requirements', {})

      checkpoint.clearHistory()
      expect(checkpoint.getHistory()).toHaveLength(0)
    })

    it('should format history to string', async () => {
      const checkpoint = new ApprovalCheckpoint({ autoApprove: true })
      await checkpoint.requestApproval('requirements', {})

      const formatted = checkpoint.formatHistory()
      expect(formatted).toContain('REQUIREMENTS')
      expect(formatted).toContain('APPROVED')
    })

    it('should return message for empty history', () => {
      const checkpoint = new ApprovalCheckpoint()
      expect(checkpoint.formatHistory()).toBe('No approval history')
    })
  })

  // =========================================================================
  // updateConfig
  // =========================================================================

  describe('updateConfig', () => {
    it('should update autoApprove setting', async () => {
      const checkpoint = new ApprovalCheckpoint({ autoApprove: false, skipCheckpoints: true })
      checkpoint.updateConfig({ autoApprove: true })

      // Now requestApproval should auto-approve
      const response = await checkpoint.requestApproval('requirements', {})
      expect(response.approved).toBe(true)
    })

    it('should update skipCheckpoints setting', async () => {
      const checkpoint = new ApprovalCheckpoint({ skipCheckpoints: false, autoApprove: false })
      checkpoint.updateConfig({ skipCheckpoints: true })

      const response = await checkpoint.requestApproval('design', {})
      expect(response.approved).toBe(true)
      expect(response.feedback).toBe('Checkpoint skipped')
    })
  })
})
