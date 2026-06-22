import { translate } from '../constants/i18n'
import type { AppLocale } from '../store/locale'
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

function getPreflightPrefix(input: PreflightDescriptionInput, locale: AppLocale): string {
  if (input.category === 'deterministic') {
    return translate(locale, 'preflight.deterministic')
  }

  if (input.category === 'heuristic') {
    if (input.confidence === 'high') {
      return translate(locale, 'preflight.heuristic.high')
    }

    if (input.confidence === 'medium') {
      return translate(locale, 'preflight.heuristic.medium')
    }

    return translate(locale, 'preflight.heuristic.low')
  }

  if (input.confidence === 'high') {
    return translate(locale, 'preflight.advisory.high')
  }

  if (input.confidence === 'medium') {
    return translate(locale, 'preflight.advisory.medium')
  }

  return translate(locale, 'preflight.advisory.low')
}

export function formatPreflightDescription(input: PreflightDescriptionInput, locale: AppLocale = 'en-US'): string {
  return `${getPreflightPrefix(input, locale)} ${input.detail}`
}
