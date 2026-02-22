import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Complaint from '@/models/Complaint';

// PUT /api/complaints/[id]/status — update status + optional assignedTo
export async function PUT(req, context) {
    await connectDB();
    const { id } = await context.params;
    const { status, officerName, assignedTo } = await req.json();
    const complaint = await Complaint.findById(id);
    if (!complaint) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const prevStatus = complaint.status;
    complaint.status = status;

    if (assignedTo) {
        complaint.assignedTo = assignedTo;
        if (!complaint.history.some(h => h.action.includes(assignedTo))) {
            complaint.history.push({
                action: `Assigned to field staff: ${assignedTo}`,
                by: officerName || 'Officer',
                timestamp: new Date(),
            });
        }
    }

    if (prevStatus !== status) {
        complaint.history.push({
            action: `Status updated: ${prevStatus} → ${status}`,
            by: officerName || 'Officer',
            timestamp: new Date(),
        });
    }

    const updated = await complaint.save();
    return NextResponse.json(updated);
}
