import { NextRequest, NextResponse } from "next/server"

// api/removebg
export async function POST(request: NextRequest) {
    try {
        // Parse form data from the request
        const formData = await request.formData()
        const file = formData.get('image') as File
        
        if (!file) {
            return NextResponse.json(
                { error: 'No image file provided' },
                { status: 400 }
            )
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'File must be an image' },
                { status: 400 }
            )
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size too large. Maximum 10MB allowed.' },
                { status: 400 }
            )
        }

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer())

        
        const processedImageBuffer = await removeBackground(buffer, file.type)

        // Return the processed image
        return new NextResponse(new Uint8Array(processedImageBuffer), {
            headers: {
                'Content-Type': 'image/png',
                'Content-Disposition': `attachment; filename="removed-bg-${file.name}"`
            }
        })

    } catch (error) {
        console.error('Error processing image:', error)
        return NextResponse.json(
            { error: 'Failed to process image' },
            { status: 500 }
        )
    }
}

async function removeBackground(imageBuffer: Buffer, mimeType: string): Promise<Buffer> {
    // Option 1: Using remove.bg API (requires API key)
    if (process.env.REMOVEBG_API_KEY) {
        return await removeBackgroundWithRemoveBg(imageBuffer)
    }
    
    
    throw new Error('Background removal service not configured')
}

async function removeBackgroundWithRemoveBg(imageBuffer: Buffer): Promise<Buffer> {
    const formData = new FormData()
    const uint8Array = new Uint8Array(imageBuffer)
    formData.append('image_file', new Blob([uint8Array]))
    
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
            'X-Api-Key': process.env.REMOVEBG_API_KEY!,
        },
        body: formData,
    })

    if (!response.ok) {
        throw new Error(`Remove.bg API error: ${response.statusText}`)
    }

    return Buffer.from(await response.arrayBuffer())
}

export async function GET() {
    return NextResponse.json({
        message: 'RemoveBG API endpoint',
        methods: ['POST'],
        description: 'Upload an image file to remove its background'
    })
}