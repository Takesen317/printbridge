import { translate } from '../constants/i18n'
import type { AppLocale } from '../store/locale'

export function getIccInitializationStatusMessage(locale: AppLocale = 'en-US'): string {
  return translate(locale, 'analysis.iccFallback')
}
