export type DefaultStoreCatalogEntry = {
  itemId: string;
  name: string;
  description: string;
  category: string;
  priceCoins: number;
  durationDays?: number;
  sortOrder: number;
};

/**
 * Initial editable price suggestions, expressed only in platform coins.
 * Entries remain unpublished and non-purchasable until the owner enables them.
 * Implemented profile consumers are marked fulfillment-ready by the server;
 * privacy add-ons remain fail-closed until their semantics are implemented.
 */
export const DEFAULT_STORE_CATALOG: DefaultStoreCatalogEntry[] = [
  { itemId: "vip_monthly", name: "عضوية VIP", description: "شارة وامتيازات العضوية المميزة", category: "vip", priceCoins: 5000, durationDays: 30, sortOrder: 10 },
  { itemId: "title_custom", name: "لقب مميز", description: "لقب مميز يظهر في الملف الشخصي", category: "title", priceCoins: 800, sortOrder: 20 },
  { itemId: "badge_special", name: "وسام خاص", description: "وسام إضافي في الملف الشخصي", category: "badge", priceCoins: 1200, sortOrder: 30 },
  { itemId: "avatar_frame_30d", name: "إطار صورة متحرك", description: "إطار متحرك للصورة الشخصية لمدة 30 يوماً", category: "frame", priceCoins: 2500, durationDays: 30, sortOrder: 40 },
  { itemId: "username_color_30d", name: "اسم ملون", description: "لون مميز للاسم لمدة 30 يوماً", category: "username_style", priceCoins: 1200, durationDays: 30, sortOrder: 50 },
  { itemId: "username_animated_30d", name: "اسم متحرك", description: "تأثير متحرك للاسم لمدة 30 يوماً", category: "username_style", priceCoins: 3000, durationDays: 30, sortOrder: 60 },
  { itemId: "profile_analytics_30d", name: "تحليلات الملف", description: "إحصاءات موسعة للملف لمدة 30 يوماً", category: "analytics", priceCoins: 1800, durationDays: 30, sortOrder: 70 },
  { itemId: "profile_layout_30d", name: "تصميم ملف احترافي", description: "قالب ملف احترافي لمدة 30 يوماً", category: "profile_layout", priceCoins: 3500, durationDays: 30, sortOrder: 80 },
  { itemId: "profile_pin_30d", name: "قسم مثبت", description: "تثبيت قسم مميز في الملف لمدة 30 يوماً", category: "profile_layout", priceCoins: 900, durationDays: 30, sortOrder: 90 },
  { itemId: "discovery_boost_7d", name: "تعزيز الظهور", description: "تعزيز الظهور لمدة 7 أيام", category: "boost", priceCoins: 1500, durationDays: 7, sortOrder: 100 },
  { itemId: "profile_theme_30d", name: "ثيم وخلفية", description: "ثيم مميز للملف لمدة 30 يوماً", category: "theme", priceCoins: 2000, durationDays: 30, sortOrder: 110 },
  { itemId: "visitor_greeting_30d", name: "رسالة ترحيب للزوار", description: "رسالة ترحيب تظهر للزوار لمدة 30 يوماً", category: "greeting", priceCoins: 1000, durationDays: 30, sortOrder: 120 },
  { itemId: "voice_call_24h", name: "المكالمات الصوتية — 24 ساعة", description: "استحقاق المكالمات الصوتية لمدة 24 ساعة؛ يتطلب اشتراك الطرفين", category: "voice_call", priceCoins: 100, durationDays: 1, sortOrder: 150 },
  { itemId: "voice_call_7d", name: "المكالمات الصوتية — أسبوع", description: "استحقاق المكالمات الصوتية لمدة 7 أيام؛ يتطلب اشتراك الطرفين", category: "voice_call", priceCoins: 500, durationDays: 7, sortOrder: 151 },
  { itemId: "voice_call_30d", name: "المكالمات الصوتية — شهر", description: "استحقاق المكالمات الصوتية لمدة 30 يوماً؛ يتطلب اشتراك الطرفين", category: "voice_call", priceCoins: 1500, durationDays: 30, sortOrder: 152 },
  { itemId: "video_call_24h", name: "المكالمات المرئية — 24 ساعة", description: "استحقاق المكالمات المرئية لمدة 24 ساعة؛ يتطلب اشتراك الطرفين", category: "video_call", priceCoins: 250, durationDays: 1, sortOrder: 160 },
  { itemId: "video_call_7d", name: "المكالمات المرئية — أسبوع", description: "استحقاق المكالمات المرئية لمدة 7 أيام؛ يتطلب اشتراك الطرفين", category: "video_call", priceCoins: 1250, durationDays: 7, sortOrder: 161 },
  { itemId: "video_call_30d", name: "المكالمات المرئية — شهر", description: "استحقاق المكالمات المرئية لمدة 30 يوماً؛ يتطلب اشتراك الطرفين", category: "video_call", priceCoins: 3750, durationDays: 30, sortOrder: 162 },
  { itemId: "hide_coins_30d", name: "إخفاء رصيد الكوينز", description: "إخفاء رصيد الكوينز في الملف لمدة 30 يوماً", category: "privacy", priceCoins: 1000, durationDays: 30, sortOrder: 130 },
  { itemId: "ghost_mode_7d", name: "وضع التخفي", description: "إعداد خصوصية التخفي لمدة 7 أيام", category: "privacy", priceCoins: 1800, durationDays: 7, sortOrder: 140 },
];
