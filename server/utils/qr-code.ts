import QRCode from 'qrcode'

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

export async function generateQrCodeDataUrl(content: string): Promise<string> {
  return QRCode.toDataURL(content, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 256
  })
}

export async function generateContainerQrCodeDataUrl(containerNumber: string): Promise<string> {
  return generateQrCodeDataUrl(buildContainerQrContent(containerNumber))
}
