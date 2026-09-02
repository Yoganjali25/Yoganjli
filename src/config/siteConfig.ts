// Centralized Configuration for Anjali Negi - YOGANJALI
// Edit these values in one place to update the entire website!

export interface Testimonial {
  id: string;
  name: string;
  location?: string;
  quote: string;
  rating: number;
  isPlaceholder?: boolean;
}

export const SITE_CONFIG = {
  brandName: "YOGANJALI",
  tagline: "Yoga • Wellness • Mindful Living",
  instructorName: "Anjali Negi",
  title: "Certified Yoga Instructor & Wellness Coach",
  
  // WhatsApp Configuration (Destination number for Free Demo lead generation)
  whatsappNumber: "+919528191678", // Primary WhatsApp destination number
  displayPhone: "+91 95281 91678",
  displayPhone2: "+91 84491 37304",
  email: "negidytto@gmail.com",

  // Social Links
  socials: {
    instagram: "https://instagram.com/yoganjali25",
    instagramHandle: "@Yoganjali25",
    youtube: "https://www.youtube.com/@Yoganjali25",
    youtubeHandle: "@Yoganjali25",
    linkedin: "https://www.linkedin.com/in/anjalinegi25/",
    linkedinHandle: "@anjalinegi25",
    googleReviews: "https://share.google/Jz55Wo5fRsfuUPMhV",
  },

  // Images
  logoImage: "/yoganjali-logo.png", // Official Yoganjali brand logo
  heroImage: "/hero-group-yoga.jpg", // Anjali Negi live group outdoor session photo
  aboutImage: "/anjali-hero.jpg", // Anjali Negi individual yoga posture photo

  // Demo Availability & Pricing Config
  demoClassAvailability: "Daily Live Sessions (Morning & Evening)",
  demoClassPrice: "FREE (1-Day Trial)",
  
  pricing: {
    personalOneOnOne: "₹10,000 / month",
    groupClasses: "₹3,500 / month",
    perSession: "₹1,000 / session"
  },

  // Class Timings
  classTimings: [
    { label: "Morning Batch 1", time: "06:00 AM - 07:00 AM IST" },
    { label: "Morning Batch 2", time: "07:15 AM - 08:15 AM IST" },
    { label: "Evening Batch 1", time: "05:00 PM - 06:00 PM IST" },
    { label: "Evening Batch 2", time: "06:30 PM - 07:30 PM IST" },
  ],

  // Testimonials (Clear placeholders that can easily be edited later)
  testimonials: [
    {
      id: "t1",
      name: "Priya Sharma",
      location: "New Delhi",
      quote: "Anjali's sessions have completely transformed my posture and daily energy levels. Her step-by-step guidance makes online yoga feel like a personal studio at home!",
      rating: 5,
      isPlaceholder: false
    },
    {
      id: "t2",
      name: "Meera Nair",
      location: "Bangalore",
      quote: "As a complete beginner suffering from severe lower back pain, I was hesitant. Anjali adapted every pose for my body. Within 4 weeks, my mobility improved dramatically.",
      rating: 5,
      isPlaceholder: false
    },
    {
      id: "t3",
      name: "Ritu Verma",
      location: "Mumbai",
      quote: "The 60-minute session is perfectly structured — strength, breathwork, and deep relaxation. Anjali is attentive, calm, and truly cares about individual progress.",
      rating: 5,
      isPlaceholder: false
    },
    {
      id: "t4",
      name: "Divya Negi",
      location: "Verified Practitioner",
      quote: "Anjali's personal attention and customized yoga routines have helped me achieve my health goals.",
      rating: 5,
      isPlaceholder: false
    }
  ] as Testimonial[]
};

export const DEFAULT_WEBSITE_CMS = {
  // Top Announcement & Brand
  announcementBar: "🌸 1-Day Free Trial Available • Book Your Live Demo Session Today",
  brandName: "YOGANJALI",
  instructorName: "Anjali Negi",
  tagline: "Yoga Should Fit Into Your Life, Not Make It Complicated",

  // Hero Section (#home)
  heroTagline: "CERTIFIED YOGA INSTRUCTOR & HOLISTIC WELLNESS COACH",
  heroTitle: "Transform Your Body, Mind & Spirit With Authentic Yoga",
  heroSubtitle: "Experience personalized online 1-on-1 sessions and energetic group batches tailored for women and holistic wellness practitioners.",
  heroImage: "/hero-group-yoga.jpg",

  // Why Choose Yoganjali Section (#benefits)
  whyTitle: "Why Choose Yoganjali?",
  whySubtitle: "Experience authentic, personalized yoga tailored around your unique body, goals and schedule with Trainer Anjali Negi.",
  whyCard1Title: "Personal 1-on-1 Attention",
  whyCard1Desc: "Customized live posture alignment, breathing guidance and pace designed specifically for your body and strength.",
  whyCard2Title: "Flexible Timing & Batches",
  whyCard2Desc: "Morning and Evening online group batches and private slots that seamlessly fit your daily lifestyle.",
  whyCard3Title: "Holistic Health Focus",
  whyCard3Desc: "Combines physical asanas, core strength, joint mobility, stress relief, and pranayama breathing.",
  whyCard4Title: "Beginner Friendly Environment",
  whyCard4Desc: "Step-by-step gentle progression with zero pressure. Suitable for all age groups and experience levels.",

  // About Anjali Section (#about)
  aboutTitle: "Hi, I'm Anjali Negi",
  aboutQuote: '"Yoga should fit into your life, not make your life complicated."',
  aboutBio1: "I am a certified yoga instructor and wellness coach dedicated to helping practitioners build sustainable movement habits, core strength, and inner stillness.",
  aboutBio2: "My sessions combine yoga asanas, mobility work, pranayama, breathing practices, relaxation and mindful movement.",
  aboutImage: "/anjali-hero.jpg",

  // Yoga Programs Section (#classes)
  classesTitle: "Yoga Programs Designed Around You",
  classesSubtitle: "Choose the practice format that fits your daily routine, goals and lifestyle.",
  personalClassTitle: "Personal Online Yoga",
  personalClassDesc: "Customized live 1-on-1 yoga adapted specifically to your body structure, health goals, injuries and daily pace.",
  personalClassPrice: "₹10,000 / month",
  groupClassTitle: "Group Yoga Batches",
  groupClassDesc: "Energetic, motivating online group sessions designed for consistent daily practice and community spirit.",
  groupClassPrice: "₹3,500 / month",
  wellnessClassTitle: "Wellness & Care Yoga",
  wellnessClassDesc: "Therapeutic yoga focused on back pain relief, joint mobility, stress reduction, and hormonal balance.",
  wellnessClassPrice: "₹5,000 / month",

  // Goals Section (#goals)
  goalsTitle: "Programs Targeted To Your Health Goals",
  goalsSubtitle: "Specific practices designed to deliver real, noticeable health transformations.",

  // Onboarding Section (#onboarding)
  onboardingTitle: "Simple 4-Step Onboarding Process",
  onboardingSubtitle: "Start your personalized yoga journey with Anjali Negi in 4 easy steps.",
  step1Title: "Book Free Demo",
  step1Desc: "Fill out the quick 1-minute form to choose your preferred demo slot.",
  step2Title: "Select Batch & Time",
  step2Desc: "Pick 1-on-1 or group batch timing that fits your schedule.",
  step3Title: "Receive Custom Plan",
  step3Desc: "Anjali reviews your health notes and crafts your routine.",
  step4Title: "Begin Practice",
  step4Desc: "Join live online sessions and build sustainable health habits.",

  // Timeline Section
  timelineTitle: "60 Minutes For You",
  timelineSubtitle: "Every session is structured to balance movement, strength, breath and relaxation.",

  // Testimonials Section (#testimonials)
  testimonialsTitle: "What My Students Say",
  testimonialsSubtitle: "Real stories from practitioners who transformed their health and daily peace with Anjali Negi.",

  // FAQ Section (#faq)
  faqTitle: "Frequently Asked Questions",
  faqSubtitle: "Got questions? Here is everything you need to know about joining Yoganjali Studio.",

  // Contact / Final CTA Section (#contact)
  contactTitle: "Ready to Transform Your Body & Peace of Mind?",
  contactSubtitle: "Join Anjali Negi's studio today for personalized guidance, core strength and daily tranquility.",
  contactImage: "/anjali-mountain-pose.jpg",
  logoImage: "/yoganjali-logo.png",

  // Contacts & Social Links
  displayPhone: "+91 95281 91678",
  displayPhone2: "+91 84491 37304",
  email: "negidytto@gmail.com",
  googleReviewsUrl: "https://share.google/Jz55Wo5fRsfuUPMhV",
  instagramUrl: "https://instagram.com/yoganjali25",
  youtubeUrl: "https://www.youtube.com/@Yoganjali25"
};

export const DEFAULT_PACKAGES_CMS = {
  // Hero & Taglines
  title: "Online Yoga For Every You",
  subtitle: "Heal Your Body • Calm Your Mind • Elevate Your Life",
  badge: "Official 2026 Fee Structure",
  heroTagline: "Join Online Yoga Sessions Tailored to Your Body, Your Goals & Your Lifestyle",

  // Package 1: One-On-One Personal Yoga Sessions
  personalTitle: "One-On-One Personal Yoga Sessions",
  personalSubtitle: "Personalized yoga guidance tailored to your body, your goals & your lifestyle.",
  personalMonthlyPrice: 7999,
  personalMonthlyOriginalPrice: 9999,
  personalSinglePrice: 799,
  personalFeatures: [
    "Personalized Yoga Plan",
    "Live Online Sessions (Google Meet / Zoom)",
    "Pranayama & Breathwork",
    "Meditation & Deep Relaxation",
    "Weekly Progress & Posture Tracking",
    "Direct WhatsApp Support & Custom Guidance"
  ],
  personalFocusTags: [
    "Weight Loss",
    "Flexibility & Mobility",
    "Strength Building",
    "Stress Management",
    "Back Pain Relief",
    "Better Posture & Wellness"
  ],

  // Package 2: Group Yoga Classes
  groupTitle: "Group Yoga Classes",
  groupSubtitle: "Practice together. Grow together.",
  groupMonthlyPrice: 2000,
  groupMonthlyOriginalPrice: 2999,
  groupFeatures: [
    "Live Interactive Group Yoga Sessions",
    "Guided Pranayama & Breath Control",
    "Mindfulness & Meditation Practices",
    "Recorded Session Access (Optional)",
    "Friendly & Supportive Community Support"
  ],
  groupAudienceTags: [
    "Beginners",
    "Working Professionals",
    "Homemakers",
    "Seniors",
    "Wellness Enthusiasts"
  ],
  groupBenefits: [
    "Improve Flexibility",
    "Increase Strength",
    "Better Mobility",
    "Reduce Stress & Anxiety",
    "Improve Energy Levels",
    "Build Consistency",
    "Learn in a Supportive Community"
  ],

  // Payment Details
  upiId: "9528191678@axl",
  accountName: "Anjali",
  bankName: "State Bank of India",
  accountNumber: "39933201060",
  ifscCode: "SBIN0008778",
  branch: "Nauti, Uttarakhand",
  paymentPhone: "+91 9528191678",
  whatsappMessage: "Namaste Anjali ji, I would like to join the Yoga Package!",

  // Important Terms & Notes
  importantNotes: [
    "Sessions are non-refundable and non-transferable.",
    "Please be on time for each session to make the most of your practice.",
    "Join from a quiet space with a stable internet connection.",
    "Your consistency is the key to your transformation."
  ],

  // Real Yoga Photos
  photoTerrace: "/yoga_pose_terrace.jpg",
  photoPlank: "/yoga_pose_plank.jpg",
  photoBeach: "/yoga_pose_beach.jpg"
};

