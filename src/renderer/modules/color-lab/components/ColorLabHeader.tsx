export default function ColorLabHeader() {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, marginBottom: 8 }}>Color Lab</h1>
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>
        Import an image, inspect representative color shifts, and preview a soft-proof style output.
      </p>
    </div>
  )
}
