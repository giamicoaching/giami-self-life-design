const HANGUL_START = 0xac00
const HANGUL_END = 0xd7a3

function lastHangul(text: string): string | null {
  for (let i = text.length - 1; i >= 0; i -= 1) {
    const code = text.charCodeAt(i)
    if (code >= HANGUL_START && code <= HANGUL_END) {
      return text[i] ?? null
    }
  }
  return null
}

export function hasBatchim(text: string): boolean {
  const ch = lastHangul(text)
  if (!ch) return false
  return (ch.charCodeAt(0) - HANGUL_START) % 28 !== 0
}

export function eulReul(text: string): string {
  return hasBatchim(text) ? '을' : '를'
}

export function gwaWa(text: string): string {
  return hasBatchim(text) ? '과' : '와'
}

const WHERE_HAS_PARTICLE = /(에서|에|으로|로|께)$/

export function attachWhereParticle(where: string): string {
  const text = where.trim()
  if (!text) return ''
  if (WHERE_HAS_PARTICLE.test(text)) return text
  return `${text}에서`
}

function stripTrailingPunctuation(text: string): string {
  return text.trim().replace(/[.。!?！？]+$/u, '')
}

export function formatActionVerb(what: string): string {
  const text = stripTrailingPunctuation(what)
  if (!text) return ''
  if (/다$/.test(text)) return text
  if (/(을|를)$/.test(text) || /(을|를)\s+\S+$/.test(text)) {
    return `${text}한다`
  }
  return `${text}${eulReul(text)} 한다`
}

function insertBeforeHanda(sentence: string, extra: string): string {
  const piece = extra.trim()
  if (!piece) return sentence
  if (sentence.endsWith('한다')) {
    return `${sentence.slice(0, -2).trimEnd()} ${piece} 한다`
  }
  return `${sentence} ${piece}`
}

export interface ActionSentenceInput {
  what: string
  when: string
  where: string
  actionType: 'once' | 'repeat' | null
  frequencyOrDuration: string
}

export function composeActionSentence(input: ActionSentenceInput): string {
  const when = input.when.trim()
  const where = attachWhereParticle(input.where)
  let actionPart = formatActionVerb(input.what)
  if (!actionPart) return ''

  const extra = input.frequencyOrDuration.trim()
  if (input.actionType === 'once' && extra) {
    actionPart = insertBeforeHanda(actionPart, extra)
  }

  const timeBits = [
    input.actionType === 'repeat' && extra ? extra : '',
    when,
  ].filter(Boolean)
  const timePart = timeBits.join(', ')

  const afterTime = [where, actionPart].filter(Boolean).join(' ')
  const body = timePart ? `${timePart}, ${afterTime}` : afterTime
  return stripTrailingPunctuation(`나는 ${body}`.replace(/\s+,/g, ',').replace(/\s{2,}/g, ' '))
}

export function composeCopingPlanNatural(obstacle: string, alternative: string): string {
  const obstacleText = obstacle.trim()
  const alternativeText = alternative.trim()
  if (!obstacleText && !alternativeText) return ''

  const obstaclePhrase = attachObstacle(obstacleText)
  const alternativePhrase = formatActionVerb(alternativeText) || '해당 없음을 적용한다'
  return `만약 ${obstaclePhrase} 생기면, ${alternativePhrase}.`
}

function attachObstacle(obstacle: string): string {
  if (!obstacle) return '상황이'
  if (/(이|가)$/.test(obstacle)) return obstacle
  return `${obstacle}${hasBatchim(obstacle) ? '이' : '가'}`
}
