import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

// POST /api/dashboard/events/wedding-card-template
// Generates a PDF wedding invitation card with event data
export async function POST(request: NextRequest) {
  try {
    const { templateType, eventData } = await request.json()

    if (!templateType || !eventData) {
      return NextResponse.json({ error: 'templateType and eventData are required' }, { status: 400 })
    }

    // Generate QR code as base64 image
    let qrCodeDataUrl: string
    try {
      qrCodeDataUrl = await QRCode.toDataURL(eventData.rsvpUrl, {
        width: 120,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
    } catch (qrError) {
      qrCodeDataUrl = ''
    }

    // Generate PDF content using jsPDF
    const pdfData = await generateWeddingCardPDF(templateType, eventData, qrCodeDataUrl)
    
    return new NextResponse(new Uint8Array(pdfData), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="wedding-invitation-${templateType}-${eventData.coupleNames.replace(/\s+/g, '-')}.pdf"`
      }
    })

  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate wedding card template' }, { status: 500 })
  }
}

async function generateWeddingCardPDF(templateType: string, eventData: any, qrCodeDataUrl: string): Promise<Buffer> {
  // Dynamic import to avoid SSR issues
  const { jsPDF } = await import('jspdf')
  
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [210, 148] // A5 landscape size
  })
  
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Helper function to add text with wrapping
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12, color: string = '#000000', align: 'left' | 'center' | 'right' = 'left') => {
    doc.setFontSize(fontSize)
    doc.setTextColor(color)
    
    const lines = doc.splitTextToSize(text, maxWidth)
    let textY = y
    
    lines.forEach((line: string) => {
      if (align === 'center') {
        const textWidth = doc.getTextWidth(line)
        const textX = (pageWidth - textWidth) / 2
        doc.text(line, textX, textY)
      } else {
        doc.text(line, x, textY)
      }
      textY += fontSize * 0.4
    })
    
    return textY
  }

  // Helper function to add QR code
  const addQRCode = (dataUrl: string, x: number, y: number, size: number) => {
    if (dataUrl) {
      doc.addImage(dataUrl, 'PNG', x, y, size, size)
    }
  }

  // Helper function to draw decorative border
  const drawBorder = (color: string, thickness: number = 1) => {
    doc.setDrawColor(color)
    doc.setLineWidth(thickness)
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10)
  }

  // Format the event date
  const formattedDate = new Date(eventData.eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Template-specific layouts
  switch (templateType) {
    case 'elegant-classic':
      // Elegant Classic Template
      drawBorder('#E5B574', 2)
      
      // Background gradient effect (simulated with multiple rectangles)
      doc.setFillColor(245, 181, 116, 0.1)
      doc.rect(0, 0, pageWidth, pageHeight, 'F')
      
      // Main title
      addText('You\'re Invited', pageWidth/2, 25, pageWidth - 20, 18, '#8B4513', 'center')
      addText('To the Wedding of', pageWidth/2, 35, pageWidth - 20, 12, '#8B4513', 'center')
      
      // Couple names
      addText(eventData.coupleNames, pageWidth/2, 50, pageWidth - 20, 22, '#2F1B14', 'center')
      
      // Date
      addText(formattedDate, pageWidth/2, 65, pageWidth - 20, 14, '#8B4513', 'center')
      
      // Venue
      if (eventData.venue) {
        addText(eventData.venue, pageWidth/2, 75, pageWidth - 20, 12, '#8B4513', 'center')
      }
      
      // RSVP instructions
      addText('Please RSVP by scanning the QR code', pageWidth/2, 90, pageWidth - 20, 10, '#8B4513', 'center')
      
      // QR Code
      addQRCode(qrCodeDataUrl, pageWidth/2 - 15, 100, 30)
      
      // Footer
      addText('We can\'t wait to celebrate with you!', pageWidth/2, 140, pageWidth - 20, 10, '#8B4513', 'center')
      break

    case 'modern-minimal':
      // Modern Minimal Template
      drawBorder('#666666', 1)
      
      // Main title
      addText('INVITATION', pageWidth/2, 30, pageWidth - 20, 16, '#333333', 'center')
      
      // Couple names
      addText(eventData.coupleNames, pageWidth/2, 50, pageWidth - 20, 20, '#000000', 'center')
      
      // Date
      addText(formattedDate, pageWidth/2, 65, pageWidth - 20, 12, '#666666', 'center')
      
      // Venue
      if (eventData.venue) {
        addText(eventData.venue, pageWidth/2, 75, pageWidth - 20, 10, '#666666', 'center')
      }
      
      // QR Code
      addQRCode(qrCodeDataUrl, pageWidth/2 - 15, 90, 30)
      
      // RSVP text
      addText('RSVP', pageWidth/2, 125, pageWidth - 20, 10, '#333333', 'center')
      break

    case 'romantic-floral':
      // Romantic Floral Template
      drawBorder('#D946EF', 2)
      
      // Background color
      doc.setFillColor(255, 182, 193, 0.1)
      doc.rect(0, 0, pageWidth, pageHeight, 'F')
      
      // Main title
      addText('Wedding Invitation', pageWidth/2, 25, pageWidth - 20, 14, '#8B008B', 'center')
      
      // Couple names
      addText(eventData.coupleNames, pageWidth/2, 45, pageWidth - 20, 18, '#8B008B', 'center')
      
      // Date
      addText(formattedDate, pageWidth/2, 60, pageWidth - 20, 12, '#D946EF', 'center')
      
      // Venue
      if (eventData.venue) {
        addText(eventData.venue, pageWidth/2, 70, pageWidth - 20, 10, '#D946EF', 'center')
      }
      
      // QR Code
      addQRCode(qrCodeDataUrl, pageWidth/2 - 15, 85, 30)
      
      // Romantic message
      addText('Join us for a magical celebration', pageWidth/2, 120, pageWidth - 20, 10, '#8B008B', 'center')
      addText('Please RSVP below', pageWidth/2, 130, pageWidth - 20, 9, '#D946EF', 'center')
      break

    case 'rustic-vintage':
      // Rustic Vintage Template
      drawBorder('#8B4513', 3)
      
      // Background
      doc.setFillColor(139, 69, 19, 0.05)
      doc.rect(0, 0, pageWidth, pageHeight, 'F')
      
      // Main title
      addText('Wedding Celebration', pageWidth/2, 25, pageWidth - 20, 14, '#8B4513', 'center')
      
      // Couple names
      addText(eventData.coupleNames, pageWidth/2, 45, pageWidth - 20, 18, '#2F1B14', 'center')
      
      // Date
      addText(formattedDate, pageWidth/2, 60, pageWidth - 20, 12, '#8B4513', 'center')
      
      // Venue
      if (eventData.venue) {
        addText(eventData.venue, pageWidth/2, 70, pageWidth - 20, 10, '#8B4513', 'center')
      }
      
      // QR Code
      addQRCode(qrCodeDataUrl, pageWidth/2 - 15, 85, 30)
      
      // Vintage message
      addText('Celebrate with us in rustic charm', pageWidth/2, 120, pageWidth - 20, 10, '#8B4513', 'center')
      addText('RSVP by scanning above', pageWidth/2, 130, pageWidth - 20, 9, '#8B4513', 'center')
      break

    case 'beach-wedding':
      // Beach Wedding Template
      drawBorder('#0066CC', 2)
      
      // Background
      doc.setFillColor(173, 216, 230, 0.1)
      doc.rect(0, 0, pageWidth, pageHeight, 'F')
      
      // Main title
      addText('Beach Wedding', pageWidth/2, 25, pageWidth - 20, 14, '#0066CC', 'center')
      
      // Couple names
      addText(eventData.coupleNames, pageWidth/2, 45, pageWidth - 20, 18, '#003366', 'center')
      
      // Date
      addText(formattedDate, pageWidth/2, 60, pageWidth - 20, 12, '#0066CC', 'center')
      
      // Venue
      if (eventData.venue) {
        addText(eventData.venue, pageWidth/2, 70, pageWidth - 20, 10, '#0066CC', 'center')
      }
      
      // QR Code
      addQRCode(qrCodeDataUrl, pageWidth/2 - 15, 85, 30)
      
      // Beach message
      addText('Join us by the ocean', pageWidth/2, 120, pageWidth - 20, 10, '#0066CC', 'center')
      addText('Please RSVP below', pageWidth/2, 130, pageWidth - 20, 9, '#0066CC', 'center')
      break

    case 'garden-party':
      // Garden Party Template
      drawBorder('#228B22', 2)
      
      // Background
      doc.setFillColor(144, 238, 144, 0.1)
      doc.rect(0, 0, pageWidth, pageHeight, 'F')
      
      // Main title
      addText('Garden Wedding', pageWidth/2, 25, pageWidth - 20, 14, '#228B22', 'center')
      
      // Couple names
      addText(eventData.coupleNames, pageWidth/2, 45, pageWidth - 20, 18, '#006400', 'center')
      
      // Date
      addText(formattedDate, pageWidth/2, 60, pageWidth - 20, 12, '#228B22', 'center')
      
      // Venue
      if (eventData.venue) {
        addText(eventData.venue, pageWidth/2, 70, pageWidth - 20, 10, '#228B22', 'center')
      }
      
      // QR Code
      addQRCode(qrCodeDataUrl, pageWidth/2 - 15, 85, 30)
      
      // Garden message
      addText('Celebrate among the flowers', pageWidth/2, 120, pageWidth - 20, 10, '#228B22', 'center')
      addText('Please RSVP below', pageWidth/2, 130, pageWidth - 20, 9, '#228B22', 'center')
      break

    default:
      // Default template
      drawBorder('#E5B574', 2)
      addText('Wedding Invitation', pageWidth/2, 30, pageWidth - 20, 16, '#8B4513', 'center')
      addText(eventData.coupleNames, pageWidth/2, 50, pageWidth - 20, 18, '#2F1B14', 'center')
      addText(formattedDate, pageWidth/2, 65, pageWidth - 20, 12, '#8B4513', 'center')
      if (eventData.venue) {
        addText(eventData.venue, pageWidth/2, 75, pageWidth - 20, 10, '#8B4513', 'center')
      }
      addQRCode(qrCodeDataUrl, pageWidth/2 - 15, 90, 30)
      addText('Please RSVP', pageWidth/2, 125, pageWidth - 20, 10, '#8B4513', 'center')
  }

  // Add footer with app branding
  const footerY = pageHeight - 10
  doc.setFontSize(6)
  doc.setTextColor('#999999')
  doc.text('Generated by Vesello', pageWidth - 30, footerY)

  return Buffer.from(doc.output('arraybuffer'))
}
