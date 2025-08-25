import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const uniqueFilename = `${uuidv4()}.${fileExtension}`
    const storagePath = `processed/${uniqueFilename}`

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('processed-images')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('processed-images')
      .getPublicUrl(storagePath)

    // Save metadata to database
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('processed_images')
      .insert({
        filename: file.name,
        storage_path: storagePath,
        public_url: urlData.publicUrl,
        file_size: file.size,
        mime_type: file.type
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Clean up uploaded file if database insert fails
      await supabaseAdmin.storage
        .from('processed-images')
        .remove([storagePath])
      
      return NextResponse.json(
        { error: 'Failed to save image metadata' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: dbData
    })

  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
