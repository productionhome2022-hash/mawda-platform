#!/usr/bin/env node
"use strict";

// Deterministic, synthetic persona dataset for Firebase Emulator load tests only.
const fs = require("node:fs");
const path = require("node:path");

const countArg = process.argv.find((arg) => arg.startsWith("--count="));
const outputArg = process.argv.find((arg) => arg.startsWith("--output="));
const count = countArg ? Number(countArg.split("=")[1]) : 500;
const output = outputArg ? outputArg.slice("--output=".length) : ".mawdda-load/personas.json";
if (!Number.isSafeInteger(count) || count < 2 || count > 500) {
  throw new Error("--count must be an integer from 2 through 500.");
}
const professions = ["مصمم منتجات", "مهندس برمجيات", "محلل أعمال", "معلم", "طبيب تجريبي", "باحث", "مصمم جرافيك", "محاسب"];
const interests = [["التقنية", "القراءة"], ["السفر", "التصوير"], ["الرياضة", "الموسيقى"], ["التصميم", "الأعمال"], ["العلوم", "التعلم"]];
const regions = ["Zurich", "Geneva", "Basel", "Bern", "Lausanne", "Lugano"];
const personas = Array.from({ length: count }, (_, index) => {
  const n = index + 1;
  const id = `load-${String(n).padStart(4, "0")}`;
  return {
    personaId: id,
    email: `${id}@test.mawdda.invalid`,
    displayName: `شخصية مودة التجريبية ${String(n).padStart(4, "0")}`,
    username: `mawdda_load_${String(n).padStart(4, "0")}`,
    age: 21 + (n % 35),
    gender: n % 2 ? "female" : "male",
    country: "Switzerland",
    region: regions[n % regions.length],
    profession: professions[n % professions.length],
    biography: `ملف اصطناعي ${n} لاختبار التحميل والتفاعل في بيئة المحاكاة فقط.`,
    interests: interests[n % interests.length],
    profileVisibility: "public",
    accountStatus: "active",
    isTestAccount: true,
    testOnly: true
  };
});
const resolved = path.resolve(process.cwd(), output);
fs.mkdirSync(path.dirname(resolved), { recursive: true });
fs.writeFileSync(resolved, JSON.stringify({
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  environment: "firebase-emulator-only",
  count,
  personas
}, null, 2) + "\n", { mode: 0o600 });
try { fs.chmodSync(resolved, 0o600); } catch {}
console.log(`Generated ${count} synthetic Mawdda personas at ${resolved}`);
