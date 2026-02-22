import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Complaint from '@/models/Complaint';

const ESCALATION_LEVELS = [
    'Ward Officer',
    'Block Officer',
    'Sub-Divisional Officer',
    'District Collector',
];

// PUT /api/complaints/[id]/escalate
export async function PUT(req, context) {
    await connectDB();
    const { id } = await context.params;
    const { by } = await req.json();
    const complaint = await Complaint.findById(id);
    if (!complaint) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (complaint.escalationLevel >= ESCALATION_LEVELS.length - 1) {
        return NextResponse.json({ error: 'Already at maximum escalation level' }, { status: 400 });
    }

    complaint.escalationLevel += 1;
    const authority = ESCALATION_LEVELS[complaint.escalationLevel];
    complaint.history.push({
        action: `⚠️ Escalated to Level ${complaint.escalationLevel} — ${authority}`,
        by: by || 'Admin',
        timestamp: new Date(),
    });

    const updated = await complaint.save();
    return NextResponse.json(updated);
}
