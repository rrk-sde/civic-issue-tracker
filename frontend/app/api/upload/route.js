import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

// POST /api/upload — receives base64 or raw file, uploads to Cloudinary
export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

        // Convert file to buffer → base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

        const result = await cloudinary.uploader.upload(base64, {
            folder: 'civic-tracker',
            resource_type: 'image',
            transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 'auto:good' }],
        });

        return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
    } catch (err) {
        console.error('Cloudinary upload error:', err);
        return NextResponse.json({ error: 'Upload failed', detail: err.message }, { status: 500 });
    }
}
