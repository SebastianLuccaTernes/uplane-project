import { NextRequest, NextResponse } from "next/server"

// Dynamic import of sharp to handle platform-specific issues
let sharp: any = null
try {
    sharp = require('sharp')
} catch (error) {
    console.warn('Sharp module could not be loaded:', error instanceof Error ? error.message : String(error))
}

// api/removebg
export async function POST(request: NextRequest) {
    try {
        // Parse form data from the request
        const formData = await request.formData()
        const file = formData.get('image') as File
        const flip = formData.get('flip') === 'true'
        
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

        // Apply horizontal flip if requested
        let finalImageBuffer = processedImageBuffer
        if (flip) {
            console.log('Applying horizontal flip...')
            try {
                if (!sharp) {
                    console.warn('Sharp not available, flip functionality disabled for this deployment')
                    // Return the image without flip but with a warning header
                    return new NextResponse(new Uint8Array(processedImageBuffer), {
                        headers: {
                            'Content-Type': 'image/png',
                            'Content-Disposition': `attachment; filename="removed-bg-${file.name}"`,
                            'X-Warning': 'Flip functionality not available on this platform'
                        }
                    })
                }
                
                finalImageBuffer = await sharp(processedImageBuffer)
                    .flop() // Horizontal flip (mirror)
                    .png({ quality: 100 }) // Ensure high quality PNG output
                    .toBuffer()
                console.log('Flip applied successfully')
            } catch (flipError) {
                console.error('Error applying flip:', flipError)
                // If flip fails, return the original processed image
                finalImageBuffer = processedImageBuffer
            }
        }

        // Return the processed image
        return new NextResponse(new Uint8Array(finalImageBuffer), {
            headers: {
                'Content-Type': 'image/png',
                'Content-Disposition': `attachment; filename="removed-bg-${flip ? 'flipped-' : ''}${file.name}"`
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
    
    // Create blob with proper MIME type
    const blob = new Blob([uint8Array], { type: 'image/png' })
    formData.append('image_file', blob, 'image.png')
    formData.append('size', 'auto')
    
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
            'X-Api-Key': process.env.REMOVEBG_API_KEY!,
        },
        body: formData,
    })

    if (!response.ok) {
        const errorText = await response.text()
        console.error('Remove.bg API error details:', errorText)
        throw new Error(`Remove.bg API error: ${response.status} ${response.statusText} - ${errorText}`)
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