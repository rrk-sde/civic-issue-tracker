import mongoose from 'mongoose';

const ComplaintSchema = new mongoose.Schema({
    complaintId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: 'General' },
    photoUrl: { type: String, default: null }, // Cloudinary URL
    location: {
        address: { type: String },
        lat: { type: Number },
        lng: { type: Number },
        ward: { type: String },
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
        default: 'Open',
    },
    slaExpiry: { type: Date },
    slaBreach: { type: Boolean, default: false },
    escalationLevel: { type: Number, default: 0 },
    severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    assignedTo: { type: String, default: null },
    submittedBy: { type: String, default: 'Citizen' },
    history: [{
        action: { type: String },
        by: { type: String },
        timestamp: { type: Date, default: Date.now },
    }],
}, { timestamps: true });

export default mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);
