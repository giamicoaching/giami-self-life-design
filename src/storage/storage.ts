import { LIFE_AREA_IDS, VALUE_IDS, HELP_RESOURCE_IDS, STEP_IDS, ACTION_TYPES } from '../domain/types.ts'
import type { HelpResourceId, LifeAreaId, ProgramState, StepId, ValueId } from '../domain/types.ts'
import { parseExactAge } from '../domain/ageGroup.ts'
import { isGenderId } from '../domain/demographics.ts'
import { createInitialState } from '../domain/initialState.ts'
import { createRunId, isRunId } from '../domain/runId.ts'
import { deriveCompletedSteps } from '../domain/validation.ts'

export const STORAGE_KEY = 'giami.lifeDesign.v1'
export const STORAGE_VERSION = 1 as const

export interface StorageAdapter {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isLifeAreaId(value: unknown): value is LifeAreaId {
  return typeof value === 'string' && (LIFE_AREA_IDS as readonly string[]).includes(value)
}

function isValueId(value: unknown): value is ValueId {
  return typeof value === 'string' && (VALUE_IDS as readonly string[]).includes(value)
}

function isStepId(value: unknown): value is StepId {
  return typeof value === 'string' && (STEP_IDS as readonly string[]).includes(value)
}

function isHelpResourceId(value: unknown): value is HelpResourceId {
  return typeof value === 'string' && (HELP_RESOURCE_IDS as readonly string[]).includes(value)
}

function asScore(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  const rounded = Math.round(value)
  if (rounded < 1 || rounded > 7) return null
  return rounded
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null
}

function parseAreaScores(raw: unknown): ProgramState['areaScores'] {
  const base = createInitialState().areaScores
  if (!isRecord(raw)) return base
  for (const id of LIFE_AREA_IDS) {
    const item = raw[id]
    if (!isRecord(item)) continue
    base[id] = {
      importance: asScore(item.importance),
      satisfaction: asScore(item.satisfaction),
    }
  }
  return base
}

function parseValueIds(raw: unknown): ValueId[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(isValueId)
}

export function parseProgramState(raw: unknown): ProgramState | null {
  if (!isRecord(raw)) return null
  if (raw.version !== STORAGE_VERSION) return null

  const initial = createInitialState()
  const lastVisitedStep = isStepId(raw.lastVisitedStep) ? raw.lastVisitedStep : 'home'
  const actionsRaw = Array.isArray(raw.actions) ? raw.actions : []
  const primaryRaw = raw.primaryActionIndex
  const primaryActionIndex =
    primaryRaw === 0 || primaryRaw === 1 || primaryRaw === 2 ? primaryRaw : null
  const actionType =
    typeof raw.actionType === 'string' && (ACTION_TYPES as readonly string[]).includes(raw.actionType)
      ? (raw.actionType as ProgramState['actionType'])
      : null

  const candidateValueIds = parseValueIds(raw.candidateValueIds)
  const coreValueIds = parseValueIds(raw.coreValueIds).filter((id) => candidateValueIds.includes(id))
  const goalValueIds = parseValueIds(raw.goalValueIds).filter((id) => coreValueIds.includes(id))
  const helpResources = Array.isArray(raw.helpResources)
    ? raw.helpResources.filter(isHelpResourceId)
    : []

  const selfChecksRaw = isRecord(raw.selfChecks) ? raw.selfChecks : {}
  const ageDeclined = raw.ageDeclined === true
  const storedAge = typeof raw.ageYears === 'number' ? parseExactAge(String(raw.ageYears)) : null
  const ageInputRaw = asString(raw.ageInput)
  const ageYears = ageDeclined ? null : storedAge ?? parseExactAge(ageInputRaw)
  const ageInput = ageDeclined ? '' : ageInputRaw || (ageYears !== null ? String(ageYears) : '')

  const parsed: ProgramState = {
    ...initial,
    lastVisitedStep,
    programCompleted: raw.programCompleted === true,
    updatedAt: asString(raw.updatedAt) || initial.updatedAt,
    ageInput,
    ageYears,
    ageDeclined,
    gender: isGenderId(raw.gender) ? raw.gender : null,
    runId: isRunId(raw.runId) ? raw.runId : createRunId(),
    usageStartedTracked: raw.usageStartedTracked === true,
    usageCompletedTracked: raw.usageCompletedTracked === true,
    usageSavedTracked: raw.usageSavedTracked === true,
    feedbackSubmitted: raw.feedbackSubmitted === true,
    areaScores: parseAreaScores(raw.areaScores),
    priorityAreaId: isLifeAreaId(raw.priorityAreaId) ? raw.priorityAreaId : null,
    priorityReason: asString(raw.priorityReason),
    changeIdeas: asString(raw.changeIdeas),
    candidateValueIds,
    coreValueIds,
    refinedChange: asString(raw.refinedChange),
    goalValueIds,
    goal: asString(raw.goal),
    goalPeriod: asString(raw.goalPeriod),
    goalCriteria: asString(raw.goalCriteria),
    goalFeasibility: asScore(raw.goalFeasibility),
    selfChecks: {
      trulyWanted: asBoolean(selfChecksRaw.trulyWanted),
      areaValueReflected: asBoolean(selfChecksRaw.areaValueReflected),
      specific: asBoolean(selfChecksRaw.specific),
      feasibleInPeriod: asBoolean(selfChecksRaw.feasibleInPeriod),
    },
    actions: [
      asString(actionsRaw[0]),
      asString(actionsRaw[1]),
      asString(actionsRaw[2]),
    ],
    primaryActionIndex,
    actionType,
    actionWhat: asString(raw.actionWhat),
    actionWhen: asString(raw.actionWhen),
    actionWhere: asString(raw.actionWhere),
    actionFrequencyOrDuration: asString(raw.actionFrequencyOrDuration),
    obstacle: asString(raw.obstacle),
    alternativeAction: asString(raw.alternativeAction),
    helpResources,
    helpNote: asString(raw.helpNote),
    firstActionFeasibility: asScore(raw.firstActionFeasibility),
    selfEncouragement: asString(raw.selfEncouragement),
    completedStepIds: [],
  }

  parsed.completedStepIds = deriveCompletedSteps(parsed)
  return parsed
}

export function stampState(state: ProgramState): ProgramState {
  return {
    ...state,
    completedStepIds: deriveCompletedSteps(state),
    updatedAt: new Date().toISOString(),
  }
}

export function loadProgramState(storage: StorageAdapter = localStorage): ProgramState | null {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return null
    return parseProgramState(JSON.parse(raw) as unknown)
  } catch {
    return null
  }
}

export function saveProgramState(
  state: ProgramState,
  storage: StorageAdapter = localStorage,
): void {
  const stamped = stampState(state)
  storage.setItem(STORAGE_KEY, JSON.stringify(stamped))
}

export function clearProgramState(storage: StorageAdapter = localStorage): void {
  storage.removeItem(STORAGE_KEY)
}

/** 로그인 후 게스트(localStorage) 데이터를 계정 데이터와 병합할 때 사용. 더 최근 작성을 유지한다. */
export function mergeGuestIntoAccount(
  guest: ProgramState,
  remote: ProgramState | null,
): ProgramState {
  if (!remote) return stampState(guest)
  return guest.updatedAt >= remote.updatedAt ? stampState(guest) : stampState(remote)
}
