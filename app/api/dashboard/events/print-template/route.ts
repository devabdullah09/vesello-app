import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

// POST /api/dashboard/events/print-template
// Generates a PDF template with event data
export async function POST(request: NextRequest) {
  try {
    const { templateId, eventData } = await request.json()

    if (!templateId || !eventData) {
      return NextResponse.json({ error: 'templateId and eventData are required' }, { status: 400 })
    }

    // Generate QR code as base64 image
    let qrCodeDataUrl: string
    try {
      qrCodeDataUrl = await QRCode.toDataURL(eventData.galleryUrl, {
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
    const pdfData = await generatePDFTemplate(templateId, eventData, qrCodeDataUrl)
    
    return new NextResponse(pdfData, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${templateId}-${eventData.coupleNames.replace(/\s+/g, '-')}.pdf"`
      }
    })

  } catch (error) {
    console.error('Error generating template:', error)
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 })
  }
}

async function generatePDFTemplate(templateId: string, eventData: any, qrCodeDataUrl: string): Promise<Buffer> {
  // Import jsPDF dynamically to avoid SSR issues
  const { jsPDF } = await import('jspdf');
  
  const { coupleNames, eventDate, venue } = eventData;
  const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const doc = new jsPDF();

  // A5 Welcome Sign Template
  if (templateId === 'a5-welcome-qr') {
    // A5 format (148mm x 210mm)
    doc.internal.pageSize.setWidth(148);
    doc.internal.pageSize.setHeight(210);
    
    // Add decorative border
    doc.setDrawColor(229, 181, 116);
    doc.setLineWidth(2);
    doc.rect(10, 10, 128, 190);
    
    // Title
    doc.setFontSize(16);
    doc.setTextColor(229, 181, 116); // #E5B574
    doc.text('Welcome To', 74, 40, { align: 'center' });
    
    // Couple Names
    doc.setFontSize(28);
    doc.setTextColor(51, 51, 51);
    doc.text(coupleNames, 74, 60, { align: 'center' });
    
    // Wedding text
    doc.setFontSize(20);
    doc.setTextColor(193, 128, 55); // #C18037
    doc.text('Wedding', 74, 80, { align: 'center' });
    
    // Date and venue
    doc.setFontSize(12);
    doc.setTextColor(102, 102, 102);
    doc.text(formattedDate, 74, 100, { align: 'center' });
    if (venue) {
      doc.text(venue, 74, 115, { align: 'center' });
    }
    
    // QR Code
    if (qrCodeDataUrl) {
      doc.addImage(qrCodeDataUrl, 'PNG', 54, 130, 40, 40);
    }
    
    // QR instruction
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    doc.text('Scan to view & upload photos', 74, 180, { align: 'center' });
  }
  
  // A5 Photo Booth Template
  else if (templateId === 'a5-photo-booth') {
    doc.internal.pageSize.setWidth(148);
    doc.internal.pageSize.setHeight(210);
    
    // Add decorative border
    doc.setDrawColor(229, 181, 116);
    doc.setLineWidth(2);
    doc.rect(10, 10, 128, 190);
    
    doc.setFontSize(24);
    doc.setTextColor(51, 51, 51);
    doc.text('PHOTO BOOTH', 74, 30, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(229, 181, 116);
    doc.text(coupleNames + ' Wedding', 74, 50, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51);
    doc.text('1. Take amazing photos!', 74, 80, { align: 'center' });
    doc.text('2. Scan the QR code below', 74, 95, { align: 'center' });
    doc.text('3. Upload your photos to our gallery', 74, 110, { align: 'center' });
    doc.text('4. Share the memories!', 74, 125, { align: 'center' });
    
    if (qrCodeDataUrl) {
      doc.addImage(qrCodeDataUrl, 'PNG', 49, 140, 50, 50);
    }
    
    doc.setFontSize(14);
    doc.setTextColor(51, 51, 51);
    doc.text('SCAN TO UPLOAD PHOTOS', 74, 200, { align: 'center' });
  }
  
  // A5 Hashtag Sign Template
  else if (templateId === 'a5-hashtag-sign') {
    doc.internal.pageSize.setWidth(148);
    doc.internal.pageSize.setHeight(210);
    
    // Add decorative border
    doc.setDrawColor(229, 181, 116);
    doc.setLineWidth(2);
    doc.rect(10, 10, 128, 190);
    
    doc.setFontSize(20);
    doc.setTextColor(229, 181, 116);
    doc.text('SHARE THE LOVE', 74, 30, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(51, 51, 51);
    doc.text(coupleNames + ' Wedding', 74, 50, { align: 'center' });
    
    const hashtag = '#' + coupleNames.replace(/\s+/g, '').toLowerCase() + 'wedding';
    doc.setFontSize(24);
    doc.setTextColor(193, 128, 55);
    doc.text(hashtag, 74, 80, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51);
    doc.text('Tag us in your posts!', 74, 110, { align: 'center' });
    doc.text('Use our hashtag', 74, 125, { align: 'center' });
    doc.text('Upload to our gallery', 74, 140, { align: 'center' });
    
    if (qrCodeDataUrl) {
      doc.addImage(qrCodeDataUrl, 'PNG', 59, 150, 30, 30);
    }
    
    doc.setFontSize(10);
    doc.text('Scan to upload photos', 74, 190, { align: 'center' });
  }
  
  // A5 Thank You Template
  else if (templateId === 'a5-thank-you') {
    doc.internal.pageSize.setWidth(148);
    doc.internal.pageSize.setHeight(210);
    
    // Add decorative border
    doc.setDrawColor(229, 181, 116);
    doc.setLineWidth(2);
    doc.rect(10, 10, 128, 190);
    
    doc.setFontSize(32);
    doc.setTextColor(229, 181, 116);
    doc.text('Thank You', 74, 50, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setTextColor(51, 51, 51);
    doc.text(coupleNames, 74, 75, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(102, 102, 102);
    doc.text('For celebrating with us!', 74, 95, { align: 'center' });
    doc.text('View our wedding gallery:', 74, 115, { align: 'center' });
    
    if (qrCodeDataUrl) {
      doc.addImage(qrCodeDataUrl, 'PNG', 54, 130, 40, 40);
    }
    
    doc.setFontSize(10);
    doc.text('Scan to view photos', 74, 180, { align: 'center' });
  }
  
  // A5 Timeline Template
  else if (templateId === 'a5-timeline') {
    doc.internal.pageSize.setWidth(148);
    doc.internal.pageSize.setHeight(210);
    
    // Add decorative border
    doc.setDrawColor(229, 181, 116);
    doc.setLineWidth(2);
    doc.rect(10, 10, 128, 190);
    
    doc.setFontSize(20);
    doc.setTextColor(229, 181, 116);
    doc.text('Wedding Day Timeline', 74, 25, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(51, 51, 51);
    doc.text(coupleNames, 74, 45, { align: 'center' });
    doc.text(formattedDate, 74, 60, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    doc.text('2:00 PM - Ceremony', 74, 85, { align: 'center' });
    doc.text('3:30 PM - Cocktail Hour', 74, 100, { align: 'center' });
    doc.text('5:00 PM - Reception', 74, 115, { align: 'center' });
    doc.text('9:00 PM - Dancing', 74, 130, { align: 'center' });
    
    if (qrCodeDataUrl) {
      doc.addImage(qrCodeDataUrl, 'PNG', 54, 150, 40, 40);
    }
    
    doc.setFontSize(8);
    doc.text('Scan to upload your photos from today!', 74, 200, { align: 'center' });
  }
  
  // Business Card Table Tent Template
  else if (templateId === 'bc-table-tent') {
    // Business card format (85mm x 55mm)
    doc.internal.pageSize.setWidth(85);
    doc.internal.pageSize.setHeight(55);
    
    // Add decorative border
    doc.setDrawColor(229, 181, 116);
    doc.setLineWidth(1);
    doc.rect(5, 5, 75, 45);
    
    // Couple Names
    doc.setFontSize(12);
    doc.setTextColor(229, 181, 116); // #E5B574
    doc.text(coupleNames, 42.5, 15, { align: 'center' });
    
    // Gallery text
    doc.setFontSize(8);
    doc.setTextColor(51, 51, 51);
    doc.text('Wedding Gallery', 42.5, 22, { align: 'center' });
    
    // QR Code
    if (qrCodeDataUrl) {
      doc.addImage(qrCodeDataUrl, 'PNG', 32.5, 25, 20, 20);
    }
    
    // Scan instruction
    doc.setFontSize(6);
    doc.setTextColor(102, 102, 102);
    doc.text('Scan to view & upload photos', 42.5, 50, { align: 'center' });
  }
  
  // Business Card Photo Reminder
  else if (templateId === 'bc-photo-reminder') {
    doc.internal.pageSize.setWidth(85);
    doc.internal.pageSize.setHeight(55);
    
    // Add decorative border
    doc.setDrawColor(229, 181, 116);
    doc.setLineWidth(1);
    doc.rect(5, 5, 75, 45);
    
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    doc.text('Don\'t Forget!', 42.5, 12, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setTextColor(229, 181, 116);
    doc.text(coupleNames + ' Wedding', 42.5, 20, { align: 'center' });
    
    doc.setFontSize(6);
    doc.setTextColor(51, 51, 51);
    doc.text('Upload your photos to our gallery', 42.5, 28, { align: 'center' });
    
    if (qrCodeDataUrl) {
      doc.addImage(qrCodeDataUrl, 'PNG', 32.5, 32, 20, 20);
    }
  }
  
  // Business Card Hashtag Template
  else if (templateId === 'bc-hashtag-card') {
    doc.internal.pageSize.setWidth(85);
    doc.internal.pageSize.setHeight(55);
    
    // Add decorative border
    doc.setDrawColor(229, 181, 116);
    doc.setLineWidth(1);
    doc.rect(5, 5, 75, 45);
    
    const hashtag = '#' + coupleNames.replace(/\s+/g, '').toLowerCase() + 'wedding';
    
    doc.setFontSize(8);
    doc.setTextColor(229, 181, 116);
    doc.text('Tag Us!', 42.5, 10, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(193, 128, 55);
    doc.text(hashtag, 42.5, 20, { align: 'center' });
    
    if (qrCodeDataUrl) {
      doc.addImage(qrCodeDataUrl, 'PNG', 32.5, 25, 20, 20);
    }
    
    doc.setFontSize(6);
    doc.text('Upload photos here', 42.5, 50, { align: 'center' });
  }
  
  // Business Card Simple QR
  else if (templateId === 'bc-qr-simple') {
    doc.internal.pageSize.setWidth(85);
    doc.internal.pageSize.setHeight(55);
    
    // Add decorative border
    doc.setDrawColor(229, 181, 116);
    doc.setLineWidth(1);
    doc.rect(5, 5, 75, 45);
    
    doc.setFontSize(8);
    doc.setTextColor(229, 181, 116);
    doc.text('Gallery', 42.5, 10, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    doc.text(coupleNames, 42.5, 18, { align: 'center' });
    
    if (qrCodeDataUrl) {
      doc.addImage(qrCodeDataUrl, 'PNG', 27.5, 22, 30, 30);
    }
  }
  
  // Business Card Thank You Mini
  else if (templateId === 'bc-thank-you-mini') {
    doc.internal.pageSize.setWidth(85);
    doc.internal.pageSize.setHeight(55);
    
    // Add decorative border
    doc.setDrawColor(229, 181, 116);
    doc.setLineWidth(1);
    doc.rect(5, 5, 75, 45);
    
    doc.setFontSize(10);
    doc.setTextColor(229, 181, 116);
    doc.text('Thank You!', 42.5, 12, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setTextColor(51, 51, 51);
    doc.text(coupleNames, 42.5, 20, { align: 'center' });
    
    if (qrCodeDataUrl) {
      doc.addImage(qrCodeDataUrl, 'PNG', 32.5, 25, 20, 20);
    }
    
    doc.setFontSize(6);
    doc.text('View our gallery', 42.5, 50, { align: 'center' });
  }
  
  // Default template
  else {
    doc.setFontSize(20);
    doc.setTextColor(229, 181, 116);
    doc.text(coupleNames + ' Wedding', 105, 40, { align: 'center' });
    
    if (qrCodeDataUrl) {
      doc.addImage(qrCodeDataUrl, 'PNG', 80, 60, 50, 50);
    }
    
    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51);
    doc.text('Scan for Gallery', 105, 130, { align: 'center' });
  }

  // Return PDF as buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}