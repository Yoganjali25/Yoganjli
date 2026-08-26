export type SessionType = 'Online' | 'Offline' | 'Personal' | 'Group';
export type TimeSlot = 'Morning' | 'Evening' | 'Custom';
export type MembershipPlan = '8 Classes' | '12 Classes' | '16 Classes' | '20 Classes' | 'Unlimited' | 'Per Session';
export type PaymentStatus = 'Paid' | 'Pending' | 'Partial' | 'Overdue';
export type PaymentMode = 'Cash' | 'UPI' | 'Bank';
export type AttendanceStatus = 'Present' | 'Absent' | 'Leave';
export type Gender = 'Female' | 'Male';
export type FeeType = 'Monthly' | 'Per Session';
export type ClientStatus = 'Active' | 'Discontinued';

export interface TrainerProfile {
  name: string;
  studioName: string;
  phone: string;
  upiId: string;
  photoUrl: string;
  studioLogoUrl?: string;
  appTitle?: string;
  appSubtitle?: string;
}

export interface TrainerLeave {
  id: string;
  startDate: string; // e.g. "2026-08-10"
  endDate: string; // e.g. "2026-08-15"
  date?: string;
  reason: string; // e.g. "Personal Emergency", "Out of Station", "Health Rest Day"
  status: 'No Class' | 'Self Practice' | 'Substitute Class';
  notes?: string;
}

export interface TrainerDreamGoal {
  id: string;
  title: string; // e.g. "My Physical Yoga Studio Sanctuary"
  targetAmount: number; // e.g. 5000000
  savedAmount?: number; // Manual override or custom allocation
  photoUrl: string; // Vision image URL / uploaded photo
  targetDate?: string; // "2027-12-31"
  category?: 'Short Term' | 'Medium Term' | 'Long Term';
  notes?: string;
}

export interface WeightLog {
  id: string;
  date: string; // e.g. "2026-08-22"
  weight: number; // in kg e.g. 64.5
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  gender: Gender;
  phone: string;
  whatsapp: string;
  address: string;
  joiningDate: string;
  photoUrl: string;
  classTime: string; // e.g. "07:00 AM"
  days: string[]; // e.g. ["Mon", "Wed", "Fri"]
  timeSlot: TimeSlot;
  sessionType: SessionType;
  groupName?: string; // e.g. "Morning Vinyasa Batch (7:00 AM)"
  reasonsForJoining: string[];
  currentProblems: string[];
  feeType?: FeeType; // 'Monthly' | 'Per Session'
  feeStartMonth?: string; // e.g. "2026-07" or "2026-08"
  perSessionFee?: number; // e.g. 800
  monthlyFee: number;
  feeDueDate: string; // e.g. "5th"
  membershipPlan: MembershipPlan;
  completedClasses: number;
  totalClasses: number;
  paymentStatus: PaymentStatus;
  status?: ClientStatus; // 'Active' | 'Discontinued'
  leftDate?: string;
  leftReason?: string;
  trainerNotes: string;
  goal: string;
  startingWeight?: number;
  targetWeight?: number;
  weightLogs?: WeightLog[];
  medicalPrecautions?: string[];
  updatedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  clientId: string;
  clientName?: string;
  date: string; // e.g. "2026-07-28"
  status: AttendanceStatus;
}

export interface LeaveRecord {
  id: string;
  clientId: string;
  clientName: string;
  photoUrl: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  reason: string;
  duration: string;
  isFullMonthLeave?: boolean;
}

export interface PaymentRecord {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  date: string;
  month?: string;
  paymentMode: PaymentMode;
  paymentMethod?: string;
  status: PaymentStatus;
  notes?: string;
  updatedAt?: string;
}

export interface WebsiteCMS {
  // Top Announcement & Brand
  announcementBar: string;
  brandName: string;
  instructorName: string;
  tagline: string;

  // Hero Section (#home)
  heroTagline: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;

  // Why Choose Yoganjali Section (#benefits)
  whyTitle: string;
  whySubtitle: string;
  whyCard1Title: string;
  whyCard1Desc: string;
  whyCard2Title: string;
  whyCard2Desc: string;
  whyCard3Title: string;
  whyCard3Desc: string;
  whyCard4Title: string;
  whyCard4Desc: string;

  // About Anjali Section (#about)
  aboutTitle: string;
  aboutQuote: string;
  aboutBio1: string;
  aboutBio2: string;
  aboutImage: string;

  // Yoga Programs Section (#classes)
  classesTitle: string;
  classesSubtitle: string;
  personalClassTitle: string;
  personalClassDesc: string;
  personalClassPrice: string;
  groupClassTitle: string;
  groupClassDesc: string;
  groupClassPrice: string;
  wellnessClassTitle: string;
  wellnessClassDesc: string;
  wellnessClassPrice: string;

  // Goals Section (#goals)
  goalsTitle: string;
  goalsSubtitle: string;

  // Onboarding Section (#onboarding)
  onboardingTitle: string;
  onboardingSubtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;

  // Timeline Section
  timelineTitle: string;
  timelineSubtitle: string;

  // Testimonials Section (#testimonials)
  testimonialsTitle: string;
  testimonialsSubtitle: string;

  // FAQ Section (#faq)
  faqTitle: string;
  faqSubtitle: string;

  // Contact / Final CTA Section (#contact)
  contactTitle: string;
  contactSubtitle: string;
  contactImage: string;
  logoImage: string;

  // Contacts & Social Links
  displayPhone: string;
  displayPhone2: string;
  email: string;
  googleReviewsUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
}

export type BlogCategory = 
  | 'Yoga Asanas' 
  | 'Posture & Back Pain' 
  | 'Weight Management' 
  | 'Pranayama & Meditation' 
  | 'Holistic Wellness' 
  | 'Mindful Living'
  | string;

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  author: string;
  authorRole: string;
  authorPhoto?: string;
  date: string;
  readTime: string;
  tags: string[];
  isPublished: boolean;
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

