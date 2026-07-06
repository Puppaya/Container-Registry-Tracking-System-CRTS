export function buildContainerQrContent(containerNumber: string): string {
  return `CRTS:${containerNumber}`
}

export function parseQrScanInput(code: string): {
  containerNumber: string
  qrContent: string
} {
  const normalized = code.trim().toUpperCase().replace(/[\s-]/g, '')

  if (normalized.startsWith('CRTS:')) {
    const containerNumber = normalized.slice(5)
    return { containerNumber, qrContent: normalized }
  }

  return {
    containerNumber: normalized,
    qrContent: buildContainerQrContent(normalized)
  }
}
