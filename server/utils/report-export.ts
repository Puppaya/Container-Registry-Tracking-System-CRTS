import type { H3Event } from 'h3'
import ExcelJS from 'exceljs'
import PDFDocument from 'pdfkit'
import { format } from 'date-fns'
import type { ReportFormat, ReportTable } from '../types/report'

const PDF_MARGIN = 36
const PDF_CELL_PADDING = 6
const PDF_MIN_ROW_HEIGHT = 22
const PDF_HEADER_HEIGHT = 28
const PDF_TITLE_COLOR = '#003d9b'
const PDF_HEADER_BG = '#003d9b'
const PDF_HEADER_TEXT = '#ffffff'
const PDF_BORDER = '#d8d6e5'
const PDF_ALT_ROW_BG = '#f3f3fd'
const PDF_MUTED = '#666666'

function formatCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

function formatGeneratedAt(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return format(date, 'dd/MM/yyyy HH:mm')
}

function getPdfContentWidth(doc: PDFKit.PDFDocument): number {
  return doc.page.width - PDF_MARGIN * 2
}

function getPdfContentBottom(doc: PDFKit.PDFDocument): number {
  return doc.page.height - PDF_MARGIN - 18
}

function calculateColumnWidths(
  doc: PDFKit.PDFDocument,
  table: ReportTable,
  contentWidth: number
): number[] {
  const columnCount = table.headers.length
  if (columnCount === 0) return []

  doc.font('Helvetica').fontSize(8)

  const minWidths = table.headers.map((header, index) => {
    let maxWidth = doc.widthOfString(header)

    for (const row of table.rows) {
      const cell = formatCell(row[index])
      maxWidth = Math.max(maxWidth, doc.widthOfString(cell))
    }

    return Math.min(maxWidth + PDF_CELL_PADDING * 2, contentWidth * 0.45)
  })

  const totalMinWidth = minWidths.reduce((sum, width) => sum + width, 0)

  if (totalMinWidth >= contentWidth) {
    const scale = contentWidth / totalMinWidth
    return minWidths.map(width => width * scale)
  }

  const extra = contentWidth - totalMinWidth
  return minWidths.map((width) => {
    const share = width / totalMinWidth
    return width + extra * share
  })
}

function measureRowHeight(
  doc: PDFKit.PDFDocument,
  row: Array<string | number | null>,
  columnWidths: number[],
  font: 'Helvetica' | 'Helvetica-Bold' = 'Helvetica'
): number {
  doc.font(font).fontSize(8)

  let maxHeight = PDF_MIN_ROW_HEIGHT

  row.forEach((value, index) => {
    const text = formatCell(value)
    const textWidth = columnWidths[index] - PDF_CELL_PADDING * 2
    const height = doc.heightOfString(text, { width: textWidth }) + PDF_CELL_PADDING * 2
    maxHeight = Math.max(maxHeight, height)
  })

  return maxHeight
}

function drawPdfPageFooter(doc: PDFKit.PDFDocument, pageNumber: number) {
  const contentWidth = getPdfContentWidth(doc)
  doc.font('Helvetica')
    .fontSize(7)
    .fillColor(PDF_MUTED)
    .text(`Page ${pageNumber}`, PDF_MARGIN, doc.page.height - PDF_MARGIN, {
      width: contentWidth,
      align: 'right'
    })
}

function drawPdfTableHeader(
  doc: PDFKit.PDFDocument,
  table: ReportTable,
  columnWidths: number[],
  startX: number,
  startY: number
): number {
  const rowHeight = PDF_HEADER_HEIGHT
  let x = startX

  table.headers.forEach((header, index) => {
    const width = columnWidths[index]

    doc.save()
    doc.rect(x, startY, width, rowHeight).fill(PDF_HEADER_BG)
    doc.restore()

    doc.font('Helvetica-Bold')
      .fontSize(8)
      .fillColor(PDF_HEADER_TEXT)
      .text(header, x + PDF_CELL_PADDING, startY + PDF_CELL_PADDING, {
        width: width - PDF_CELL_PADDING * 2,
        align: 'left'
      })

    doc.strokeColor(PDF_BORDER)
      .lineWidth(0.5)
      .rect(x, startY, width, rowHeight)
      .stroke()

    x += width
  })

  return startY + rowHeight
}

function drawPdfTableRow(
  doc: PDFKit.PDFDocument,
  row: Array<string | number | null>,
  columnWidths: number[],
  startX: number,
  startY: number,
  rowIndex: number
): number {
  const rowHeight = measureRowHeight(doc, row, columnWidths)
  let x = startX

  if (rowIndex % 2 === 1) {
    doc.save()
    doc.rect(startX, startY, columnWidths.reduce((sum, width) => sum + width, 0), rowHeight)
      .fill(PDF_ALT_ROW_BG)
    doc.restore()
  }

  row.forEach((value, index) => {
    const width = columnWidths[index]
    const text = formatCell(value)

    doc.font('Helvetica')
      .fontSize(8)
      .fillColor('#111111')
      .text(text, x + PDF_CELL_PADDING, startY + PDF_CELL_PADDING, {
        width: width - PDF_CELL_PADDING * 2,
        align: 'left'
      })

    doc.strokeColor(PDF_BORDER)
      .lineWidth(0.5)
      .rect(x, startY, width, rowHeight)
      .stroke()

    x += width
  })

  return startY + rowHeight
}

function drawPdfReportHeader(doc: PDFKit.PDFDocument, table: ReportTable): number {
  const contentWidth = getPdfContentWidth(doc)

  doc.font('Helvetica-Bold')
    .fontSize(16)
    .fillColor(PDF_TITLE_COLOR)
    .text(table.title, PDF_MARGIN, PDF_MARGIN, { width: contentWidth })

  doc.font('Helvetica')
    .fontSize(9)
    .fillColor(PDF_MUTED)
    .text(`Generated: ${formatGeneratedAt(table.generatedAt)}`, PDF_MARGIN, doc.y + 4, {
      width: contentWidth
    })

  doc.moveDown(1.2)
  return doc.y
}

export async function buildExcelBuffer(table: ReportTable): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Report')

  sheet.addRow([table.title])
  sheet.addRow([`Generated: ${formatGeneratedAt(table.generatedAt)}`])
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
      margin: PDF_MARGIN,
      size: 'A4',
      layout: 'landscape',
      bufferPages: true
    })

    const chunks: Buffer[] = []
    doc.on('data', chunk => chunks.push(Buffer.from(chunk)))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const startX = PDF_MARGIN
    const contentWidth = getPdfContentWidth(doc)
    const columnWidths = calculateColumnWidths(doc, table, contentWidth)
    const contentBottom = getPdfContentBottom(doc)

    let cursorY = drawPdfReportHeader(doc, table)
    let pageNumber = 1

    cursorY = drawPdfTableHeader(doc, table, columnWidths, startX, cursorY)

    table.rows.forEach((row, rowIndex) => {
      const rowHeight = measureRowHeight(doc, row, columnWidths)

      if (cursorY + rowHeight > contentBottom) {
        drawPdfPageFooter(doc, pageNumber)
        doc.addPage({ layout: 'landscape', margin: PDF_MARGIN })
        pageNumber += 1
        cursorY = PDF_MARGIN
        cursorY = drawPdfTableHeader(doc, table, columnWidths, startX, cursorY)
      }

      cursorY = drawPdfTableRow(doc, row, columnWidths, startX, cursorY, rowIndex)
    })

    if (table.rows.length === 0) {
      const emptyHeight = PDF_MIN_ROW_HEIGHT
      doc.save()
      doc.rect(startX, cursorY, contentWidth, emptyHeight).fill('#fafafa')
      doc.restore()
      doc.font('Helvetica')
        .fontSize(8)
        .fillColor(PDF_MUTED)
        .text('No data available', startX + PDF_CELL_PADDING, cursorY + PDF_CELL_PADDING, {
          width: contentWidth - PDF_CELL_PADDING * 2
        })
      doc.strokeColor(PDF_BORDER)
        .lineWidth(0.5)
        .rect(startX, cursorY, contentWidth, emptyHeight)
        .stroke()
    }

    drawPdfPageFooter(doc, pageNumber)
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
