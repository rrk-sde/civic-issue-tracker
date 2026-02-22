import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Complaint from '@/models/Complaint';

// GET /api/complaints/analytics
export async function GET() {
    await connectDB();
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: { $in: ['Open', 'In Progress'] } });
    const resolved = await Complaint.countDocuments({ status: { $in: ['Resolved', 'Closed'] } });
    return NextResponse.json({ total, pending, resolved });
}
