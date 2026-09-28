import {
    boolean,
    doublePrecision,
    index,
    integer,
    jsonb,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core';

export type LocationJson = {
    pinCode?: string;
    city?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
};

export type EmergencyContactJson = {
    name?: string;
    relationship?: string;
    phone?: string;
};

export type MedicalVitals = {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    glucose?: number;
    bmi?: number;
};

export type LabValue = {
    name: string;
    value: string;
    unit?: string;
    normalRange?: string;
};

export type HealthVitals = {
    bp?: string;
    hr?: number;
    temperature?: number;
    weight?: number;
    glucose?: number;
};

export type CareMedication = {
    name: string;
    dosage?: string;
    frequency?: string;
    time?: string;
    status?: 'pending' | 'completed' | 'missed';
};

export type CareCheckup = {
    title: string;
    type?: string;
    time?: string;
    status?: 'pending' | 'completed' | 'missed';
};

export type MealItem = { name: string; portion: string };

export type DietPlan = {
    breakfast?: MealItem[];
    lunch?: MealItem[];
    dinner?: MealItem[];
    snacks?: MealItem[];
    restrictions?: string[];
    recommendations?: string[];
};

export type ExercisePlan = {
    activities?: Array<{
        name: string;
        duration: string;
        frequency: string;
        intensity?: string;
    }>;
    recommendations?: string[];
};

export type DailyTask = {
    title: string;
    description?: string;
    time?: string;
    status?: 'pending' | 'completed' | 'missed';
    category?: string;
};

export type WeeklyScheduleDay = {
    day: string;
    date?: string;
    appointments?: Array<{
        title: string;
        type?: 'medication' | 'exercise' | 'doctor' | 'checkup' | 'other';
        time: string;
        duration?: string;
        description?: string;
        status?: 'pending' | 'completed' | 'missed';
    }>;
};

export type BadgeMetadata = {
    problem?: string;
    milestone?: string;
    taskCount?: number;
    [key: string]: unknown;
};

function timestamps() {
    return {
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
    };
}

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name'),
    mobile: text('mobile').unique(),
    email: text('email').notNull().unique(),
    password: text('password'),
    otp: text('otp'),
    otpExpires: timestamp('otp_expires', { withTimezone: true }),
    isEmailVerified: boolean('is_email_verified').notNull().default(false),
    ...timestamps(),
});

export const profiles = pgTable('profiles', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
    dob: text('dob'),
    gender: text('gender'),
    bloodGroup: text('blood_group'),
    allergies: text('allergies'),
    chronicConditions: text('chronic_conditions'),
    pinCode: text('pin_code'),
    language: text('language').default('English'),
    location: jsonb('location').$type<LocationJson>(),
    emergencyContact: jsonb('emergency_contact').$type<EmergencyContactJson>(),
    ...timestamps(),
});

export const medicalRecords = pgTable('medical_records', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    diseaseName: text('disease_name'),
    medicines: jsonb('medicines').$type<string[]>().notNull().default([]),
    source: text('source').notNull().default('manual'),
    analyzedAt: timestamp('analyzed_at', { withTimezone: true }).defaultNow().notNull(),
    fileName: text('file_name'),
    fileUrl: text('file_url'),
    fileType: text('file_type'),
    fileSize: integer('file_size'),
    vitals: jsonb('vitals').$type<MedicalVitals>(),
    labValues: jsonb('lab_values').$type<LabValue[]>().notNull().default([]),
    reportDate: timestamp('report_date', { withTimezone: true }),
    doctorName: text('doctor_name'),
    hospitalName: text('hospital_name'),
    diagnosis: text('diagnosis'),
    symptoms: jsonb('symptoms').$type<string[]>().notNull().default([]),
    recommendations: jsonb('recommendations').$type<string[]>().notNull().default([]),
    ...timestamps(),
}, (table) => [
    index('medical_records_user_analyzed_idx').on(table.userId, table.analyzedAt),
]);

export const familyMembers = pgTable('family_members', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    relationship: text('relationship').notNull(),
    age: integer('age'),
    email: text('email'),
    phone: text('phone'),
    status: text('status').notNull().default('STABLE'),
    adherence: integer('adherence').notNull().default(100),
    emergencyAccess: boolean('emergency_access').notNull().default(false),
    image: text('image'),
    ...timestamps(),
});

export const healthStats = pgTable('health_stats', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
    streak: integer('streak').notNull().default(0),
    points: integer('points').notNull().default(0),
    vitals: jsonb('vitals').$type<HealthVitals>(),
    lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow().notNull(),
    ...timestamps(),
});

export const carePlans = pgTable('care_plans', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    problem: text('problem'),
    medications: jsonb('medications').$type<CareMedication[]>().notNull().default([]),
    checkups: jsonb('checkups').$type<CareCheckup[]>().notNull().default([]),
    dietPlan: jsonb('diet_plan').$type<DietPlan>(),
    exercisePlan: jsonb('exercise_plan').$type<ExercisePlan>(),
    dailyTasks: jsonb('daily_tasks').$type<DailyTask[]>().notNull().default([]),
    weeklySchedule: jsonb('weekly_schedule').$type<WeeklyScheduleDay[]>().notNull().default([]),
    ...timestamps(),
}, (table) => [
    index('care_plans_user_updated_idx').on(table.userId, table.updatedAt),
]);

export const badges = pgTable('badges', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    badgeType: text('badge_type').notNull(),
    badgeName: text('badge_name').notNull(),
    description: text('description').notNull(),
    icon: text('icon'),
    earnedAt: timestamp('earned_at', { withTimezone: true }).defaultNow().notNull(),
    metadata: jsonb('metadata').$type<BadgeMetadata>(),
    ...timestamps(),
}, (table) => [
    index('badges_user_earned_idx').on(table.userId, table.earnedAt),
]);

export const communityPosts = pgTable('community_posts', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    author: text('author').notNull(),
    avatar: text('avatar'),
    content: text('content').notNull(),
    category: text('category').notNull(),
    ...timestamps(),
}, (table) => [
    index('community_posts_created_idx').on(table.createdAt),
]);

export const communityPostLikes = pgTable('community_post_likes', {
    postId: uuid('post_id').notNull().references(() => communityPosts.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => [
    primaryKey({ columns: [table.postId, table.userId] }),
]);

export const communityComments = pgTable('community_comments', {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id').notNull().references(() => communityPosts.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    author: text('author').notNull(),
    avatar: text('avatar'),
    content: text('content').notNull(),
    ...timestamps(),
}, (table) => [
    index('community_comments_post_idx').on(table.postId, table.createdAt),
]);

export const communityGroups = pgTable('community_groups', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    image: text('image'),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
    ...timestamps(),
});

export const communityGroupMembers = pgTable('community_group_members', {
    groupId: uuid('group_id').notNull().references(() => communityGroups.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => [
    primaryKey({ columns: [table.groupId, table.userId] }),
]);

export const communityEvents = pgTable('community_events', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    description: text('description'),
    date: timestamp('date', { withTimezone: true }).notNull(),
    location: text('location').notNull(),
    type: text('type').notNull(),
    link: text('link'),
    createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
    ...timestamps(),
}, (table) => [
    index('community_events_date_idx').on(table.date),
]);

export const communityEventAttendees = pgTable('community_event_attendees', {
    eventId: uuid('event_id').notNull().references(() => communityEvents.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => [
    primaryKey({ columns: [table.eventId, table.userId] }),
]);

export const waterQualityReports = pgTable('water_quality_reports', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    pinCode: text('pin_code'),
    location: jsonb('location').$type<LocationJson>(),
    source: text('source').notNull(),
    turbidity: text('turbidity').notNull(),
    pH: doublePrecision('ph').notNull(),
    bacterialPresence: text('bacterial_presence').notNull(),
    notes: text('notes'),
    reportedAt: timestamp('reported_at', { withTimezone: true }).defaultNow().notNull(),
    ...timestamps(),
}, (table) => [
    index('water_quality_reported_idx').on(table.reportedAt),
    index('water_quality_pin_idx').on(table.pinCode),
]);

export const alerts = pgTable('alerts', {
    id: uuid('id').primaryKey().defaultRandom(),
    pincode: text('pincode').notNull(),
    riskLevel: text('risk_level').notNull(),
    message: text('message').notNull(),
    triggeredAt: timestamp('triggered_at', { withTimezone: true }).defaultNow().notNull(),
    status: text('status').notNull().default('ACTIVE'),
    ...timestamps(),
}, (table) => [
    index('alerts_status_pincode_idx').on(table.status, table.pincode),
]);
