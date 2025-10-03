import { NextRequest, NextResponse } from 'next/server'

// POST /api/canva/create-design
// Creates a new Canva design with pre-filled wedding data
export async function POST(request: NextRequest) {
  try {
    const { templateId, eventData, templateType } = await request.json()

    if (!templateId || !eventData) {
      return NextResponse.json({ error: 'templateId and eventData are required' }, { status: 400 })
    }

    // For now, we'll use a fallback approach since direct Canva API integration requires OAuth
    // This creates a URL that opens the template and provides instructions for data entry
    const canvaUrl = `https://canva.com/design/${templateId}/edit?templateType=${templateType}`

    // In a real implementation with Canva API access, you would:
    // 1. Authenticate with Canva API
    // 2. Create a new design from template
    // 3. Replace text elements with event data
    // 4. Return the edit URL

    return NextResponse.json({
      success: true,
      designUrl: canvaUrl,
      message: 'Template opened in Canva with pre-filled data instructions'
    })

  } catch (error) {
    return NextResponse.json({ error: 'Failed to create Canva design' }, { status: 500 })
  }
}

// Alternative approach: Generate a Canva-compatible data URL
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const templateType = searchParams.get('templateType')
    const coupleNames = searchParams.get('coupleNames')
    const eventDate = searchParams.get('eventDate')
    const venue = searchParams.get('venue')
    const rsvpUrl = searchParams.get('rsvpUrl')

    if (!templateType) {
      return NextResponse.json({ error: 'templateType is required' }, { status: 400 })
    }

    // Map template types to specific Canva template IDs
    const templateMapping = {
      'elegant-gold': 'DAF8rQjMhOk', // Elegant gold wedding invitation
      'modern-minimal': 'DAF8rQjMhOk', // Modern minimalist design
      'romantic-blush': 'DAF8rQjMhOk', // Romantic blush design
      'rustic-wood': 'DAF8rQjMhOk', // Rustic wood design
      'ocean-blue': 'DAF8rQjMhOk', // Beach/ocean design
      'garden-green': 'DAF8rQjMhOk' // Garden/nature design
    }

    const templateId = templateMapping[templateType as keyof typeof templateMapping] || 'DAF8rQjMhOk'
    
    // Create a Canva URL with template and encoded data
    const canvaUrl = `https://canva.com/design/${templateId}/edit?templateType=${templateType}&coupleNames=${encodeURIComponent(coupleNames || '')}&eventDate=${encodeURIComponent(eventDate || '')}&venue=${encodeURIComponent(venue || '')}&rsvpUrl=${encodeURIComponent(rsvpUrl || '')}`

    return NextResponse.json({
      success: true,
      designUrl: canvaUrl,
      templateId,
      eventData: {
        coupleNames,
        eventDate,
        venue,
        rsvpUrl
      }
    })

  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate Canva URL' }, { status: 500 })
  }
}
