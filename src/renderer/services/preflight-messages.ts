import type { ProblemCategory, ProblemConfidence } from './print-checker'

type DeterministicDescriptionInput = {
  category: 'deterministic'
  detail: string
}

type NonDeterministicDescriptionInput = {
  category: Exclude<ProblemCategory, 'deterministic'>
  confidence: ProblemConfidence
  detail: string
}

export type PreflightDescriptionInput =
  | DeterministicDescriptionInput
  | NonDeterministicDescriptionInput

function getPreflightPrefix(input: PreflightDescriptionInput): string {
  if (input.category === 'deterministic') {
    return 'Confirmed by deterministic checks.'
  }

  if (input.category === 'heuristic') {
    if (input.confidence === 'high') {
      return 'Flagged by a heuristic check, but confidence is still an estimate.'
    }

    if (input.confidence === 'medium') {
      return 'Flagged by a heuristic check, so confidence is moderate.'
    }

    return 'Flagged by a heuristic check, so confidence is limited.'
  }

  if (input.confidence === 'high') {
    return 'Advisory only, even though the signal is strong.'
  }

  if (input.confidence === 'medium') {
    return 'Advisory only; review is still recommended.'
  }

  return 'Advisory only; confidence is limited because this check cannot confirm document intent.'
}

export function formatPreflightDescription(input: PreflightDescriptionInput): string {
  return `${getPreflightPrefix(input)} ${input.detail}`
}
