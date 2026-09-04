import { describe, expect, it } from 'vitest'
import { createRunId, isRunId } from './runId.ts'

describe('createRunId', () => {
  it('creates an anonymous UUID without personal data', () => {
    const runId = createRunId()
    expect(isRunId(runId)).toBe(true)
    expect(runId).not.toMatch(/@|gmail|name|email|\d{1,3}(?:\.\d{1,3}){3}/i)
    expect(createRunId()).not.toBe(runId)
  })

  it('rejects values that are not UUIDs', () => {
    expect(isRunId('not-a-uuid')).toBe(false)
    expect(isRunId('67')).toBe(false)
    expect(isRunId(null)).toBe(false)
  })
})
