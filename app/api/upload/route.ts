import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Get file data as array buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Convert to base64 string for Cloudinary
    const base64Data = buffer.toString('base64');
    const base64File = `data:${file.type};base64,${base64Data}`;
    
    // Upload directly to Cloudinary without saving to disk
    const result = await cloudinary.uploader.upload(base64File, {
      folder: 'spottive-products',
    });

    // Return the Cloudinary image URL
    return NextResponse.json({
      url: result.secure_url,
      cloudinaryId: result.public_id
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}