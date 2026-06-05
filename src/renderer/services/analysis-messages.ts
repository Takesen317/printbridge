const ICC_INITIALIZATION_STATUS_MESSAGE =
  'ICC engine unavailable. Using simplified color conversion. Fallback preview is approximate and final print output may differ.'

export function getIccInitializationStatusMessage(): string {
  return ICC_INITIALIZATION_STATUS_MESSAGE
}
