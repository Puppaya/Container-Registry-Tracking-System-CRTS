import type { H3Event } from 'h3'
import ExcelJS from 'exceljs'
import PDFDocument from 'pdfkit'
import type { ReportFormat, ReportTable } from '../types/report'

function formatCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

export async function buildExcelBuffer(table: ReportTable): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Report')

  sheet.addRow([table.title])
  sheet.addRow([`Generated: ${table.generatedAt}`])
  sheet.addRow([])

  const headerRow = sheet.addRow(table.headers)
  headerRow.font = { bold: true }

  table.rows.forEach((row) => {
    sheet.addRow(row.map(formatCell))
  })

  sheet.columns.forEach((column) => {
    column.width = 18
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

export function buildPdfBuffer(table: ReportTable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 36,
      size: 'A4',
      layout: 'landscape'
    })

    const chunks: Buffer[] = []
    doc.on('data', chunk => chunks.push(Buffer.from(chunk)))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    doc.fontSize(16).text(table.title)
    doc.fontSize(9).fillColor('#666666').text(`Generated: ${table.generatedAt}`)
    doc.moveDown()
    doc.fillColor('#000000').fontSize(8)

    const line = table.headers.map(formatCell).join(' | ')
    doc.font('Helvetica-Bold').text(line)
    doc.font('Helvetica')

    table.rows.forEach((row) => {
      doc.text(row.map(formatCell).join(' | '))
    })

    doc.end()
  })
}

export function buildReportFilename(title: string, format: ReportFormat): string {
  const date = new Date().toISOString().slice(0, 10)
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `${slug}-${date}.${format === 'xlsx' ? 'xlsx' : 'pdf'}`
}

export async function sendReportResponse(
  event: H3Event,
  table: ReportTable,
  format: ReportFormat
) {
  if (format === 'json') {
    return sendSuccess(table)
  }

  const filename = buildReportFilename(table.title, format)

  if (format === 'xlsx') {
    const buffer = await buildExcelBuffer(table)
    setResponseHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    setResponseHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
    return buffer
  }

  const buffer = await buildPdfBuffer(table)
  setResponseHeader(event, 'Content-Type', 'application/pdf')
  setResponseHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
  return buffer
}
