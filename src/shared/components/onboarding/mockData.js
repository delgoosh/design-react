// ─────────────────────────────────────────────────────────────
// MOCK DATA — onboarding flows
// TODO(backend-integration): every export here should be replaced
// with real API calls once the backend is live.
// ─────────────────────────────────────────────────────────────

// ── OAuth mock import ────────────────────────────────────────
// TODO(backend-integration): replace with real OAuth flow via backend
export const MOCK_OAUTH = {
  google: { firstName: "Sara", lastName: "Mohammadi", avatar: null },
  apple:  { firstName: "Sara", lastName: "M.", avatar: null },
};

// ── AI Chat scripts ──────────────────────────────────────────
// TODO(backend-integration): replace scripted messages with real
// streaming AI responses from the matching engine.
export const AI_CHAT_SCRIPT = {
  patient: [
    { role: "ai", key: "p_ai_1", en: "Hi there! I'm Delgoosh AI, your matching assistant. I'll ask a few quick questions to find the best therapist for you.", fa: "سلام! من هوش مصنوعی دلگوش هستم، دستیار تطبیق شما. چند سؤال کوتاه می‌پرسم تا بهترین درمانگر را برایتان پیدا کنم." },
    { role: "ai", key: "p_ai_2", en: "Can you tell me a little about what's been on your mind lately?", fa: "می‌تونید کمی از چیزی که اخیراً ذهنتون رو مشغول کرده بگید؟" },
    { role: "ai", key: "p_ai_3", en: "Thank you for sharing that. How long have these feelings been going on?", fa: "ممنون که به اشتراک گذاشتید. چه مدته که این احساسات رو دارید؟" },
    { role: "ai", key: "p_ai_4", en: "I understand. Is there anything specific you're hoping to get out of therapy?", fa: "متوجه‌ام. آیا چیز خاصی هست که از روان‌درمانی انتظار دارید؟" },
    { role: "ai", key: "p_ai_5", en: "Great, I have enough information now. I'll find the best matches for you. Let's move on!", fa: "عالی، اطلاعات کافی دارم. بهترین تطابق‌ها رو براتون پیدا می‌کنم. بریم جلو!" },
  ],
  therapist: [
    { role: "ai", key: "t_ai_1", en: "Welcome to Delgoosh! I'm the AI assistant that helps set up your therapist profile. Let's get started.", fa: "به دلگوش خوش آمدید! من دستیار هوش مصنوعی هستم که به تنظیم پروفایل درمانگرتان کمک می‌کنم. بیایید شروع کنیم." },
    { role: "ai", key: "t_ai_2", en: "What's your primary therapeutic approach and how would you describe your style?", fa: "رویکرد درمانی اصلی شما چیست و سبک کارتون رو چطور توصیف می‌کنید؟" },
    { role: "ai", key: "t_ai_3", en: "That's great. What type of clients do you typically work best with?", fa: "عالیه. با چه نوع مراجعینی معمولاً بهتر کار می‌کنید؟" },
    { role: "ai", key: "t_ai_4", en: "And what topics or issues do you prefer not to work with?", fa: "و با چه موضوعات یا مسائلی ترجیح می‌دهید کار نکنید؟" },
    { role: "ai", key: "t_ai_5", en: "Perfect, your profile is shaping up nicely. Let's set up your weekly availability next!", fa: "عالی، پروفایلتان به خوبی شکل گرفت. حالا بیایید برنامه هفتگی‌تان را تنظیم کنیم!" },
  ],
};

// ── Suggested therapists (patient step 4) ─────────────────────
// TODO(backend-integration): replace with real matching engine results
export const MOCK_THERAPISTS = [
  {
    id: "t1",
    name:        { en: "Dr. Mina Hosseini", fa: "دکتر مینا حسینی" },
    credentials: { en: "Clinical Psychologist · PhD", fa: "روان‌شناس بالینی · دکتری" },
    specialties: [
      { en: "Anxiety", fa: "اضطراب" },
      { en: "Depression", fa: "افسردگی" },
      { en: "Mindfulness", fa: "ذهن‌آگاهی" },
    ],
    rating:       4.9,
    matchPercent: 95,
    nextSlot:     { en: "Tomorrow, 10:00 AM", fa: "فردا، ۱۰:۰۰ صبح" },
    avatar:       null,
  },
  {
    id: "t2",
    name:        { en: "Dr. Arash Karimi", fa: "دکتر آرش کریمی" },
    credentials: { en: "Psychiatrist · MD", fa: "روان‌پزشک · دکتری پزشکی" },
    specialties: [
      { en: "Trauma", fa: "تروما" },
      { en: "EMDR", fa: "EMDR" },
      { en: "CBT", fa: "CBT" },
    ],
    rating:       4.7,
    matchPercent: 88,
    nextSlot:     { en: "Wed, 3:00 PM", fa: "چهارشنبه، ۳:۰۰ بعدازظهر" },
    avatar:       null,
  },
  {
    id: "t3",
    name:        { en: "Dr. Leila Ahmadi", fa: "دکتر لیلا احمدی" },
    credentials: { en: "Family Therapist · MA", fa: "خانواده‌درمانگر · کارشناسی ارشد" },
    specialties: [
      { en: "Relationships", fa: "روابط" },
      { en: "Family", fa: "خانواده" },
      { en: "Self-esteem", fa: "اعتماد به نفس" },
    ],
    rating:       4.8,
    matchPercent: 82,
    nextSlot:     { en: "Thu, 11:00 AM", fa: "پنجشنبه، ۱۱:۰۰ صبح" },
    avatar:       null,
  },
];

// ── Mock next session generator ──────────────────────────────
// TODO(backend-integration): replace with real session data from API
export const MOCK_NEXT_SESSION = (therapist) => ({
  therapistId:   therapist.id,
  therapistName: therapist.name,
  topic: { en: "Anxiety management", fa: "مدیریت اضطراب" },
  date:  { en: "Tue, Feb 25", fa: "سه‌شنبه ۶ اسفند" },
  time:  { en: "10:00 AM", fa: "۱۰:۰۰ صبح" },
});

// ── Schedule time slots ──────────────────────────────────────
// 8:00–18:50 with 70-minute intervals (50-min session + 20-min buffer)
export const SCHEDULE_SLOTS = [
  "08:00", "09:10", "10:20", "11:30",
  "12:40", "13:50", "15:00", "16:10", "17:20", "18:30",
];

// Day keys matching calendar.days i18n
export const SCHEDULE_DAYS = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"];
