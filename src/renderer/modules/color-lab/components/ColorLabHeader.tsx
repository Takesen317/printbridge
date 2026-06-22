import { translate } from '../../../constants/i18n'
import { useLocaleStore } from '../../../store/locale'

export default function ColorLabHeader() {
  const locale = useLocaleStore((state) => state.locale)

  return (
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, marginBottom: 8 }}>
        {translate(locale, 'colorLab.title')}
      </h1>
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>
        {translate(locale, 'colorLab.description')}
      </p>
    </div>
  )
}
