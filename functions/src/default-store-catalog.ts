export type DefaultStoreCatalogEntry = {
  itemId: string;
  name: string;
  description: string;
  category: string;
  priceCoins: number | null;
  durationDays?: number;
  sortOrder: number;
};

/**
 * Initial product metadata only; prices and durations are deliberately unset.
 * Entries remain unpublished and non-purchasable until the owner enables them.
 * Implemented profile consumers are marked fulfillment-ready by the server;
 * privacy add-ons remain fail-closed until their semantics are implemented.
 */
export const DEFAULT_STORE_CATALOG: DefaultStoreCatalogEntry[] = [
  { itemId: "vip_monthly", name: "عضوية VIP", description: "شارة وامتيازات العضوية المميزة", category: "vip", priceCoins: null, sortOrder: 10 },
  { itemId: "title_custom", name: "لقب مميز", description: "لقب مميز يظهر في الملف الشخصي", category: "title", priceCoins: null, sortOrder: 20 },
  { itemId: "badge_special", name: "وسام خاص", description: "وسام إضافي في الملف الشخصي", category: "badge", priceCoins: null, sortOrder: 30 },
  { itemId: "avatar_frame_30d", name: "إطار صورة متحرك", description: "إطار متحرك للصورة الشخصية", category: "frame", priceCoins: null, sortOrder: 40 },
  { itemId: "username_color_30d", name: "اسم ملون", description: "لون مميز للاسم", category: "username_style", priceCoins: null, sortOrder: 50 },
  { itemId: "username_animated_30d", name: "اسم متحرك", description: "تأثير متحرك للاسم", category: "username_style", priceCoins: null, sortOrder: 60 },
  { itemId: "profile_analytics_30d", name: "تحليلات الملف", description: "إحصاءات موسعة للملف", category: "analytics", priceCoins: null, sortOrder: 70 },
  { itemId: "profile_layout_30d", name: "تصميم ملف احترافي", description: "قالب ملف احترافي", category: "profile_layout", priceCoins: null, sortOrder: 80 },
  { itemId: "profile_pin_30d", name: "قسم مثبت", description: "تثبيت قسم مميز في الملف", category: "profile_layout", priceCoins: null, sortOrder: 90 },
  { itemId: "discovery_boost_7d", name: "تعزيز الظهور", description: "تعزيز الظهور", category: "boost", priceCoins: null, sortOrder: 100 },
  { itemId: "profile_theme_30d", name: "ثيم وخلفية", description: "ثيم مميز للملف", category: "theme", priceCoins: null, sortOrder: 110 },
  { itemId: "visitor_greeting_30d", name: "رسالة ترحيب للزوار", description: "رسالة ترحيب تظهر للزوار", category: "greeting", priceCoins: null, sortOrder: 120 },
  { itemId: "hide_coins_30d", name: "إخفاء رصيد الكوينز", description: "إخفاء رصيد الكوينز في الملف", category: "privacy", priceCoins: null, sortOrder: 130 },
  { itemId: "ghost_mode_7d", name: "وضع التخفي", description: "إعداد خصوصية التخفي", category: "privacy", priceCoins: null, sortOrder: 140 },
];
