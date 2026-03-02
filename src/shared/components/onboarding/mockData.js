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
    timezone:     "Asia/Tehran",
    utcOffset:    "+03:30",
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
    timezone:     "America/New_York",
    utcOffset:    "-05:00",
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
    timezone:     "Asia/Kolkata",
    utcOffset:    "+05:30",
  },
];

// ── Mock next session generator ──────────────────────────────
// TODO(backend-integration): replace with real session data from API
export const MOCK_NEXT_SESSION = (therapist) => {
  // 48 hours from now — always in the free-cancellation window for demo
  const d = new Date(Date.now() + 48 * 3600 * 1000);
  return {
    therapistId:   therapist.id,
    therapistName: therapist.name,
    topic: { en: "Anxiety management", fa: "مدیریت اضطراب" },
    date:  { en: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
             fa: d.toLocaleDateString("fa-IR", { weekday: "short", month: "short", day: "numeric" }) },
    time:  { en: "10:00 AM", fa: "۱۰:۰۰ صبح" },
    dateISO: d.toISOString(),
    startTime: "10:00",
    dateStr: d.toISOString().slice(0, 10),
  };
};

// ── Mock assignments ─────────────────────────────────────────
// TODO(backend-integration): replace with real assignment data from API
export const MOCK_ASSIGNMENTS = [
  {
    id: "a1",
    type: "questionnaire",
    title:       { en: "Pre-session questionnaire", fa: "پرسشنامه پیش از جلسه" },
    description: { en: "Complete before your March 3 session", fa: "قبل از جلسه ۳ اسفند تکمیل شود" },
    therapistId: "t1",
    dueIn:       { en: "2 days", fa: "۲ روز دیگر" },
    dueUrgency:  "urgent",
    progress:    0,
    status:      "active",
  },
  {
    id: "a2",
    type: "journal",
    title:       { en: "Weekly reflection journal", fa: "دفترچه بازتاب هفتگی" },
    description: { en: "Write your feelings and experiences this week", fa: "احساسات و تجربیات این هفته را بنویسید" },
    therapistId: "t1",
    dueIn:       { en: "5 days", fa: "۵ روز دیگر" },
    dueUrgency:  "soon",
    progress:    0,
    status:      "active",
  },
  {
    id: "a3",
    type: "reading",
    title:       { en: "\"The Body Keeps the Score\" — Ch. 1–3", fa: "کتاب «بدن حساب می‌کنه» — فصل ۱–۳" },
    description: { en: "Share your reflection notes after reading", fa: "پس از مطالعه یادداشت بازتاب خود را بنویسید" },
    therapistId: "t1",
    dueIn:       { en: "2 weeks", fa: "۲ هفته دیگر" },
    dueUrgency:  "soon",
    progress:    0,
    status:      "active",
  },
  {
    id: "a4",
    type: "exercise",
    title:       { en: "30-min walk (3× per week)", fa: "پیاده‌روی ۳۰ دقیقه (۳ بار در هفته)" },
    description: { en: "Physical activity for mood regulation", fa: "فعالیت بدنی برای تنظیم خلق" },
    therapistId: "t1",
    dueIn:       { en: "Ongoing", fa: "مستمر" },
    dueUrgency:  "ongoing",
    progress:    66,
    status:      "active",
  },
  {
    id: "a5",
    type: "breathing",
    title:       { en: "Box breathing — 5 min daily", fa: "تنفس جعبه‌ای — ۵ دقیقه روزانه" },
    description: { en: "Inhale 4s · Hold 4s · Exhale 4s · Hold 4s", fa: "دم ۴ث · نگه ۴ث · بازدم ۴ث · نگه ۴ث" },
    therapistId: "t1",
    dueIn:       { en: "Ongoing", fa: "مستمر" },
    dueUrgency:  "ongoing",
    progress:    80,
    status:      "active",
  },
  {
    id: "a6",
    type: "mindfulness",
    title:       { en: "Gratitude journal — 3 items daily", fa: "دفترچه سپاس‌گزاری — ۳ مورد روزانه" },
    description: { en: "Write three things you're grateful for each night", fa: "هر شب سه چیزی که سپاس‌گزارشان هستید بنویسید" },
    therapistId: "t1",
    dueIn:       { en: "Ongoing", fa: "مستمر" },
    dueUrgency:  "ongoing",
    progress:    40,
    status:      "active",
  },
  {
    id: "a7",
    type: "questionnaire",
    title:       { en: "Intake assessment", fa: "ارزیابی اولیه" },
    description: { en: "Initial assessment questionnaire", fa: "پرسشنامه ارزیابی اولیه" },
    therapistId: "t1",
    dueIn:       null,
    dueUrgency:  null,
    progress:    100,
    status:      "completed",
    completedAt: { en: "Feb 20", fa: "۱ اسفند" },
  },
  {
    id: "a8",
    type: "reading",
    title:       { en: "\"Feeling Good\" — Introduction", fa: "کتاب «حس خوب» — مقدمه" },
    description: { en: "Introductory chapter on CBT basics", fa: "فصل مقدماتی درباره مبانی CBT" },
    therapistId: "t1",
    dueIn:       null,
    dueUrgency:  null,
    progress:    100,
    status:      "completed",
    completedAt: { en: "Feb 18", fa: "۲۹ بهمن" },
  },
];

// ── Schedule time slots ──────────────────────────────────────
// 8:00–18:50 with 70-minute intervals (50-min session + 20-min buffer)
export const SCHEDULE_SLOTS = [
  "08:00", "09:10", "10:20", "11:30",
  "12:40", "13:50", "15:00", "16:10", "17:20", "18:30",
];

// Day keys matching calendar.days i18n
export const SCHEDULE_DAYS = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"];

// ── Mock transactions (credit ledger) ────────────────────────
// TODO(backend-integration): replace with real transaction history from API
export const MOCK_TRANSACTIONS = [
  {
    id: "tx6", type: "booking", creditDelta: -1, balanceAfter: 3,
    date: "2026-02-28T10:15:00",
    description: { en: "Session booked — Dr. Mina Hosseini", fa: "رزرو جلسه — دکتر مینا حسینی" },
    therapistName: { en: "Dr. Mina Hosseini", fa: "دکتر مینا حسینی" },
    reasonCode: null, receiptAvailable: false,
  },
  {
    id: "tx5", type: "therapist_cancel_refund", creditDelta: 1, balanceAfter: 4,
    date: "2026-02-23T16:00:00",
    description: { en: "Therapist cancelled — credit returned", fa: "لغو توسط درمانگر — بازگشت اعتبار" },
    therapistName: { en: "Dr. Arash Karimi", fa: "دکتر آرش کریمی" },
    reasonCode: "therapist_cancel", receiptAvailable: false,
  },
  {
    id: "tx4", type: "auto_renew", creditDelta: 1, balanceAfter: 3,
    date: "2026-02-22T00:00:00",
    description: { en: "Auto-renew credit", fa: "اعتبار تمدید خودکار" },
    therapistName: null, reasonCode: null, receiptAvailable: true,
  },
  {
    id: "tx3", type: "patient_cancel_refund", creditDelta: 1, balanceAfter: 2,
    date: "2026-02-20T11:00:00",
    description: { en: "Cancellation refund (>24h)", fa: "بازگشت اعتبار لغو (بیش از ۲۴ ساعت)" },
    therapistName: { en: "Dr. Mina Hosseini", fa: "دکتر مینا حسینی" },
    reasonCode: "patient_free", receiptAvailable: false,
  },
  {
    id: "tx2", type: "booking", creditDelta: -1, balanceAfter: 1,
    date: "2026-02-18T14:30:00",
    description: { en: "Session booked — Dr. Mina Hosseini", fa: "رزرو جلسه — دکتر مینا حسینی" },
    therapistName: { en: "Dr. Mina Hosseini", fa: "دکتر مینا حسینی" },
    reasonCode: null, receiptAvailable: false,
  },
  {
    id: "tx1", type: "purchase", creditDelta: 4, balanceAfter: 4,
    date: "2026-02-15T09:00:00",
    description: { en: "Purchased 4-credit bundle", fa: "خرید بسته ۴ اعتباره" },
    therapistName: null, reasonCode: null, receiptAvailable: true,
  },
];

// ── Therapist availability (CREDIT-201) ──────────────────────
// Each therapist's recurring weekly availability as time ranges.
// Times are in therapist's local timezone.
export const MOCK_THERAPIST_AVAILABILITY = {
  t1: {
    timezone: "Asia/Tehran",
    utcOffset: "+03:30",
    ranges: {
      sat: [],
      sun: [{ start: "09:00", end: "16:30" }],
      mon: [{ start: "09:00", end: "16:30" }],
      tue: [{ start: "13:30", end: "21:00" }],
      wed: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:30" }],
      thu: [{ start: "10:00", end: "16:00" }],
      fri: [],
    },
  },
  t2: {
    timezone: "America/New_York",
    utcOffset: "-05:00",
    ranges: {
      sat: [],
      sun: [],
      mon: [{ start: "08:00", end: "15:30" }],
      tue: [{ start: "08:00", end: "15:30" }],
      wed: [{ start: "08:00", end: "15:30" }],
      thu: [{ start: "08:00", end: "12:30" }],
      fri: [{ start: "10:00", end: "14:30" }],
    },
  },
  t3: {
    timezone: "Asia/Kolkata",
    utcOffset: "+05:30",
    ranges: {
      sat: [{ start: "10:00", end: "16:00" }],
      sun: [{ start: "10:00", end: "16:00" }],
      mon: [{ start: "09:00", end: "18:00" }],
      tue: [],
      wed: [{ start: "09:00", end: "18:00" }],
      thu: [{ start: "09:00", end: "18:00" }],
      fri: [],
    },
  },
};
