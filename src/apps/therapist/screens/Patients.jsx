// ─────────────────────────────────────────────────────────────
// THERAPIST / Patients
// ─────────────────────────────────────────────────────────────
// Two-level view: patient list (sorted by session / alpha) →
// patient detail (engagement, sessions, notes, assignments).
//
// Inactive patients (no future sessions) are shown name-only.
//
// TODO(backend-integration): all data is mock — replace with
// real API calls for patients, sessions, notes, assignments.
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { useLang, useIsDesktop, Card, Tag, Button, Avatar, Ic, SessionCard, Textarea, BottomSheet } from "@ds";
import { COLORS, RADIUS, FONTS } from "@ds";

// ── Mock data ─────────────────────────────────────────────────
const MOCK_PATIENTS = [
  {
    id: "p1",
    name:     { en: "Sara Mohammadi", fa: "سارا محمدی" },
    initials: "SM",
    status:   "active",
    since:    { en: "Oct 2024", fa: "مهر ۱۴۰۳" },
    nextSession: {
      date:  { en: "Tue, Mar 4", fa: "سه‌شنبه ۱۳ اسفند" },
      time:  { en: "10:00 AM", fa: "۱۰:۰۰ صبح" },
      topic: { en: "Anxiety management — session 5", fa: "مدیریت اضطراب — جلسه ۵" },
      hoursUntil: 48,
    },
    totalSessions: 12,
    pendingItems: 1,
    generalNotes: [
      {
        id: "n1",
        text: { en: "Patient responds well to CBT techniques. Focus on exposure therapy next session.",
                fa: "بیمار به تکنیک‌های CBT پاسخ خوبی می‌دهد. جلسه بعد روی مواجهه‌درمانی تمرکز شود." },
        date: { en: "Feb 25, 2025", fa: "۶ اسفند ۱۴۰۳" },
      },
      {
        id: "n2",
        text: { en: "Ask about sleep patterns — mentioned insomnia last session.",
                fa: "درباره الگوی خواب بپرسید — جلسه قبل از بی‌خوابی صحبت کرد." },
        date: { en: "Feb 18, 2025", fa: "۲۹ بهمن ۱۴۰۳" },
      },
    ],
    pastSessions: [
      {
        id: "s1", date: { en: "Feb 25, 10:00 AM", fa: "۶ اسفند، ۱۰:۰۰" }, topic: { en: "Anxiety management", fa: "مدیریت اضطراب" }, hasTranscript: true, hasAiSummary: true, hasNote: true,
        transcriptText: {
          en: "Therapist: How have you been feeling since our last session?\n\nSara: I've been doing a bit better, actually. The breathing exercises have helped when I feel the anxiety coming on, especially in the mornings before work.\n\nTherapist: That's great progress. Can you tell me more about what triggers the anxiety in the mornings?\n\nSara: It's usually when I start thinking about my workload. I have this pattern of catastrophizing — imagining everything going wrong before the day even starts.\n\nTherapist: Let's work on some cognitive restructuring techniques today. When you notice that pattern, I'd like you to try identifying the specific thought and asking yourself: what evidence do I have that this will actually happen?",
          fa: "درمانگر: از جلسه قبل تا حالا چه حالی داشتید؟\n\nسارا: راستش کمی بهتر بوده. تمرین‌های تنفس وقتی احساس می‌کنم اضطراب داره میاد کمک کرده، مخصوصاً صبح‌ها قبل از کار.\n\nدرمانگر: این پیشرفت خوبی‌ه. می‌تونید بیشتر بگید چه چیزی صبح‌ها اضطراب رو تحریک می‌کنه؟\n\nسارا: معمولاً وقتی شروع می‌کنم به فکر کردن درباره حجم کارم. یه الگوی فاجعه‌سازی دارم — تصور می‌کنم همه چیز قبل از شروع روز خراب می‌شه.\n\nدرمانگر: بیایید امروز روی تکنیک‌های بازسازی شناختی کار کنیم. وقتی این الگو رو متوجه می‌شید، می‌خوام سعی کنید فکر خاص رو شناسایی کنید و از خودتان بپرسید: چه مدرکی دارم که این واقعاً اتفاق بیفتد؟",
        },
        aiSummaryText: {
          en: "Session focused on anxiety management with cognitive restructuring techniques.\n\nKey observations:\n• Patient reports improvement with breathing exercises, particularly effective in morning anxiety episodes\n• Primary trigger identified: work-related catastrophizing thoughts\n• Pattern of anticipatory anxiety with cognitive distortion\n\nInterventions used:\n• Cognitive restructuring — evidence-based thought challenging\n• Continued breathing exercises as coping mechanism\n\nRecommendations:\n• Continue daily breathing practice\n• Introduce thought record journal\n• Follow up on sleep quality next session",
          fa: "جلسه بر مدیریت اضطراب با تکنیک‌های بازسازی شناختی متمرکز بود.\n\nمشاهدات کلیدی:\n• بیمار بهبود با تمرین‌های تنفس گزارش می‌دهد\n• محرک اصلی شناسایی شده: افکار فاجعه‌ساز مرتبط با کار\n• الگوی اضطراب پیش‌بینانه با تحریف شناختی\n\nمداخلات استفاده‌شده:\n• بازسازی شناختی — چالش فکر مبتنی بر شواهد\n• ادامه تمرین‌های تنفس به‌عنوان مکانیسم مقابله\n\nتوصیه‌ها:\n• ادامه تمرین تنفس روزانه\n• معرفی دفترچه ثبت افکار\n• پیگیری کیفیت خواب در جلسه بعدی",
        },
        noteText: {
          en: "Patient showing steady improvement in anxiety management. Breathing exercises are effective as a first-line coping strategy. Need to monitor catastrophizing patterns more closely and introduce structured thought records.",
          fa: "بیمار بهبود پایداری در مدیریت اضطراب نشان می‌دهد. تمرین‌های تنفس به‌عنوان راهبرد مقابله‌ای خط اول مؤثر است. نیاز به نظارت دقیق‌تر بر الگوهای فاجعه‌سازی و معرفی ثبت ساختارمند افکار.",
        },
      },
      {
        id: "s2", date: { en: "Feb 18, 10:00 AM", fa: "۲۹ بهمن، ۱۰:۰۰" }, topic: { en: "Anxiety triggers", fa: "محرک‌های اضطراب" }, hasTranscript: true, hasAiSummary: false, hasNote: false,
        transcriptText: {
          en: "Therapist: Today I'd like us to map out your anxiety triggers. Can you walk me through a recent situation?\n\nSara: Last Thursday, I had a presentation at work. The night before, I couldn't sleep at all. My heart was racing and I kept thinking I'd forget everything.\n\nTherapist: What happened during the actual presentation?\n\nSara: It actually went fine. My manager even said it was good. But the build-up was terrible.\n\nTherapist: This is a common pattern — the anticipation is often much worse than the event itself. Let's create a hierarchy of situations that trigger anxiety for you.",
          fa: "درمانگر: امروز می‌خوام محرک‌های اضطراب شما رو نقشه‌برداری کنیم. می‌تونید یه موقعیت اخیر رو توضیح بدید؟\n\nسارا: پنجشنبه گذشته ارائه‌ای در کار داشتم. شب قبلش اصلاً نتونستم بخوابم. قلبم تند می‌زد و مدام فکر می‌کردم همه چیز یادم می‌ره.\n\nدرمانگر: خود ارائه چطور پیش رفت؟\n\nسارا: واقعاً خوب پیش رفت. مدیرم حتی گفت خوب بود. ولی تنش قبلش وحشتناک بود.\n\nدرمانگر: این یه الگوی رایجه — پیش‌بینی اغلب خیلی بدتر از خود رویداده. بیایید یه سلسله‌مراتب از موقعیت‌هایی که اضطراب ایجاد می‌کنن بسازیم.",
        },
      },
      {
        id: "s3", date: { en: "Feb 11, 10:00 AM", fa: "۲۲ بهمن، ۱۰:۰۰" }, topic: { en: "Cognitive restructuring", fa: "بازسازی شناختی" }, hasTranscript: true, hasAiSummary: true, hasNote: true,
        transcriptText: {
          en: "Therapist: Let's review the thought record you've been keeping. Were there any patterns you noticed?\n\nSara: Yes, I noticed that most of my negative thoughts happen on Sunday evenings. It's like a switch flips and I start dreading Monday.\n\nTherapist: That's excellent self-awareness. What thoughts come up specifically?\n\nSara: Things like 'I'll never catch up' or 'Everyone will see I'm struggling.' When I wrote them down, they seemed less scary.\n\nTherapist: That's exactly the power of cognitive restructuring. Writing the thought makes it concrete, and then we can examine it objectively.",
          fa: "درمانگر: بیایید دفترچه ثبت افکار رو مرور کنیم. آیا الگویی متوجه شدید؟\n\nسارا: بله، متوجه شدم بیشتر افکار منفی‌ام یکشنبه شب‌ها اتفاق می‌افته. انگار یه کلید زده می‌شه و شروع می‌کنم از دوشنبه وحشت داشتن.\n\nدرمانگر: این خودآگاهی عالی‌ه. دقیقاً چه افکاری میان؟\n\nسارا: چیزهایی مثل «هیچ‌وقت نمی‌رسم» یا «همه می‌بینن دارم تقلا می‌کنم.» وقتی نوشتمشون، کمتر ترسناک به نظر رسیدن.\n\nدرمانگر: دقیقاً قدرت بازسازی شناختی همینه. نوشتن فکر اون رو ملموس می‌کنه و بعد می‌تونیم عینی بررسیش کنیم.",
        },
        aiSummaryText: {
          en: "Session introduced cognitive restructuring through thought records.\n\nKey findings:\n• Sunday evenings identified as peak anxiety trigger point\n• Common automatic thoughts: 'I'll never catch up', 'Everyone will see I'm struggling'\n• Patient demonstrates growing self-awareness through journaling\n\nProgress:\n• Thought recording reducing perceived threat level\n• Patient engaging well with homework assignments",
          fa: "جلسه بازسازی شناختی از طریق ثبت افکار معرفی شد.\n\nیافته‌های کلیدی:\n• یکشنبه شب‌ها به‌عنوان نقطه اوج محرک اضطراب شناسایی شد\n• افکار خودکار رایج: «هیچ‌وقت نمی‌رسم»، «همه می‌بینن تقلا می‌کنم»\n• بیمار خودآگاهی فزاینده‌ای از طریق دفترچه‌نویسی نشان می‌دهد\n\nپیشرفت:\n• ثبت افکار سطح تهدید درک‌شده را کاهش می‌دهد\n• بیمار به‌خوبی با تکالیف درگیر می‌شود",
        },
        noteText: {
          en: "Good progress with thought records. Sunday evening pattern is significant — consider scheduling a brief check-in message on Sunday evenings as preventive support.",
          fa: "پیشرفت خوب با ثبت افکار. الگوی یکشنبه شب مهم است — ارسال پیام کوتاه یکشنبه شب‌ها به‌عنوان حمایت پیشگیرانه در نظر گرفته شود.",
        },
      },
    ],
    assignments: [
      { id: "a1", type: "breathing",     title: { en: "Daily breathing exercise", fa: "تمرین تنفس روزانه" },   status: "active", progress: 40, date: { en: "Feb 20", fa: "۱ اسفند" } },
      { id: "a2", type: "journal",       title: { en: "Mood journal", fa: "دفترچه خلق" },                       status: "done",   date: { en: "Feb 15", fa: "۲۶ بهمن" },
        result: {
          text: { en: "Today I noticed my anxiety peaks in the mornings before work. I tried the breathing technique and it helped me calm down before my commute. I also noticed that I feel better after exercising — even just a short walk helps.", fa: "امروز متوجه شدم اضطرابم صبح‌ها قبل از کار به اوج می‌رسد. تکنیک تنفس را امتحان کردم و قبل از رفتن آرام‌تر شدم. همچنین متوجه شدم بعد از ورزش حالم بهتر می‌شود." },
          shared: true, submittedAt: { en: "Feb 15, 2025", fa: "۲۶ بهمن ۱۴۰۳" },
        },
      },
      { id: "a6", type: "reading",       title: { en: "Feeling Good — Chapter 3", fa: "حس خوب — فصل ۳" },       status: "done",   date: { en: "Feb 12", fa: "۲۳ بهمن" },
        result: {
          text: null, shared: false, submittedAt: { en: "Feb 12, 2025", fa: "۲۳ بهمن ۱۴۰۳" },
        },
      },
    ],
    engagement: { firstSession: { en: "Oct 12, 2024", fa: "۲۱ مهر ۱۴۰۳" }, onboardingComplete: true, chatMessages: 8 },
  },
  {
    id: "p2",
    name:     { en: "Ali Rezaei", fa: "علی رضایی" },
    initials: "AR",
    status:   "active",
    since:    { en: "Nov 2024", fa: "آبان ۱۴۰۳" },
    nextSession: {
      date:  { en: "Thu, Mar 6", fa: "پنجشنبه ۱۵ اسفند" },
      time:  { en: "2:00 PM", fa: "۱۴:۰۰" },
      topic: { en: "Depression follow-up — session 9", fa: "پیگیری افسردگی — جلسه ۹" },
      hoursUntil: 96,
    },
    totalSessions: 8,
    pendingItems: 0,
    generalNotes: [],
    pastSessions: [
      {
        id: "s4", date: { en: "Feb 24, 2:00 PM", fa: "۵ اسفند، ۱۴:۰۰" }, topic: { en: "Depression follow-up", fa: "پیگیری افسردگی" }, hasTranscript: true, hasAiSummary: false, hasNote: false,
        transcriptText: {
          en: "Therapist: Ali, how has your mood been this past week?\n\nAli: It's been up and down. I had a couple of good days where I actually felt motivated to go for a walk, but then the weekend hit and I just stayed in bed most of the time.\n\nTherapist: Those good days are important. What was different about them?\n\nAli: I think it was because I had plans with a friend. Having something to look forward to helped.\n\nTherapist: That's an insightful observation. Social connection seems to be a protective factor for you. Let's explore how we can build more of that into your routine.",
          fa: "درمانگر: علی، این هفته خلقتون چطور بوده؟\n\nعلی: بالا و پایین بوده. چند روز خوب داشتم که واقعاً انگیزه داشتم برم پیاده‌روی، ولی آخر هفته رسید و بیشتر وقتم رو تو تخت موندم.\n\nدرمانگر: اون روزهای خوب مهم‌ان. چه فرقی داشتن؟\n\nعلی: فکر کنم چون با یه دوست قرار داشتم. داشتن چیزی برای منتظرش بودن کمک کرد.\n\nدرمانگر: این مشاهده بصیرت‌آمیزیه. ارتباط اجتماعی انگار یه عامل محافظتی برای شماست. بیایید ببینیم چطور می‌تونیم بیشتر از این رو تو برنامه روزانه‌تون بگنجونیم.",
        },
      },
    ],
    assignments: [],
    engagement: { firstSession: { en: "Nov 5, 2024", fa: "۱۵ آبان ۱۴۰۳" }, onboardingComplete: true, chatMessages: 3 },
  },
  {
    id: "p3",
    name:     { en: "Maryam Hosseini", fa: "مریم حسینی" },
    initials: "MH",
    status:   "active",
    since:    { en: "Jan 2025", fa: "دی ۱۴۰۳" },
    nextSession: {
      date:  { en: "Fri, Mar 7", fa: "جمعه ۱۶ اسفند" },
      time:  { en: "11:00 AM", fa: "۱۱:۰۰ صبح" },
      topic: { en: "Couples therapy — session 5", fa: "زوج‌درمانی — جلسه ۵" },
      hoursUntil: 120,
    },
    totalSessions: 4,
    pendingItems: 2,
    generalNotes: [],
    pastSessions: [
      { id: "s5", date: { en: "Feb 23, 11:00 AM", fa: "۴ اسفند، ۱۱:۰۰" }, topic: { en: "Couples therapy", fa: "زوج‌درمانی" }, hasTranscript: false, hasAiSummary: false, hasNote: false },
    ],
    assignments: [
      { id: "a3", type: "questionnaire", title: { en: "Weekly check-in", fa: "بررسی هفتگی" }, status: "pending", progress: 0, date: { en: "Feb 26", fa: "۷ اسفند" } },
      { id: "a4", type: "exercise",      title: { en: "Communication exercise", fa: "تمرین ارتباط" }, status: "active", progress: 66, date: { en: "Feb 20", fa: "۱ اسفند" } },
    ],
    engagement: { firstSession: { en: "Jan 10, 2025", fa: "۲۱ دی ۱۴۰۳" }, onboardingComplete: true, chatMessages: 0 },
  },
  {
    id: "p4",
    name:     { en: "Nima Tavakoli", fa: "نیما توکلی" },
    initials: "NT",
    status:   "active",
    since:    { en: "Dec 2024", fa: "آذر ۱۴۰۳" },
    nextSession: null, // no future booking — "last session" state
    lastSession: { date: { en: "Feb 20, 2025", fa: "۱ اسفند ۱۴۰۳" } },
    totalSessions: 6,
    pendingItems: 0,
    generalNotes: [
      { id: "n3", text: { en: "Patient may not return — mentioned financial constraints.", fa: "ممکن است بیمار برنگردد — محدودیت مالی ذکر کرد." }, date: { en: "Feb 20, 2025", fa: "۱ اسفند ۱۴۰۳" } },
    ],
    pastSessions: [
      {
        id: "s6", date: { en: "Feb 20, 9:00 AM", fa: "۱ اسفند، ۹:۰۰" }, topic: { en: "Stress management", fa: "مدیریت استرس" }, hasTranscript: true, hasAiSummary: true, hasNote: true,
        transcriptText: {
          en: "Therapist: Nima, you mentioned last time that you've been under a lot of financial pressure. How has that been this week?\n\nNima: Honestly, it's gotten worse. I'm not sure I can continue therapy because of the costs.\n\nTherapist: I understand. Let's talk about that openly. There may be options we can explore together.\n\nNima: I appreciate that. The gratitude practice has actually been helping me see the good things around me, even when things are tough.",
          fa: "درمانگر: نیما، دفعه قبل گفتید فشار مالی زیادی دارید. این هفته چطور بوده؟\n\nنیما: صادقانه بگم، بدتر شده. مطمئن نیستم بتونم درمان رو ادامه بدم به‌خاطر هزینه‌ها.\n\nدرمانگر: درک می‌کنم. بیایید صریح درباره‌اش صحبت کنیم. شاید گزینه‌هایی باشه که با هم بررسی کنیم.\n\nنیما: ممنونم. تمرین قدردانی واقعاً کمک کرده چیزهای خوب اطرافم رو ببینم، حتی وقتی اوضاع سخته.",
        },
        aiSummaryText: {
          en: "Session addressed financial barriers to continued therapy and stress management.\n\nKey concerns:\n• Patient expressing difficulty continuing therapy due to financial constraints\n• Financial stress compounding existing anxiety\n\nPositive indicators:\n• Gratitude practice showing beneficial effects on outlook\n• Patient maintains engagement despite difficulties\n\nAction items:\n• Explore sliding scale or reduced frequency options\n• Provide self-help resources for between sessions",
          fa: "جلسه به موانع مالی ادامه درمان و مدیریت استرس پرداخت.\n\nنگرانی‌های کلیدی:\n• بیمار از مشکل ادامه درمان به‌دلیل محدودیت مالی می‌گوید\n• استرس مالی اضطراب موجود را تشدید می‌کند\n\nنشانه‌های مثبت:\n• تمرین قدردانی اثرات مفیدی بر دیدگاه نشان می‌دهد\n• بیمار با وجود مشکلات درگیر باقی می‌ماند\n\nاقدامات:\n• بررسی گزینه‌های تعدیل هزینه یا کاهش فراوانی جلسات\n• ارائه منابع خودیاری برای بین جلسات",
        },
        noteText: {
          en: "Patient at risk of dropping out due to financial constraints. Consider reduced session frequency or sliding scale. Gratitude practice is an effective self-help tool to maintain.",
          fa: "بیمار در خطر ترک درمان به‌دلیل محدودیت مالی. کاهش فراوانی جلسات یا تعدیل هزینه در نظر گرفته شود. تمرین قدردانی ابزار خودیاری مؤثری برای ادامه است.",
        },
      },
    ],
    assignments: [
      { id: "a5", type: "mindfulness", title: { en: "Gratitude practice", fa: "تمرین قدردانی" }, status: "done", date: { en: "Feb 10", fa: "۲۱ بهمن" },
        result: {
          text: { en: "I'm grateful for my family's support during this difficult time. My sister called to check on me, which meant a lot. I also appreciate the small things — warm tea, sunshine through the window.", fa: "از حمایت خانواده‌ام در این دوران سخت سپاسگزارم. خواهرم زنگ زد حالم را بپرسد که خیلی برایم مهم بود. از چیزهای کوچک هم قدردانم — چای گرم، نور آفتاب از پنجره." },
          shared: true, submittedAt: { en: "Feb 10, 2025", fa: "۲۱ بهمن ۱۴۰۳" },
        },
      },
    ],
    engagement: { firstSession: { en: "Dec 1, 2024", fa: "۱۱ آذر ۱۴۰۳" }, onboardingComplete: true, chatMessages: 1 },
  },
  // ── Inactive patients ───────────────────────────────────────
  {
    id: "p5",
    name:     { en: "Roya Karimi", fa: "رویا کریمی" },
    initials: "RK",
    status:   "inactive",
    since:    { en: "Sep 2024", fa: "شهریور ۱۴۰۳" },
    nextSession: null,
    lastSession: { date: { en: "Jan 15, 2025", fa: "۲۶ دی ۱۴۰۳" } },
    totalSessions: 3,
    pendingItems: 0,
    generalNotes: [], pastSessions: [], assignments: [],
    engagement: { firstSession: { en: "Sep 20, 2024", fa: "۳۰ شهریور ۱۴۰۳" }, onboardingComplete: false, chatMessages: 0 },
  },
  {
    id: "p6",
    name:     { en: "Dariush Ahmadi", fa: "داریوش احمدی" },
    initials: "DA",
    status:   "inactive",
    since:    { en: "Jul 2024", fa: "تیر ۱۴۰۳" },
    nextSession: null,
    lastSession: { date: { en: "Nov 30, 2024", fa: "۱۰ آذر ۱۴۰۳" } },
    totalSessions: 10,
    pendingItems: 0,
    generalNotes: [], pastSessions: [], assignments: [],
    engagement: { firstSession: { en: "Jul 5, 2024", fa: "۱۵ تیر ۱۴۰۳" }, onboardingComplete: true, chatMessages: 0 },
  },
];

const loc = (obj, lang) => obj?.[lang] || obj?.en || "";

// ── Assignment type → icon mapping ───────────────────────────
const ASSIGN_ICON = { breathing: "wind", journal: "pen", questionnaire: "book", exercise: "activity", mindfulness: "heart", reading: "book" };

// ── Therapist's own private assignments (created by therapist) ─
const MY_ASSIGNMENTS = [
  { id: "my1", type: "breathing", title: { en: "4-7-8 Breathing technique", fa: "تکنیک تنفس ۴-۷-۸" } },
  { id: "my2", type: "journal",   title: { en: "Cognitive distortion log", fa: "ثبت تحریف‌های شناختی" } },
  { id: "my3", type: "exercise",  title: { en: "Progressive muscle relaxation", fa: "آرام‌سازی عضلانی پیشرونده" } },
];

// ── Recently-used assignments (previously assigned to patients) ─
const RECENTLY_USED = [
  { id: "ru1", type: "breathing",     title: { en: "Daily breathing exercise", fa: "تمرین تنفس روزانه" } },
  { id: "ru2", type: "journal",       title: { en: "Mood journal", fa: "دفترچه خلق" } },
  { id: "ru3", type: "questionnaire", title: { en: "Weekly check-in", fa: "بررسی هفتگی" } },
  { id: "ru4", type: "mindfulness",   title: { en: "Gratitude practice", fa: "تمرین قدردانی" } },
];

// ── Assignment library (shared platform resources, search-only) ─
const LIBRARY_ASSIGNMENTS = [
  { id: "lib1",  type: "questionnaire", title: { en: "PHQ-9 Depression scale", fa: "مقیاس افسردگی PHQ-9" } },
  { id: "lib2",  type: "questionnaire", title: { en: "GAD-7 Anxiety scale", fa: "مقیاس اضطراب GAD-7" } },
  { id: "lib3",  type: "breathing",     title: { en: "Box breathing", fa: "تنفس مربعی" } },
  { id: "lib4",  type: "mindfulness",   title: { en: "Body scan meditation", fa: "مدیتیشن اسکن بدن" } },
  { id: "lib5",  type: "journal",       title: { en: "Gratitude journal", fa: "دفترچه سپاسگزاری" } },
  { id: "lib6",  type: "reading",       title: { en: "Feeling Good — David Burns", fa: "حس خوب — دیوید برنز" } },
  { id: "lib7",  type: "exercise",      title: { en: "Exposure hierarchy worksheet", fa: "کاربرگ سلسله‌مراتب مواجهه" } },
  { id: "lib8",  type: "mindfulness",   title: { en: "Loving-kindness meditation", fa: "مدیتیشن مهربانی" } },
  { id: "lib9",  type: "questionnaire", title: { en: "PCL-5 PTSD checklist", fa: "چک‌لیست PTSD (PCL-5)" } },
  { id: "lib10", type: "journal",       title: { en: "Sleep diary", fa: "دفترچه خواب" } },
];

// ── AssignRow — single row inside the assignment bottom sheet ───
const AssignRow = ({ item, lang, assigned, onAssign, t }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
    borderBottom: "1px solid var(--ds-cream)",
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: RADIUS.sm,
      background: COLORS.primaryGhost, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Ic n={ASSIGN_ICON[item.type] || "book"} s={14} c={COLORS.primary} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text)" }}>{loc(item.title, lang)}</p>
      <p style={{ fontSize: 10, color: "var(--ds-text-light)", marginTop: 1, textTransform: "capitalize" }}>{item.type}</p>
    </div>
    {assigned ? (
      <Tag color="success" style={{ fontSize: 10 }}>{t("patients.assigned")}</Tag>
    ) : (
      <Button variant="primary" size="xs" onClick={onAssign}>{t("patients.assign")}</Button>
    )}
  </div>
);

// ── Assignment type label mapping ────────────────────────────
const TYPE_LABEL = { questionnaire: "typeQuestionnaire", journal: "typeJournal", reading: "typeReading", exercise: "typeExercise", breathing: "typeBreathing", mindfulness: "typeMindfulness" };

// ── AssignmentResultSheet — shows patient's submission ───────
const AssignmentResultSheet = ({ assignment: a, lang, t, onClose }) => {
  const isDone = a.status === "done";
  const r = a.result;
  const typeLabel = t(`assignments.${TYPE_LABEL[a.type] || "typeExercise"}`);

  return (
    <BottomSheet onClose={onClose}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: RADIUS.sm,
          background: isDone ? COLORS.successGhost : COLORS.primaryGhost,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Ic n={ASSIGN_ICON[a.type] || "book"} s={18} c={isDone ? COLORS.success : COLORS.primary} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--ds-text)" }}>{loc(a.title, lang)}</p>
          <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}>
            <Tag color={isDone ? "success" : a.status === "pending" ? "warn" : "primary"} style={{ fontSize: 9 }}>
              {isDone ? t("tag.done") : a.status === "pending" ? t("tag.pending") : t("tag.active")}
            </Tag>
            <span style={{ fontSize: 10, color: "var(--ds-text-light)", textTransform: "capitalize" }}>{typeLabel}</span>
          </div>
        </div>
      </div>

      {/* Done — show result */}
      {isDone && r ? (
        <>
          <p style={{ fontSize: 10, color: "var(--ds-text-light)", marginBottom: 12 }}>
            {t("patients.submittedOn")} {loc(r.submittedAt, lang)}
          </p>

          {/* Sharing badge (text-based types) */}
          {(a.type === "journal" || a.type === "reading" || a.type === "mindfulness") && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px",
              borderRadius: RADIUS.pill, marginBottom: 12,
              background: r.shared ? COLORS.successGhost : "var(--ds-cream)",
            }}>
              <Ic n={r.shared ? "share" : "lock"} s={10} c={r.shared ? COLORS.success : "var(--ds-text-light)"} />
              <span style={{ fontSize: 10, fontWeight: 600, color: r.shared ? COLORS.success : "var(--ds-text-light)" }}>
                {r.shared ? t("patients.sharedWithYou") : t("patients.keptPrivate")}
              </span>
            </div>
          )}

          {/* Text-based result (journal, reading, mindfulness) */}
          {(a.type === "journal" || a.type === "reading" || a.type === "mindfulness") && (
            r.shared && r.text ? (
              <div style={{
                padding: 14, borderRadius: RADIUS.sm, background: "var(--ds-cream)",
                borderInlineStart: `3px solid ${COLORS.primary}`, marginBottom: 12,
              }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--ds-text-mid)", marginBottom: 6 }}>
                  {t("patients.patientResponse")}
                </p>
                <p style={{ fontSize: 13, color: "var(--ds-text)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {loc(r.text, lang)}
                </p>
              </div>
            ) : (
              <div style={{ padding: "20px 14px", borderRadius: RADIUS.sm, background: "var(--ds-cream)", textAlign: "center", marginBottom: 12 }}>
                <Ic n="lock" s={20} c="var(--ds-text-light)" />
                <p style={{ fontSize: 12, color: "var(--ds-text-light)", marginTop: 6, fontStyle: "italic" }}>
                  {t("patients.keptPrivate")}
                </p>
              </div>
            )
          )}

          {/* Questionnaire result */}
          {a.type === "questionnaire" && r.responses && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
              {r.responses.map((resp, i) => (
                <div key={i} style={{ padding: 12, borderRadius: RADIUS.sm, border: "1px solid var(--ds-card-border)", background: "var(--ds-card-bg)" }}>
                  <p style={{ fontSize: 11, color: "var(--ds-text-mid)", marginBottom: 6 }}>{loc(resp.q, lang)}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Ic n="check" s={12} c={COLORS.success} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ds-text)" }}>{loc(resp.a, lang)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Activity result (exercise, breathing) */}
          {(a.type === "exercise" || a.type === "breathing") && (
            <div style={{ marginBottom: 12 }}>
              {a.type === "exercise" && r.sessions && (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: 12, borderRadius: RADIUS.sm, background: COLORS.successGhost, marginBottom: 10,
                }}>
                  <span style={{ fontSize: 12, color: "var(--ds-text-mid)" }}>{t("patients.sessionsCount")}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.success }}>{r.sessions}</span>
                </div>
              )}
              {r.shared && r.note ? (
                <div style={{
                  padding: 14, borderRadius: RADIUS.sm, background: "var(--ds-cream)",
                  borderInlineStart: `3px solid ${COLORS.primary}`,
                }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--ds-text-mid)", marginBottom: 6 }}>
                    {t("patients.patientResponse")}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--ds-text)", lineHeight: 1.7 }}>{loc(r.note, lang)}</p>
                </div>
              ) : !r.shared ? (
                <div style={{ padding: "20px 14px", borderRadius: RADIUS.sm, background: "var(--ds-cream)", textAlign: "center" }}>
                  <Ic n="lock" s={20} c="var(--ds-text-light)" />
                  <p style={{ fontSize: 12, color: "var(--ds-text-light)", marginTop: 6, fontStyle: "italic" }}>
                    {t("patients.keptPrivate")}
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </>
      ) : (
        /* Not done yet — show progress */
        <div style={{ padding: "20px 0", textAlign: "center" }}>
          {a.progress > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ height: 6, borderRadius: 3, background: "var(--ds-cream)", overflow: "hidden", marginBottom: 6 }}>
                <div style={{ height: "100%", borderRadius: 3, background: COLORS.primary, width: `${a.progress}%`, transition: "width .3s" }} />
              </div>
              <p style={{ fontSize: 10, color: "var(--ds-text-light)" }}>{a.progress}% {t("patients.inProgressLabel").toLowerCase()}</p>
            </div>
          )}
          <Ic n="clock" s={24} c="var(--ds-text-light)" />
          <p style={{ fontSize: 13, color: "var(--ds-text-mid)", marginTop: 8 }}>
            {a.status === "pending" ? t("patients.notSubmitted") : t("patients.inProgressLabel")}
          </p>
          {a.date && (
            <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginTop: 4 }}>
              {loc(a.date, lang)}
            </p>
          )}
        </div>
      )}

      <Button variant="ghost2" size="sm" onClick={onClose} style={{ width: "100%", marginTop: 8 }}>
        {t("action.close")}
      </Button>
    </BottomSheet>
  );
};

// ═══════════════════════════════════════════════════════════════
// ── Main component ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
export const Patients = ({ setTab }) => {
  const { t, lang, dir } = useLang();
  const isD = useIsDesktop();

  const [selected, setSelected]           = useState(null);     // patient id
  const [sortBy, setSortBy]               = useState("session"); // "session" | "alpha"
  const [searchQ, setSearchQ]             = useState("");
  const [noteText, setNoteText]           = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showReferSheet, setShowReferSheet] = useState(false);
  const [mockNotes, setMockNotes]         = useState({});       // local notes store {patientId: [note, ...]}
  const [showAssignSheet, setShowAssignSheet] = useState(false);
  const [assignSearch, setAssignSearch]       = useState("");
  const [assignedItems, setAssignedItems]     = useState(new Set()); // track assigned ids in current sheet
  const [sessionNoteId, setSessionNoteId]     = useState(null);      // session being noted
  const [sessionNoteText, setSessionNoteText] = useState("");
  const [mockSessionNotes, setMockSessionNotes] = useState({});     // {sessionId: noteText}
  const [viewAssignment, setViewAssignment]     = useState(null);     // assignment object to show result
  const [viewPanel, setViewPanel]               = useState(null);     // { type: "transcript"|"summary"|"note", session }

  const gap = isD ? 20 : 12;
  const pad = isD ? 28 : 14;

  // ── Derived lists ────────────────────────────────────────
  const active   = MOCK_PATIENTS.filter(p => p.status === "active");
  const inactive = MOCK_PATIENTS.filter(p => p.status === "inactive");

  const sorted = [...active].sort((a, b) => {
    if (sortBy === "alpha") return loc(a.name, lang).localeCompare(loc(b.name, lang));
    // By next session — no-next-session patients sink to bottom
    if (!a.nextSession && !b.nextSession) return 0;
    if (!a.nextSession) return 1;
    if (!b.nextSession) return -1;
    return (a.nextSession.hoursUntil || 999) - (b.nextSession.hoursUntil || 999);
  });

  const filtered = searchQ
    ? sorted.filter(p => loc(p.name, lang).toLowerCase().includes(searchQ.toLowerCase()))
    : sorted;

  const filteredInactive = searchQ
    ? inactive.filter(p => loc(p.name, lang).toLowerCase().includes(searchQ.toLowerCase()))
    : inactive;

  // ── Selected patient ─────────────────────────────────────
  const patient = selected ? MOCK_PATIENTS.find(p => p.id === selected) : null;

  // Get all notes for a patient (mock + local additions)
  const getNotesForPatient = (pid) => [
    ...(MOCK_PATIENTS.find(p => p.id === pid)?.generalNotes || []),
    ...(mockNotes[pid] || []),
  ];

  // ── Add note handler ─────────────────────────────────────
  const handleAddNote = () => {
    if (!noteText.trim() || !selected) return;
    const now = new Date();
    const newNote = {
      id: `local-${Date.now()}`,
      text: { en: noteText.trim(), fa: noteText.trim() },
      date: {
        en: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        fa: now.toLocaleDateString("fa-IR", { month: "long", day: "numeric", year: "numeric" }),
      },
    };
    setMockNotes(prev => ({ ...prev, [selected]: [...(prev[selected] || []), newNote] }));
    setNoteText("");
    setShowNoteInput(false);
  };

  // ── Assign handler ─────────────────────────────────────
  const handleAssign = (item) => {
    setAssignedItems(prev => new Set([...prev, item.id]));
  };

  // ── Session note handler ───────────────────────────────
  const handleSessionNote = (sessionId) => {
    if (!sessionNoteText.trim()) return;
    setMockSessionNotes(prev => ({ ...prev, [sessionId]: sessionNoteText.trim() }));
    setSessionNoteId(null);
    setSessionNoteText("");
  };

  // ── Library search results ─────────────────────────────
  const libraryResults = assignSearch.trim()
    ? LIBRARY_ASSIGNMENTS.filter(a =>
        loc(a.title, lang).toLowerCase().includes(assignSearch.toLowerCase()) ||
        a.type.toLowerCase().includes(assignSearch.toLowerCase())
      )
    : [];

  // ═══════════════════════════════════════════════════════════
  // ── DETAIL VIEW ─────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════
  if (patient) {
    const notes = getNotesForPatient(patient.id);

    return (
      <div style={{ direction: dir, padding: pad, maxWidth: isD ? 860 : 480, margin: "0 auto", paddingBottom: 100 }}>

        {/* Back button */}
        <button
          onClick={() => { setSelected(null); setShowNoteInput(false); setNoteText(""); }}
          style={{
            display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
            cursor: "pointer", padding: "4px 0", marginBottom: gap, fontFamily: "inherit",
          }}
        >
          <Ic n="chev" s={16} c={COLORS.primary} style={{ transform: dir === "rtl" ? undefined : "scaleX(-1)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.primary }}>{t("patients.title")}</span>
        </button>

        {/* ── 1. Header card ─────────────────────────────── */}
        <Card style={{ display: "flex", alignItems: "center", gap: isD ? 16 : 12, marginBottom: gap }}>
          <Avatar initials={patient.initials} size={isD ? 56 : 48} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h2 className="ds-heading" style={{ fontSize: isD ? 20 : 17, color: "var(--ds-text)", margin: 0 }}>
                {loc(patient.name, lang)}
              </h2>
              {patient.nextSession ? (
                <Tag color="success">{t("patients.active")}</Tag>
              ) : (
                <Tag color="warn">{t("patients.lastSession")}</Tag>
              )}
            </div>
            <p style={{ fontSize: 12, color: "var(--ds-text-light)", marginTop: 3 }}>
              {t("patients.since")} {loc(patient.since, lang)} · {patient.totalSessions} {t("patients.sessions")}
            </p>
          </div>
        </Card>

        {/* ── 2. Quick actions ───────────────────────────── */}
        <div style={{ display: "flex", gap: 8, marginBottom: gap, flexWrap: "wrap" }}>
          <Button variant="ghost" size="sm" style={{ flex: 1, minWidth: isD ? 0 : "45%" }}
            onClick={() => { setShowAssignSheet(true); setAssignSearch(""); setAssignedItems(new Set()); }}
          >
            <Ic n="plus" s={13} c={COLORS.primary} /> {t("patients.addAssignment")}
          </Button>
          <Button variant="ghost" size="sm" style={{ flex: 1, minWidth: isD ? 0 : "45%" }}
            onClick={() => { setShowNoteInput(true); }}
          >
            <Ic n="pen" s={13} c={COLORS.primary} /> {t("patients.addNote")}
          </Button>
          <Button variant="ghost2" size="sm" style={{ flex: 1, minWidth: isD ? 0 : "45%" }}
            onClick={() => setShowReferSheet(true)}
          >
            <Ic n="share" s={13} c="var(--ds-text-mid)" /> {t("patients.referColleague")}
          </Button>
        </div>

        {/* ── 3. Next session ────────────────────────────── */}
        {patient.nextSession && (
          <div style={{ marginBottom: gap }}>
            <SessionCard
              patientName={loc(patient.name, lang)}
              initials={patient.initials}
              topic={loc(patient.nextSession.topic, lang)}
              date={loc(patient.nextSession.date, lang)}
              time={loc(patient.nextSession.time, lang)}
              hoursUntil={patient.nextSession.hoursUntil}
              onJoin={() => {}}
              onCancel={() => {}}
            />
          </div>
        )}

        {!patient.nextSession && patient.lastSession && (
          <Card variant="ghost" style={{ marginBottom: gap, padding: isD ? 18 : 14, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: RADIUS.sm, background: COLORS.warnGhost, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ic n="clock" s={16} c={COLORS.warn} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ds-text)" }}>{t("patients.noUpcoming")}</p>
              <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginTop: 2 }}>
                {t("patients.lastSession")}: {loc(patient.lastSession.date, lang)}
              </p>
            </div>
          </Card>
        )}

        {/* ── 4. Notes & reminders ───────────────────────── */}
        <Card style={{ marginBottom: gap }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)" }}>{t("patients.notesTitle")}</p>
            {!showNoteInput && (
              <Button variant="ghost" size="xs" onClick={() => setShowNoteInput(true)}>
                <Ic n="plus" s={11} c={COLORS.primary} /> {t("patients.addNote")}
              </Button>
            )}
          </div>

          {/* Inline add-note form */}
          {showNoteInput && (
            <div style={{ marginBottom: 12, padding: 12, borderRadius: RADIUS.sm, background: "var(--ds-cream)" }}>
              <Textarea
                value={noteText}
                onChange={val => setNoteText(val)}
                rows={3}
                placeholder={t("patients.notePlaceholder")}
                style={{ marginBottom: 8 }}
              />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Button variant="ghost2" size="xs" onClick={() => { setShowNoteInput(false); setNoteText(""); }}>
                  {t("action.cancel")}
                </Button>
                <Button variant="primary" size="xs" onClick={handleAddNote} disabled={!noteText.trim()}>
                  {t("patients.saveNote")}
                </Button>
              </div>
            </div>
          )}

          {notes.length === 0 && !showNoteInput && (
            <p style={{ fontSize: 12, color: "var(--ds-text-light)", fontStyle: "italic", padding: "8px 0" }}>
              {t("patients.noNotes")}
            </p>
          )}

          {notes.map((note) => (
            <div key={note.id} style={{ padding: "10px 0", borderTop: "1px solid var(--ds-cream)" }}>
              <p style={{ fontSize: 12, color: "var(--ds-text)", lineHeight: 1.5 }}>{loc(note.text, lang)}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <Ic n="lock" s={10} c="var(--ds-text-light)" />
                <span style={{ fontSize: 10, color: "var(--ds-text-light)", fontStyle: "italic" }}>{t("patients.notePrivate")}</span>
                <span style={{ fontSize: 10, color: "var(--ds-text-light)", marginLeft: "auto" }}>{loc(note.date, lang)}</span>
              </div>
            </div>
          ))}
        </Card>

        {/* ── 5. Past sessions ───────────────────────────── */}
        {patient.pastSessions.length > 0 && (
          <Card style={{ marginBottom: gap }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)" }}>{t("patients.pastSessions")}</p>
              <Tag color="primary">{patient.pastSessions.length}</Tag>
            </div>
            {patient.pastSessions.map((s) => (
              <div key={s.id} style={{ padding: "12px 0", borderTop: "1px solid var(--ds-cream)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text)" }}>{loc(s.topic, lang)}</p>
                    <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginTop: 2 }}>{loc(s.date, lang)}</p>
                  </div>
                  {!s.hasNote && !mockSessionNotes[s.id] && sessionNoteId !== s.id && (
                    <Button variant="primary" size="xs"
                      onClick={() => { setSessionNoteId(s.id); setSessionNoteText(""); }}
                    >{t("dashboard.addNote")}</Button>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  {s.hasTranscript && (
                    <button onClick={() => setViewPanel({ type: "transcript", session: s })} style={{
                      display: "flex", alignItems: "center", gap: 4, padding: "4px 8px",
                      borderRadius: RADIUS.sm, border: `1px solid ${COLORS.primaryGhost}`,
                      background: COLORS.primaryGhost, cursor: "pointer", fontFamily: "inherit",
                    }}>
                      <Ic n="file" s={11} c={COLORS.primary} />
                      <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.primary }}>{t("dashboard.transcript")}</span>
                    </button>
                  )}
                  {s.hasAiSummary && (
                    <button onClick={() => setViewPanel({ type: "summary", session: s })} style={{
                      display: "flex", alignItems: "center", gap: 4, padding: "4px 8px",
                      borderRadius: RADIUS.sm, border: `1px solid ${COLORS.successGhost}`,
                      background: COLORS.successGhost, cursor: "pointer", fontFamily: "inherit",
                    }}>
                      <Ic n="bot" s={11} c={COLORS.success} />
                      <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.success }}>{t("dashboard.aiSummary")}</span>
                    </button>
                  )}
                  {(s.hasNote || mockSessionNotes[s.id]) && (
                    <button onClick={() => setViewPanel({ type: "note", session: s, localNote: mockSessionNotes[s.id] })} style={{
                      display: "flex", alignItems: "center", gap: 4, padding: "4px 8px",
                      borderRadius: RADIUS.sm, border: `1px solid ${COLORS.primaryGhost}`,
                      background: COLORS.primaryGhost, cursor: "pointer", fontFamily: "inherit",
                    }}>
                      <Ic n="pen" s={11} c={COLORS.primary} />
                      <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.primary }}>{t("dashboard.therapistNote")}</span>
                    </button>
                  )}
                </div>
                {/* Inline session note form */}
                {sessionNoteId === s.id && (
                  <div style={{ marginTop: 10, padding: 12, borderRadius: RADIUS.sm, background: "var(--ds-cream)" }}>
                    <Textarea
                      value={sessionNoteText}
                      onChange={val => setSessionNoteText(val)}
                      rows={2}
                      placeholder={t("patients.notePlaceholder")}
                      style={{ marginBottom: 8 }}
                    />
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <Button variant="ghost2" size="xs" onClick={() => { setSessionNoteId(null); setSessionNoteText(""); }}>
                        {t("action.cancel")}
                      </Button>
                      <Button variant="primary" size="xs" onClick={() => handleSessionNote(s.id)} disabled={!sessionNoteText.trim()}>
                        {t("patients.saveNote")}
                      </Button>
                    </div>
                  </div>
                )}
                {/* Show saved session note */}
                {mockSessionNotes[s.id] && sessionNoteId !== s.id && (
                  <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: RADIUS.sm, background: "var(--ds-cream)", fontSize: 11, color: "var(--ds-text-mid)", lineHeight: 1.5 }}>
                    <Ic n="lock" s={9} c="var(--ds-text-light)" style={{ verticalAlign: "middle", marginInlineEnd: 4 }} />
                    {mockSessionNotes[s.id]}
                  </div>
                )}
              </div>
            ))}
          </Card>
        )}

        {/* ── 6. Assignments ─────────────────────────────── */}
        {patient.assignments.length > 0 && (
          <Card style={{ marginBottom: gap }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)" }}>{t("assignments.title")}</p>
              <Tag color="accent">{patient.assignments.length}</Tag>
            </div>
            {patient.assignments.map((a) => (
              <div key={a.id} role="button" tabIndex={0}
                onClick={() => setViewAssignment(a)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "1px solid var(--ds-cream)", cursor: "pointer" }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: RADIUS.sm,
                  background: a.status === "done" ? COLORS.successGhost : COLORS.primaryGhost,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Ic n={ASSIGN_ICON[a.type] || "book"} s={15} c={a.status === "done" ? COLORS.success : COLORS.primary} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text)" }}>{loc(a.title, lang)}</p>
                  <p style={{ fontSize: 10, color: "var(--ds-text-light)", marginTop: 2 }}>{loc(a.date, lang)}</p>
                </div>
                <Tag color={a.status === "done" ? "success" : a.status === "pending" ? "warn" : "primary"}>
                  {a.status === "done" ? t("tag.done") : a.status === "pending" ? t("tag.pending") : t("tag.active")}
                </Tag>
                <Ic n="chev" s={12} c="var(--ds-text-light)" style={{ flexShrink: 0 }} />
              </div>
            ))}
          </Card>
        )}

        {/* ── 7. Engagement summary ──────────────────────── */}
        <Card variant="tinted" style={{ marginBottom: gap + 40 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)", marginBottom: 12 }}>{t("patients.engagementTitle")}</p>
          {(() => {
            const ac = patient.assignments.filter(a => a.status === "active" || a.status === "pending").length;
            const dn = patient.assignments.filter(a => a.status === "done").length;
            return [
              [t("patients.firstSessionDate"), loc(patient.engagement.firstSession, lang)],
              [t("patients.totalSessions"),    String(patient.totalSessions)],
              [t("assignments.title"),         ac + dn > 0 ? `${ac} ${t("tag.active")}, ${dn} ${t("tag.done")}` : "—"],
              [t("patients.onboardingDone").split(" ")[0], patient.engagement.onboardingComplete ? "✓ " + t("patients.onboardingDone") : t("patients.onboardingPending")],
              [t("patients.chatMessages"),     String(patient.engagement.chatMessages)],
            ];
          })().map(([label, value], i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", padding: "8px 0",
              borderTop: i > 0 ? "1px solid var(--ds-cream)" : undefined,
            }}>
              <span style={{ fontSize: 12, color: "var(--ds-text-mid)" }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text)" }}>{value}</span>
            </div>
          ))}
        </Card>

        {/* ── Refer bottom sheet ─────────────────────────── */}
        {showReferSheet && (
          <BottomSheet onClose={() => setShowReferSheet(false)}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--ds-text)", marginBottom: 12 }}>
              {t("patients.referColleague")}
            </p>
            <p style={{ fontSize: 12, color: "var(--ds-text-light)", marginBottom: 12 }}>
              {/* TODO(backend-integration): referral form with colleague search */}
              Referral feature coming soon.
            </p>
            <Button variant="ghost2" size="sm" onClick={() => setShowReferSheet(false)} style={{ width: "100%" }}>
              {t("action.close")}
            </Button>
          </BottomSheet>
        )}

        {/* ── Assignment bottom sheet ────────────────────── */}
        {showAssignSheet && (
          <BottomSheet onClose={() => setShowAssignSheet(false)}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--ds-text)", marginBottom: 16 }}>
              {t("patients.assignTitle")}
            </p>

            {/* Recently used */}
            {RECENTLY_USED.length > 0 && (
              <>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ds-text-mid)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                  {t("patients.recentlyUsed")}
                </p>
                {RECENTLY_USED.map(item => (
                  <AssignRow key={item.id} item={item} lang={lang} assigned={assignedItems.has(item.id)} onAssign={() => handleAssign(item)} t={t} />
                ))}
              </>
            )}

            {/* My assignments */}
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ds-text-mid)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, marginTop: 16 }}>
              {t("patients.myAssignments")}
            </p>
            {MY_ASSIGNMENTS.length > 0 ? (
              MY_ASSIGNMENTS.map(item => (
                <AssignRow key={item.id} item={item} lang={lang} assigned={assignedItems.has(item.id)} onAssign={() => handleAssign(item)} t={t} />
              ))
            ) : (
              <p style={{ fontSize: 12, color: "var(--ds-text-light)", fontStyle: "italic", padding: "8px 0" }}>
                {t("patients.noMyAssignments")}
              </p>
            )}

            {/* Library search */}
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ds-text-mid)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, marginTop: 16 }}>
              {t("patients.assignLibrary")}
            </p>
            <div style={{ position: "relative", marginBottom: 10 }}>
              <Ic n="search" s={14} c="var(--ds-text-light)" style={{ position: "absolute", top: 10, ...(dir === "rtl" ? { right: 12 } : { left: 12 }), pointerEvents: "none" }} />
              <input
                type="text"
                value={assignSearch}
                onChange={e => setAssignSearch(e.target.value)}
                placeholder={t("patients.searchLibrary")}
                style={{
                  width: "100%", padding: "9px 12px", ...(dir === "rtl" ? { paddingRight: 34 } : { paddingLeft: 34 }),
                  borderRadius: RADIUS.sm, border: "1.5px solid var(--ds-card-border)", background: "var(--ds-card-bg)",
                  fontSize: 12, color: "var(--ds-text)", fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            {libraryResults.length > 0 ? (
              libraryResults.map(item => (
                <AssignRow key={item.id} item={item} lang={lang} assigned={assignedItems.has(item.id)} onAssign={() => handleAssign(item)} t={t} />
              ))
            ) : assignSearch.trim() ? (
              <p style={{ fontSize: 12, color: "var(--ds-text-light)", fontStyle: "italic", padding: "4px 0" }}>
                No results
              </p>
            ) : null}

            <Button variant="ghost2" size="sm" onClick={() => setShowAssignSheet(false)} style={{ width: "100%", marginTop: 16 }}>
              {t("action.close")}
            </Button>
          </BottomSheet>
        )}

        {/* ── Assignment result sheet ────────────────────── */}
        {viewAssignment && (
          <AssignmentResultSheet
            assignment={viewAssignment}
            lang={lang}
            t={t}
            onClose={() => setViewAssignment(null)}
          />
        )}

        {/* ── Read-only panel BottomSheet (transcript / AI summary / note) ── */}
        {viewPanel && (() => {
          const s = viewPanel.session;
          const isTranscript = viewPanel.type === "transcript";
          const isSummary    = viewPanel.type === "summary";
          const isNote       = viewPanel.type === "note";
          const title = isTranscript ? t("session.transcript") : isSummary ? t("session.aiSummary") : t("session.therapistNotes");
          const icon  = isTranscript ? "file" : isSummary ? "bot" : "pen";
          const color = isSummary ? COLORS.success : COLORS.primary;
          const ghost = isSummary ? COLORS.successGhost : COLORS.primaryGhost;
          const text  = isTranscript ? loc(s.transcriptText, lang)
                      : isSummary   ? loc(s.aiSummaryText, lang)
                      : viewPanel.localNote || loc(s.noteText, lang);
          return (
            <BottomSheet onClose={() => setViewPanel(null)}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: RADIUS.sm, background: ghost,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Ic n={icon} s={16} c={color} />
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "var(--ds-text)" }}>{title}</p>
                    <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginTop: 2 }}>
                      {loc(s.topic, lang)} · {loc(s.date, lang)}
                    </p>
                  </div>
                </div>
                <button onClick={() => setViewPanel(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  <Ic n="x" s={18} c="var(--ds-text-mid)" />
                </button>
              </div>

              {/* Content */}
              <div style={{
                padding: 16, borderRadius: RADIUS.md, background: "var(--ds-cream)",
                borderInlineStart: `3px solid ${color}`, marginBottom: 16,
                maxHeight: "55vh", overflowY: "auto",
              }}>
                <p style={{
                  fontFamily: FONTS.note.family, fontSize: 14, lineHeight: 1.9,
                  color: "var(--ds-text)", whiteSpace: "pre-wrap",
                }}>
                  {text}
                </p>
              </div>

              {/* Close */}
              <Button variant="ghost2" size="sm" onClick={() => setViewPanel(null)} style={{ width: "100%" }}>
                {t("action.close")}
              </Button>
            </BottomSheet>
          );
        })()}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // ── LIST VIEW ───────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════
  return (
    <div style={{ direction: dir, padding: pad, maxWidth: isD ? 860 : 480, margin: "0 auto", paddingBottom: 100 }}>

      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ marginBottom: gap }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div>
            <h1 className="ds-heading" style={{ fontSize: isD ? 26 : 22, color: "var(--ds-text)", lineHeight: 1.2 }}>
              {t("patients.title")}
            </h1>
            <p style={{ fontSize: 13, color: "var(--ds-text-mid)", marginTop: 4 }}>
              {t("patients.subtitle")}
            </p>
          </div>

          {/* Sort toggle pill */}
          <div style={{
            display: "flex", borderRadius: RADIUS.pill, border: "1.5px solid var(--ds-card-border)",
            overflow: "hidden", flexShrink: 0, marginTop: 4,
          }}>
            {["session", "alpha"].map((s) => (
              <button key={s} onClick={() => setSortBy(s)} style={{
                padding: "6px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none",
                fontFamily: "inherit",
                background: sortBy === s ? COLORS.primary : "var(--ds-card-bg)",
                color: sortBy === s ? "white" : "var(--ds-text-mid)",
                transition: "all .2s",
              }}>
                {s === "session" ? t("patients.sortBySession") : t("patients.sortByName")}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginTop: gap }}>
          <Ic n="search" s={14} c="var(--ds-text-light)" style={{ position: "absolute", top: 11, ...(dir === "rtl" ? { right: 12 } : { left: 12 }), pointerEvents: "none" }} />
          <input
            type="text"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder={t("patients.searchPlaceholder")}
            style={{
              width: "100%", padding: "10px 12px", ...(dir === "rtl" ? { paddingRight: 36 } : { paddingLeft: 36 }),
              borderRadius: RADIUS.sm, border: "1.5px solid var(--ds-card-border)", background: "var(--ds-card-bg)",
              fontSize: 13, color: "var(--ds-text)", fontFamily: "inherit", outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* ── Active patients ─────────────────────────────── */}
      {filtered.length > 0 && (
        <Card style={{ marginBottom: gap }}>
          {filtered.map((p, i) => (
            <div
              key={p.id}
              onClick={() => setSelected(p.id)}
              role="button"
              tabIndex={0}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 0",
                borderTop: i > 0 ? "1px solid var(--ds-cream)" : undefined,
                cursor: "pointer",
              }}
            >
              <Avatar initials={p.initials} size={isD ? 42 : 38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ds-text)" }}>{loc(p.name, lang)}</p>
                  {p.nextSession ? (
                    <Tag color="success" style={{ fontSize: 9 }}>{t("patients.active")}</Tag>
                  ) : (
                    <Tag color="warn" style={{ fontSize: 9 }}>{t("patients.lastSession")}</Tag>
                  )}
                  {p.pendingItems > 0 && (
                    <span style={{
                      width: 18, height: 18, borderRadius: "50%", background: COLORS.accent,
                      color: "white", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{p.pendingItems}</span>
                  )}
                </div>
                <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginTop: 3 }}>
                  {p.nextSession ? (
                    <>{t("patients.nextSession")}: {loc(p.nextSession.date, lang)}, {loc(p.nextSession.time, lang)}</>
                  ) : p.lastSession ? (
                    <>{t("patients.lastSession")}: {loc(p.lastSession.date, lang)}</>
                  ) : null}
                </p>
              </div>
              <Ic n="chev" s={14} c={COLORS.textLight} style={{ transform: dir === "rtl" ? undefined : "rotate(180deg)", flexShrink: 0 }} />
            </div>
          ))}
        </Card>
      )}

      {/* ── Inactive patients ───────────────────────────── */}
      {filteredInactive.length > 0 && (
        <>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ds-text-light)", marginBottom: 8, marginTop: gap }}>
            {t("patients.inactiveSection")}
          </p>
          <Card style={{ marginBottom: gap + 40 }}>
            {filteredInactive.map((p, i) => (
              <div
                key={p.id}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
                  borderTop: i > 0 ? "1px solid var(--ds-cream)" : undefined,
                  opacity: 0.55,
                }}
              >
                <Avatar initials={p.initials} size={isD ? 38 : 34} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ds-text)" }}>{loc(p.name, lang)}</p>
                  {p.lastSession && (
                    <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginTop: 2 }}>
                      {t("patients.lastSession")}: {loc(p.lastSession.date, lang)}
                    </p>
                  )}
                </div>
                <Tag color="neutral" style={{ fontSize: 9 }}>{t("patients.paused")}</Tag>
              </div>
            ))}
          </Card>
        </>
      )}

      {/* Empty state */}
      {filtered.length === 0 && filteredInactive.length === 0 && (
        <Card style={{ textAlign: "center", padding: "36px 20px" }}>
          <Ic n="users" s={32} c={COLORS.textLight} />
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ds-text-mid)", marginTop: 10 }}>
            {searchQ ? "No patients found" : "No patients yet"}
          </p>
        </Card>
      )}
    </div>
  );
};
