import mongoose, { Schema, Document, Model } from 'mongoose';

// --- User Schema ---
export interface IUser extends Document {
    name?: string;
    mobile: string;
    email?: string;
    password?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema({
    name: { type: String },
    mobile: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true }, // sparse allows multiple nulls
    password: { type: String },
}, { timestamps: true });

// --- Medical Record Schema ---
export interface IMedicalRecord extends Document {
    userId: mongoose.Types.ObjectId;
    diseaseName?: string;
    medicines: string[];
    source: string; // 'groq_scan' | 'manual'
    analyzedAt: Date;
}

const MedicalRecordSchema: Schema<IMedicalRecord> = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    diseaseName: { type: String },
    medicines: [{ type: String }],
    source: { type: String, default: 'manual' },
    analyzedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// --- Profile Schema ---
export interface IProfile extends Document {
    userId: mongoose.Types.ObjectId;
    dob?: string;
    gender?: string;
    bloodGroup?: string;
    allergies?: string;
    chronicConditions?: string;
    emergencyContact?: {
        name: string;
        relationship: string;
        phone: string;
    };
}

const ProfileSchema: Schema<IProfile> = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    dob: { type: String },
    gender: { type: String },
    bloodGroup: { type: String },
    allergies: { type: String },
    chronicConditions: { type: String },
    emergencyContact: {
        name: { type: String },
        relationship: { type: String },
        phone: { type: String }
    }
}, { timestamps: true });


// Export Models
// Check if models are already compiled to prevent OverwriteModelError
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const MedicalRecord: Model<IMedicalRecord> = mongoose.models.MedicalRecord || mongoose.model<IMedicalRecord>('MedicalRecord', MedicalRecordSchema);
export const Profile: Model<IProfile> = mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);
