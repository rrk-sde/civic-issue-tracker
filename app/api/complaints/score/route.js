import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Complaint from '@/models/Complaint';

export async function GET(req) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');

    if (!name) {
        return NextResponse.json({ score: 0, count: 0 });
    }

    // Count how many complaints this specific user has submitted
    const count = await Complaint.countDocuments({ submittedBy: name });

    // Each submitted complaint awards 50 Civic Karma points!
    const score = count * 50;

    return NextResponse.json({ score, count });
}
