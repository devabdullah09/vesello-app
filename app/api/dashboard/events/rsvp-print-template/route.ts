import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

// POST /api/dashboard/events/rsvp-print-template
// Generates a PDF template with event data for RSVP
export async function POST(request: NextRequest) {
  try {
    const { templateId, eventData } = await request.json()

    if (!templateId || !eventData) {
      return NextResponse.json({ error: 'templateId and eventData are required' }, { status: 400 })
    }

    // Generate QR code as base64 image
    let qrCodeDataUrl: string
    try {
      qrCodeDataUrl = await QRCode.toDataURL(eventData.rsvpUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
    } catch (qrError) {
      console.error('Error generating QR code:', qrError)
      qrCodeDataUrl = ''
    }

    // Generate PDF content using jsPDF
    const pdfData = await generateRSVPPDFTemplate(templateId, eventData, qrCodeDataUrl)
    
    return new NextResponse(new Uint8Array(pdfData), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rsvp-${templateId}-${eventData.coupleNames.replace(/\s+/g, '-')}.pdf"`
      }
    })

  } catch (error) {
    console.error('Error generating RSVP template:', error)
    return NextResponse.json({ error: 'Failed to generate RSVP template' }, { status: 500 })
  }
}

async function generateRSVPPDFTemplate(templateId: string, eventData: any, qrCodeDataUrl: string): Promise<Buffer> {
  // Dynamic import to avoid SSR issues
  const { jsPDF } = await import('jspdf')
  
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Helper function to add text with wrapping
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12, color: string = '#000000') => {
    doc.setFontSize(fontSize)
    doc.setTextColor(color)
    
    const lines = doc.splitTextToSize(text, maxWidth)
    doc.text(lines, x, y)
    return y + (lines.length * fontSize * 0.4)
  }

  // Helper function to add centered text
  const addCenteredText = (text: string, y: number, fontSize: number = 12, color: string = '#000000') => {
    doc.setFontSize(fontSize)
    doc.setTextColor(color)
    const textWidth = doc.getTextWidth(text)
    const x = (pageWidth - textWidth) / 2
    doc.text(text, x, y)
    return y + fontSize * 0.4
  }

  // Helper function to add QR code
  const addQRCode = (dataUrl: string, x: number, y: number, size: number) => {
    if (dataUrl) {
      doc.addImage(dataUrl, 'PNG', x, y, size, size)
    }
  }

  // Set up colors
  const primaryColor = '#E5B574'
  const darkColor = '#000000'
  const grayColor = '#666666'

  // Template-specific layouts
  if (templateId === 'a5-invitation-qr' || templateId === 'bc-invitation-card') {
    // Welcome/Invitation Template
    let currentY = 30
    
    // Title
    currentY = addCenteredText('You\'re Invited!', currentY, 24, primaryColor) + 10
    currentY = addCenteredText('To the Wedding of', currentY, 14, grayColor) + 15
    
    // Couple names
    currentY = addCenteredText(eventData.coupleNames, currentY, 28, darkColor) + 15
    
    // Date
    const formattedDate = new Date(eventData.eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    currentY = addCenteredText(formattedDate, currentY, 16, darkColor) + 10
    
    // Venue
    if (eventData.venue) {
      currentY = addCenteredText(eventData.venue, currentY, 14, grayColor) + 20
    }
    
    // RSVP instructions
    currentY = addCenteredText('Please RSVP by scanning the QR code', currentY, 12, grayColor) + 15
    
    // QR Code
    const qrSize = templateId === 'a5-invitation-qr' ? 40 : 25
    const qrX = (pageWidth - qrSize) / 2
    addQRCode(qrCodeDataUrl, qrX, currentY, qrSize)
    
    // Footer text
    currentY = currentY + qrSize + 10
    addCenteredText('Scan to RSVP', currentY, 10, grayColor)
  }
  
  else if (templateId === 'a5-rsvp-reminder' || templateId === 'bc-rsvp-reminder') {
    // RSVP Reminder Template
    let currentY = 30
    
    // Title
    currentY = addCenteredText('RSVP Reminder', currentY, 20, primaryColor) + 15
    
    // Couple names
    currentY = addCenteredText(eventData.coupleNames + ' Wedding', currentY, 18, darkColor) + 15
    
    // Date
    const formattedDate = new Date(eventData.eventDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    currentY = addCenteredText(formattedDate, currentY, 14, darkColor) + 20
    
    // Reminder message
    currentY = addCenteredText('Please confirm your attendance', currentY, 12, grayColor) + 10
    currentY = addCenteredText('by scanning the QR code below', currentY, 12, grayColor) + 20
    
    // QR Code
    const qrSize = templateId === 'a5-rsvp-reminder' ? 35 : 20
    const qrX = (pageWidth - qrSize) / 2
    addQRCode(qrCodeDataUrl, qrX, currentY, qrSize)
    
    // Footer text
    currentY = currentY + qrSize + 10
    addCenteredText('Quick RSVP', currentY, 10, grayColor)
  }
  
  else if (templateId === 'a5-table-tent' || templateId === 'bc-table-tent') {
    // Table Tent Template
    let currentY = 20
    
    // Event title
    currentY = addCenteredText(eventData.title || 'Wedding Celebration', currentY, 16, darkColor) + 10
    
    // Couple names
    currentY = addCenteredText(eventData.coupleNames, currentY, 14, primaryColor) + 15
    
    // QR Code (larger for table tents)
    const qrSize = templateId === 'a5-table-tent' ? 30 : 20
    const qrX = (pageWidth - qrSize) / 2
    addQRCode(qrCodeDataUrl, qrX, currentY, qrSize)
    
    // Footer text
    currentY = currentY + qrSize + 8
    addCenteredText('RSVP Here', currentY, 10, grayColor)
  }
  
  else if (templateId === 'a5-thank-you-rsvp' || templateId === 'bc-thank-you-rsvp') {
    // Thank You Template
    let currentY = 30
    
    // Title
    currentY = addCenteredText('Thank You', currentY, 22, primaryColor) + 15
    
    // Couple names
    currentY = addCenteredText(eventData.coupleNames, currentY, 16, darkColor) + 15
    
    // Thank you message
    currentY = addCenteredText('For celebrating with us!', currentY, 12, grayColor) + 10
    currentY = addCenteredText('We can\'t wait to see you', currentY, 12, grayColor) + 20
    
    // QR Code
    const qrSize = templateId === 'a5-thank-you-rsvp' ? 35 : 20
    const qrX = (pageWidth - qrSize) / 2
    addQRCode(qrCodeDataUrl, qrX, currentY, qrSize)
    
    // Footer text
    currentY = currentY + qrSize + 10
    addCenteredText('RSVP if you haven\'t already', currentY, 10, grayColor)
  }
  
  else if (templateId === 'a5-timeline-rsvp') {
    // Timeline with RSVP Template
    let currentY = 25
    
    // Title
    currentY = addCenteredText('Wedding Day Timeline', currentY, 18, primaryColor) + 15
    
    // Couple names
    currentY = addCenteredText(eventData.coupleNames, currentY, 14, darkColor) + 15
    
    // Date
    const formattedDate = new Date(eventData.eventDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    currentY = addCenteredText(formattedDate, currentY, 12, grayColor) + 15
    
    // Timeline
    const timelineEvents = [
      '2:00 PM - Ceremony',
      '3:30 PM - Cocktail Hour',
      '5:00 PM - Reception',
      '9:00 PM - Dancing'
    ]
    
    timelineEvents.forEach(event => {
      currentY = addCenteredText(event, currentY, 10, grayColor) + 5
    })
    
    currentY += 10
    
    // QR Code
    const qrSize = 30
    const qrX = (pageWidth - qrSize) / 2
    addQRCode(qrCodeDataUrl, qrX, currentY, qrSize)
    
    // Footer text
    currentY = currentY + qrSize + 10
    addCenteredText('RSVP here if you haven\'t already', currentY, 10, grayColor)
  }
  
  else if (templateId === 'bc-qr-simple-rsvp') {
    // Simple QR Card
    let currentY = 20
    
    // Couple names
    currentY = addCenteredText(eventData.coupleNames, currentY, 12, darkColor) + 10
    
    // QR Code
    const qrSize = 25
    const qrX = (pageWidth - qrSize) / 2
    addQRCode(qrCodeDataUrl, qrX, currentY, qrSize)
    
    // Footer text
    currentY = currentY + qrSize + 8
    addCenteredText('RSVP', currentY, 10, grayColor)
  }

  // Add footer with app branding
  const footerY = pageHeight - 15
  doc.setFontSize(8)
  doc.setTextColor('#999999')
  doc.text('Generated by Vesello', pageWidth - 50, footerY)

  return Buffer.from(doc.output('arraybuffer'))
}
