import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Complaint from '@/models/Complaint';
import crypto from 'crypto';

function genId() { return 'W-' + crypto.randomBytes(3).toString('hex').toUpperCase(); }

// Helper — check & mark SLA breach
function checkSLA(complaint) {
    if (!complaint.slaBreach && new Date() > new Date(complaint.slaExpiry)) {
        complaint.slaBreach = true;
        // Auto-escalate level 1 on breach
        if (complaint.escalationLevel === 0) {
            complaint.escalationLevel = 1;
            complaint.history.push({
                action: '⚠️ SLA breached — Auto-escalated to Level 1 (Block Officer)',
                by: 'System',
                timestamp: new Date(),
            });
        }
    }
    return complaint;
}

// GET — list complaints (with optional ?status= and ?ward= filter + auto-SLA check)
export async function GET(req) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const ward = searchParams.get('ward');
    const filter = {};
    if (status) filter.status = status;
    if (ward && ward !== 'All Wards') filter['location.ward'] = ward;

    let complaints = await Complaint.find(filter).sort({ createdAt: -1 });

    // Run SLA check + save if breached
    const updates = complaints.map(async (c) => {
        const before = c.slaBreach;
        checkSLA(c);
        if (!before && c.slaBreach) await c.save();
        return c;
    });
    complaints = await Promise.all(updates);

    return NextResponse.json(complaints);
}

// POST — submit new complaint
export async function POST(req) {
    await connectDB();
    const body = await req.json();
    const { title, description, photoUrl, location, submittedBy, severity, category } = body;

    const slaExpiry = new Date();
    slaExpiry.setDate(slaExpiry.getDate() + 3);

    const complaint = await Complaint.create({
        complaintId: genId(),
        title, description, severity: severity || 'Medium', category: category || 'General',
        photoUrl: photoUrl || null,
        location: {
            address: location?.address || '',
            lat: location?.lat || null,
            lng: location?.lng || null,
            ward: location?.ward || 'Unspecified',
        },
        slaExpiry,
        submittedBy: submittedBy || 'Citizen',
        history: [{ action: 'Complaint Submitted', by: submittedBy || 'Citizen' }],
    });

    return NextResponse.json(complaint, { status: 201 });
}
