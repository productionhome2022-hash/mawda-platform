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
 * All entries deliberately start unpublished and non-purchasable until their
 * complete user-facing consumer and acceptance tests are enabled.
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
  { itemId: "hide_coins_30d", name: "إخفاء رصيد الكوينز", description: "إخفاء رصيد الكوينز في الملف لمدة 30 يوماً", category: "privacy", priceCoins: 1000, durationDays: 30, sortOrder: 130 },
  { itemId: "ghost_mode_7d", name: "وضع التخفي", description: "إعداد خصوصية التخفي لمدة 7 أيام", category: "privacy", priceCoins: 1800, durationDays: 7, sortOrder: 140 },
];
