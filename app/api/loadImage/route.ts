import { NextResponse } from "next/server"
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: Request) {
  try {
    const data = await req.formData()
    const file = data.get("image") as File
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: '1000qbm-images',
          public_id: `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error)
          else if (result) resolve(result)
          else reject(new Error('Upload failed'))
        }
      ).end(buffer)
    })

    const uploadResult = result as { secure_url: string }
    return NextResponse.json({ url: uploadResult.secure_url })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
}
