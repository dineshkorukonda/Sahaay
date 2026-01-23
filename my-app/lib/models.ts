import mongoose, { Schema, Document, Model } from 'mongoose';

// --- User Schema ---
export interface IUser extends Document {
    name?: string;
    mobile?: string;
    email: string;
    password?: string;
    otp?: string;
    otpExpires?: Date;
    isEmailVerified?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema({
    name: { type: String },
    mobile: { type: String, unique: true, sparse: true }, // optional, sparse allows multiple nulls
    email: { type: String, required: true, unique: true },
    password: { type: String },
    otp: { type: String },
    otpExpires: { type: Date },
    isEmailVerified: { type: Boolean, default: false },
}, { timestamps: true });

// --- Medical Record Schema ---
export interface IMedicalRecord extends Document {
    userId: mongoose.Types.ObjectId;
    diseaseName?: string;
    medicines: string[];
    source: string; // 'groq_scan' | 'manual'
    analyzedAt: Date;
    fileName?: string;
    fileUrl?: string;
    fileType?: string;
    fileSize?: number;
}

const MedicalRecordSchema: Schema<IMedicalRecord> = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    diseaseName: { type: String },
    medicines: [{ type: String }],
    source: { type: String, default: 'manual' },
    analyzedAt: { type: Date, default: Date.now },
    fileName: { type: String },
    fileUrl: { type: String },
    fileType: { type: String },
    fileSize: { type: Number }
}, { timestamps: true });

// --- Profile Schema ---
export interface IProfile extends Document {
    userId: mongoose.Types.ObjectId;
    dob?: string;
    gender?: string;
    bloodGroup?: string;
    allergies?: string;
    chronicConditions?: string;
    pinCode?: string;
    language?: string;
    location?: {
        pinCode: string;
        city?: string;
        state?: string;
        latitude?: number;
        longitude?: number;
    };
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
    pinCode: { type: String },
    language: { type: String, default: 'English' },
    location: {
        pinCode: { type: String },
        city: { type: String },
        state: { type: String },
        latitude: { type: Number },
        longitude: { type: Number }
    },
    emergencyContact: {
        name: { type: String },
        relationship: { type: String },
        phone: { type: String }
    }
}, { timestamps: true });

// --- Family Member Schema ---
export interface IFamilyMember extends Document {
    userId: mongoose.Types.ObjectId; // Owner of the family circle
    name: string;
    relationship: string; // 'mother', 'father', 'son', 'daughter', 'spouse', etc.
    age?: number;
    email?: string;
    phone?: string;
    status?: string; // 'STABLE', 'ATTENTION', etc.
    adherence?: number; // Medication adherence percentage
    emergencyAccess?: boolean;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}

const FamilyMemberSchema: Schema<IFamilyMember> = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    age: { type: Number },
    email: { type: String },
    phone: { type: String },
    status: { type: String, default: 'STABLE' },
    adherence: { type: Number, default: 100 },
    emergencyAccess: { type: Boolean, default: false },
    image: { type: String }
}, { timestamps: true });

// --- Health Stats Schema ---
export interface IHealthStats extends Document {
    userId: mongoose.Types.ObjectId;
    streak: number; // Days of adherence streak
    points: number; // Health points
    vitals?: {
        bp?: string; // Blood pressure
        hr?: number; // Heart rate
        temperature?: number;
        weight?: number;
        glucose?: number;
    };
    lastUpdated: Date;
    createdAt: Date;
    updatedAt: Date;
}

const HealthStatsSchema: Schema<IHealthStats> = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    streak: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    vitals: {
        bp: { type: String },
        hr: { type: Number },
        temperature: { type: Number },
        weight: { type: Number },
        glucose: { type: Number }
    },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// --- Care Plan Schema ---
export interface ICarePlan extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    medications?: Array<{
        name: string;
        dosage: string;
        frequency: string;
        time?: string;
        status: 'pending' | 'completed' | 'missed';
    }>;
    checkups?: Array<{
        title: string;
        type: string;
        time?: string;
        status: 'pending' | 'completed' | 'missed';
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const CarePlanSchema: Schema<ICarePlan> = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    medications: [{
        name: { type: String, required: true },
        dosage: { type: String },
        frequency: { type: String },
        time: { type: String },
        status: { type: String, enum: ['pending', 'completed', 'missed'], default: 'pending' }
    }],
    checkups: [{
        title: { type: String, required: true },
        type: { type: String },
        time: { type: String },
        status: { type: String, enum: ['pending', 'completed', 'missed'], default: 'pending' }
    }]
}, { timestamps: true });


// Export Models
// Check if models are already compiled to prevent OverwriteModelError
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const MedicalRecord: Model<IMedicalRecord> = mongoose.models.MedicalRecord || mongoose.model<IMedicalRecord>('MedicalRecord', MedicalRecordSchema);
export const Profile: Model<IProfile> = mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);
export const FamilyMember: Model<IFamilyMember> = mongoose.models.FamilyMember || mongoose.model<IFamilyMember>('FamilyMember', FamilyMemberSchema);
export const HealthStats: Model<IHealthStats> = mongoose.models.HealthStats || mongoose.model<IHealthStats>('HealthStats', HealthStatsSchema);
export const CarePlan: Model<ICarePlan> = mongoose.models.CarePlan || mongoose.model<ICarePlan>('CarePlan', CarePlanSchema);
