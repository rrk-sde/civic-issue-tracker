import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Complaint from '@/models/Complaint';

// GET /api/complaints/track/[id]
export async function GET(req, context) {
    await connectDB();
    const { id } = await context.params;
    const complaint = await Complaint.findOne({ complaintId: id.toUpperCase() });
    if (!complaint) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(complaint);
}
