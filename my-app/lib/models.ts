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
    // Enhanced extracted data
    vitals?: {
        bloodPressure?: string;
        heartRate?: number;
        temperature?: number;
        weight?: number;
        glucose?: number;
        bmi?: number;
    };
    labValues?: Array<{
        name: string;
        value: string;
        unit?: string;
        normalRange?: string;
    }>;
    reportDate?: Date;
    doctorName?: string;
    hospitalName?: string;
    diagnosis?: string;
    symptoms?: string[];
    recommendations?: string[];
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
    fileSize: { type: Number },
    // Enhanced extracted data
    vitals: {
        bloodPressure: { type: String },
        heartRate: { type: Number },
        temperature: { type: Number },
        weight: { type: Number },
        glucose: { type: Number },
        bmi: { type: Number }
    },
    labValues: [{
        name: { type: String },
        value: { type: String },
        unit: { type: String },
        normalRange: { type: String }
    }],
    reportDate: { type: Date },
    doctorName: { type: String },
    hospitalName: { type: String },
    diagnosis: { type: String },
    symptoms: [{ type: String }],
    recommendations: [{ type: String }]
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
    problem?: string; // Associated health problem/condition
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
    dietPlan?: {
        breakfast?: Array<{ name: string; portion: string }>;
        lunch?: Array<{ name: string; portion: string }>;
        dinner?: Array<{ name: string; portion: string }>;
        snacks?: Array<{ name: string; portion: string }>;
        restrictions?: string[];
        recommendations?: string[];
    };
    exercisePlan?: {
        activities?: Array<{
            name: string;
            duration: string;
            frequency: string;
            intensity?: string;
        }>;
        recommendations?: string[];
    };
    dailyTasks?: Array<{
        title: string;
        description?: string;
        time?: string;
        status: 'pending' | 'completed' | 'missed';
        category?: string;
    }>;
    weeklySchedule?: Array<{
        day: string; // 'Monday', 'Tuesday', etc.
        date?: string; // ISO date string
        appointments?: Array<{
            title: string;
            type: 'medication' | 'exercise' | 'doctor' | 'checkup' | 'other';
            time: string; // e.g., '08:00 AM'
            duration?: string;
            description?: string;
            status?: 'pending' | 'completed' | 'missed';
        }>;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const CarePlanSchema: Schema<ICarePlan> = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    problem: { type: String },
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
    }],
    dietPlan: {
        breakfast: [{
            name: { type: String },
            portion: { type: String }
        }],
        lunch: [{
            name: { type: String },
            portion: { type: String }
        }],
        dinner: [{
            name: { type: String },
            portion: { type: String }
        }],
        snacks: [{
            name: { type: String },
            portion: { type: String }
        }],
        restrictions: [{ type: String }],
        recommendations: [{ type: String }]
    },
    exercisePlan: {
        activities: [{
            name: { type: String },
            duration: { type: String },
            frequency: { type: String },
            intensity: { type: String }
        }],
        recommendations: [{ type: String }]
    },
    dailyTasks: [{
        title: { type: String, required: true },
        description: { type: String },
        time: { type: String },
        status: { type: String, enum: ['pending', 'completed', 'missed'], default: 'pending' },
        category: { type: String }
    }],
    weeklySchedule: [{
        day: { type: String, required: true },
        date: { type: String },
        appointments: [{
            title: { type: String, required: true },
            type: { type: String, enum: ['medication', 'exercise', 'doctor', 'checkup', 'other'], default: 'other' },
            time: { type: String, required: true },
            duration: { type: String },
            description: { type: String },
            status: { type: String, enum: ['pending', 'completed', 'missed'], default: 'pending' }
        }]
    }]
}, { timestamps: true });


// Export Models
// Check if models are already compiled to prevent OverwriteModelError
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const MedicalRecord: Model<IMedicalRecord> = mongoose.models.MedicalRecord || mongoose.model<IMedicalRecord>('MedicalRecord', MedicalRecordSchema);
export const Profile: Model<IProfile> = mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);
export const FamilyMember: Model<IFamilyMember> = mongoose.models.FamilyMember || mongoose.model<IFamilyMember>('FamilyMember', FamilyMemberSchema);
export const HealthStats: Model<IHealthStats> = mongoose.models.HealthStats || mongoose.model<IHealthStats>('HealthStats', HealthStatsSchema);

// Force re-compilation of CarePlan model in dev to pick up schema changes
if (process.env.NODE_ENV !== 'production') delete mongoose.models.CarePlan;
export const CarePlan: Model<ICarePlan> = mongoose.models.CarePlan || mongoose.model<ICarePlan>('CarePlan', CarePlanSchema);

// --- Badge/Achievement Schema ---
export interface IBadge extends Document {
    userId: mongoose.Types.ObjectId;
    badgeType: string; // 'milestone', 'task_completion', 'health_goal', 'problem_management'
    badgeName: string;
    description: string;
    icon?: string;
    earnedAt: Date;
    metadata?: {
        problem?: string;
        milestone?: string;
        taskCount?: number;
        [key: string]: unknown;
    };
    createdAt: Date;
    updatedAt: Date;
}

const BadgeSchema: Schema<IBadge> = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    badgeType: { type: String, required: true },
    badgeName: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String },
    earnedAt: { type: Date, default: Date.now },
    metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

export const Badge: Model<IBadge> = mongoose.models.Badge || mongoose.model<IBadge>('Badge', BadgeSchema);

// --- Community Post Schema ---
export interface ICommunityPost extends Document {
    userId: mongoose.Types.ObjectId;
    author: string; // User's name
    avatar?: string; // User's avatar or initials
    content: string;
    category: string; // 'Diabetes Warriors', 'Ask the Community', 'Health Tips', etc.
    likes: mongoose.Types.ObjectId[]; // Array of user IDs who liked
    comments: mongoose.Types.ObjectId[]; // Array of comment IDs
    createdAt: Date;
    updatedAt: Date;
}

const CommunityPostSchema: Schema<ICommunityPost> = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    author: { type: String, required: true },
    avatar: { type: String },
    content: { type: String, required: true },
    category: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'CommunityComment' }]
}, { timestamps: true });

// --- Community Comment Schema ---
export interface ICommunityComment extends Document {
    postId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    author: string;
    avatar?: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const CommunityCommentSchema: Schema<ICommunityComment> = new Schema({
    postId: { type: Schema.Types.ObjectId, ref: 'CommunityPost', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    author: { type: String, required: true },
    avatar: { type: String },
    content: { type: String, required: true }
}, { timestamps: true });

// --- Community Group Schema ---
export interface ICommunityGroup extends Document {
    name: string;
    description: string;
    image?: string;
    tags: string[];
    members: mongoose.Types.ObjectId[]; // Array of user IDs
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const CommunityGroupSchema: Schema<ICommunityGroup> = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    tags: [{ type: String }],
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// --- Community Event Schema ---
export interface ICommunityEvent extends Document {
    title: string;
    description?: string;
    date: Date;
    location: string;
    type: 'Online' | 'Offline';
    link?: string; // For online events
    attendees: mongoose.Types.ObjectId[]; // Array of user IDs
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const CommunityEventSchema: Schema<ICommunityEvent> = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    type: { type: String, enum: ['Online', 'Offline'], required: true },
    link: { type: String },
    attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Export Community Models
export const CommunityPost: Model<ICommunityPost> = mongoose.models.CommunityPost || mongoose.model<ICommunityPost>('CommunityPost', CommunityPostSchema);
export const CommunityComment: Model<ICommunityComment> = mongoose.models.CommunityComment || mongoose.model<ICommunityComment>('CommunityComment', CommunityCommentSchema);
export const CommunityGroup: Model<ICommunityGroup> = mongoose.models.CommunityGroup || mongoose.model<ICommunityGroup>('CommunityGroup', CommunityGroupSchema);
export const CommunityEvent: Model<ICommunityEvent> = mongoose.models.CommunityEvent || mongoose.model<ICommunityEvent>('CommunityEvent', CommunityEventSchema);

// --- Water Quality Report Schema (Smart Health Surveillance) ---
export interface IWaterQualityReport extends Document {
    userId: mongoose.Types.ObjectId;
    pinCode?: string;
    location?: { city?: string; state?: string; latitude?: number; longitude?: number };
    source: string; // 'hand_pump' | 'well' | 'tap' | 'pond' | 'other'
    turbidity: string; // 'low' | 'medium' | 'high'
    pH: number;
    bacterialPresence: 'pass' | 'fail' | 'unknown';
    notes?: string;
    reportedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const WaterQualityReportSchema: Schema<IWaterQualityReport> = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    pinCode: { type: String },
    location: {
        city: { type: String },
        state: { type: String },
        latitude: { type: Number },
        longitude: { type: Number }
    },
    source: { type: String, required: true, enum: ['hand_pump', 'well', 'tap', 'pond', 'other'] },
    turbidity: { type: String, required: true, enum: ['low', 'medium', 'high'] },
    pH: { type: Number, required: true },
    bacterialPresence: { type: String, required: true, enum: ['pass', 'fail', 'unknown'] },
    notes: { type: String },
    reportedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const WaterQualityReport: Model<IWaterQualityReport> = mongoose.models.WaterQualityReport || mongoose.model<IWaterQualityReport>('WaterQualityReport', WaterQualityReportSchema);

// --- Alert Schema (for health officials / outbreak warnings) ---
export interface IAlert extends Document {
    type: 'outbreak_risk' | 'water_contamination' | 'spike_in_cases';
    severity: 'low' | 'medium' | 'high';
    area: { pinCode?: string; city?: string; state?: string };
    message: string;
    metadata?: Record<string, unknown>;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AlertSchema: Schema<IAlert> = new Schema({
    type: { type: String, required: true, enum: ['outbreak_risk', 'water_contamination', 'spike_in_cases'] },
    severity: { type: String, required: true, enum: ['low', 'medium', 'high'] },
    area: {
        pinCode: { type: String },
        city: { type: String },
        state: { type: String }
    },
    message: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    readAt: { type: Date }
}, { timestamps: true });

export const Alert: Model<IAlert> = mongoose.models.Alert || mongoose.model<IAlert>('Alert', AlertSchema);
