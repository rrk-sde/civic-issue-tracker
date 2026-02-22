import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Demo role-based users — in production these would be in MongoDB with hashed passwords
const DEMO_USERS = {
    'citizen@demo.com': { password: 'citizen123', role: 'Citizen', name: 'Priya Sharma', ward: 'Ward 4' },
    'officer@ward1.com': { password: 'officer123', role: 'Officer', name: 'Rajesh Kumar', ward: 'Ward 1' },
    'admin@civic.gov': { password: 'admin123', role: 'Admin', name: 'Dr. Anita Patel', ward: 'All Wards' },
};

export async function POST(req) {
    try {
        const { email, password } = await req.json();
        const user = DEMO_USERS[email?.toLowerCase()];
        if (!user || user.password !== password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }
        const token = jwt.sign(
            { email, role: user.role, name: user.name, ward: user.ward },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '8h' }
        );
        return NextResponse.json({ token, role: user.role, name: user.name, ward: user.ward });
    } catch (err) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
