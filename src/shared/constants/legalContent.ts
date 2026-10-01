import type { SupportedLanguageCode } from '@/i18n/constants/languages';

export type LegalDocumentKind = 'privacy' | 'terms';

type LegalSection = {
  heading: string;
  bullets?: string[];
  paragraphs?: string[];
};

type LegalDocument = {
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
};

const BRAND_EN = 'Dahabi';
const BRAND_AR = 'سوق التعدين';
const SUPPORT_EMAIL = 'support@miningmarketplace.com';
const EFFECTIVE_DATE_EN = 'July 26, 2026';
const EFFECTIVE_DATE_AR = '26 يوليو 2026';

// Sourced from mining-compliance/assets/legal-content.js (en + ar) — keep in
// sync with that file, which is the canonical source served on the public
// compliance site.
export const legalDocuments: Record<
  SupportedLanguageCode,
  Record<LegalDocumentKind, LegalDocument>
> = {
  en: {
    privacy: {
      title: 'Privacy Policy',
      effectiveDate: EFFECTIVE_DATE_EN,
      lastUpdated: EFFECTIVE_DATE_EN,
      intro: `This Privacy Policy explains how ${BRAND_EN} collects, uses, discloses, and protects your information when you use the ${BRAND_EN} buyer/supplier apps and backend. It covers the product modules below: Auth & Profile, Company & Supplier Verification, Security (OTP / MPIN / Sessions), Uploads, RFQs & Tenders, and Quotes & Listings.`,
      sections: [
        {
          heading: '1. Auth & Profile (User)',
          bullets: [
            'Full name, phone number (E.164 with country calling code), optional email and company address.',
            'Company location (latitude / longitude) when you set a site address or use the location picker.',
            'Profile photo (avatar), role (buyer/mining company or supplier), verification status, credits balance, and account status.',
            'Language preference and biometric preference flags stored with your account / device settings.',
          ],
        },
        {
          heading: '2. Company & Supplier Verification',
          bullets: [
            'Company registration / trade license number and supporting document images when you submit verification.',
            'Supplier category, service capabilities, and equipment fleet details submitted for supplier verification.',
            'These documents are used to verify identity and business legitimacy and to enable supplier features; they are not sold.',
          ],
        },
        {
          heading: '3. Security — OTP, MPIN & Sessions',
          bullets: [
            'One-time passwords (OTP) for signup, login, and MPIN reset — delivered via WhatsApp; codes are stored hashed with expiry and attempt limits.',
            'Your 4-digit MPIN is stored only as a secure hash (argon2id), with lockout metadata after failed attempts.',
            'Signed-in sessions use a device ID and JWT session id (jti); we track last seen and can revoke sessions on logout or new-device login.',
            `On your device, ${BRAND_EN} may keep an access token and (if you enable biometrics) a cached MPIN in secure storage for Face ID / fingerprint unlock.`,
          ],
        },
        {
          heading: '4. Uploads & Media',
          bullets: [
            'Images and files you upload for profile photos, company/license scans, equipment photos, and assay/lab reports are stored so the apps and API can display and verify them.',
            'Upload object keys are associated with your account (including phone-linked storage paths used by the uploads module).',
          ],
        },
        {
          heading: '5. RFQs & Tenders module',
          bullets: [
            'Requirement title, category (equipment rental, services, spare parts, logistics, workforce), location, quantity, budget range, and deadline.',
            'RFQs are linked to your buyer account and matched against qualified suppliers by category and location.',
          ],
        },
        {
          heading: '6. Quotes & Listings module',
          bullets: [
            'Quote price, availability, lead time, and terms submitted by suppliers in response to an RFQ.',
            'Product/service catalog listings (equipment, spare parts, rental inventory, service offerings) published by suppliers, where enabled.',
            'Quotes and listings are linked to your supplier account so buyers can compare offers and select a winner.',
          ],
        },
        {
          heading: '7. How We Use Information',
          bullets: [
            'Create and manage buyer/supplier accounts; send OTP; authenticate with MPIN or biometrics.',
            'Verify company and supplier identity; enable supplier onboarding and role switching.',
            'Power marketplace features: RFQ matching, quote submission, supplier directories, and related in-app flows.',
            'Protect the platform (fraud prevention, rate limits, session revocation) and improve reliability.',
          ],
        },
        {
          heading: '8. Sharing of Information',
          bullets: [
            'We do not sell personal or company data.',
            `Limited data is shared with service providers needed to run ${BRAND_EN} (hosting, database, WhatsApp OTP, maps, analytics) under appropriate safeguards.`,
            'RFQ-relevant details may be shared between matched buyers and suppliers to complete a deal.',
            'We may disclose information when required by law or legal process.',
          ],
        },
        {
          heading: '9. Retention, Security & Your Choices',
          bullets: [
            `Data is retained as needed to operate ${BRAND_EN}, meet legal obligations, resolve disputes, and enforce agreements. Soft-deleted accounts may be removed or anonymized over time.`,
            'Protections include encrypted transport, hashed MPINs, JWT sessions with server-side revocation, and auth rate limits.',
            'You can update profile data in Settings, manage device permissions (location, camera, biometrics), and request access, correction, or deletion where the law allows.',
          ],
        },
        {
          heading: '10. Contact Us',
          paragraphs: [`Questions about this Privacy Policy: ${SUPPORT_EMAIL} or in-app support.`],
        },
      ],
    },
    terms: {
      title: 'Terms and Conditions',
      effectiveDate: EFFECTIVE_DATE_EN,
      lastUpdated: EFFECTIVE_DATE_EN,
      intro: `These Terms govern your use of ${BRAND_EN}, including Auth, Company/Supplier verification, RFQs, Quotes, and Listings features.`,
      sections: [
        {
          heading: '1. Acceptance of Terms',
          paragraphs: [
            `By creating a ${BRAND_EN} account or using any part of the apps or API-backed services, you agree to these Terms. If you do not agree, do not use ${BRAND_EN}.`,
          ],
        },
        {
          heading: '2. Eligibility & Accounts (Auth)',
          bullets: [
            'You must be at least 18 years old and provide accurate phone, company, and profile information.',
            'You are responsible for your MPIN, biometric unlock (if enabled), and activity on your account.',
            `${BRAND_EN} may revoke sessions when you log out or sign in on another device.`,
          ],
        },
        {
          heading: '3. Company & Supplier Verification',
          bullets: [
            'Buyers may submit company registration details; suppliers may submit trade license and capability details for verification.',
            'Providing false documents or misusing verification is prohibited and may lead to suspension.',
          ],
        },
        {
          heading: '4. Platform Use — RFQs, Quotes & Listings',
          bullets: [
            'Buyers may post RFQs and tenders describing equipment, services, or supplies they need.',
            'Suppliers may submit quotes and, where enabled, publish catalog listings for equipment, spare parts, and services.',
            'You are responsible for the accuracy and legality of RFQs, quotes, listings, and communications you create.',
            'Do not misuse RFQ matching, messaging, credits, or payment-related features.',
          ],
        },
        {
          heading: '5. Deals & Payments',
          paragraphs: [
            'A deal is confirmed only according to the rules shown in the app at acceptance. Pricing, fees, payment options, and cancellation policies may vary by RFQ, quote, and category.',
          ],
        },
        {
          heading: '6. Acceptable Use',
          bullets: [
            `No unlawful, abusive, or fraudulent use of ${BRAND_EN}.`,
            'No attempts to disrupt, reverse engineer, or compromise auth, uploads, or other services.',
          ],
        },
        {
          heading: '7. Limitation of Liability & Changes',
          paragraphs: [
            `To the fullest extent permitted by law, ${BRAND_EN} is provided "as is". We are not liable for indirect or consequential losses, including interactions between buyers and suppliers.`,
            'We may update these Terms from time to time. Continued use after publication means you accept the revised Terms.',
          ],
        },
      ],
    },
  },
  ar: {
    privacy: {
      title: 'سياسة الخصوصية',
      effectiveDate: EFFECTIVE_DATE_AR,
      lastUpdated: EFFECTIVE_DATE_AR,
      intro: `توضح هذه السياسة كيف تجمع ${BRAND_AR} معلوماتك وتستخدمها وتحميها عند استخدام تطبيقات المشترين/الموردين والخادم. وتشمل الوحدات: المصادقة والملف الشخصي، التحقق من الشركة والمورد، الأمان (OTP / MPIN / الجلسات)، الرفع، طلبات التسعير والمناقصات، والعروض.`,
      sections: [
        {
          heading: '1. المصادقة والملف الشخصي (User)',
          bullets: [
            'الاسم الكامل، رقم الهاتف (E.164 مع رمز الدولة)، والبريد وعنوان الشركة الاختياريان.',
            'موقع الشركة على الخريطة (خط العرض/الطول) عند تحديد عنوان الموقع أو استخدام منتقي الموقع.',
            'صورة الملف الشخصي، نوع المستخدم (شركة تعدين مشترية أو مورّد)، حالة التحقق، رصيد النقاط، وحالة الحساب.',
            'تفضيل اللغة والبيومترية المخزّنان مع الحساب / إعدادات الجهاز.',
          ],
        },
        {
          heading: '2. التحقق من الشركة والمورّد',
          bullets: [
            'رقم السجل التجاري / الترخيص وصور الوثائق الداعمة عند إرسال التحقق.',
            'فئة المورّد وقدراته الخدمية وتفاصيل أسطول المعدات المقدَّمة للتحقق.',
            'تُستخدم هذه الوثائق للتحقق من الهوية وشرعية النشاط التجاري وتمكين ميزات المورّد؛ ولا يتم بيعها.',
          ],
        },
        {
          heading: '3. الأمان — OTP والرمز السري والجلسات',
          bullets: [
            'رموز التحقق لمرة واحدة للتسجيل وتسجيل الدخول وإعادة تعيين الرمز السري — عبر واتساب؛ تُخزَّن مجزّأة مع انتهاء صلاحية وحدود للمحاولات.',
            'يُخزَّن الرمز السري المكوّن من 4 أرقام كتجزئة آمنة فقط (argon2id) مع بيانات القفل بعد المحاولات الفاشلة.',
            'تشمل الجلسات معرّف الجهاز ومعرّف جلسة JWT مع إمكانية الإلغاء عند تسجيل الخروج أو الدخول من جهاز آخر.',
            'على جهازك قد يحتفظ التطبيق برمز الوصول وبـ MPIN مخزّن بأمان إذا فعّلت البيومترية.',
          ],
        },
        {
          heading: '4. الرفع والوسائط',
          bullets: [
            'الصور والملفات التي ترفعها للملف الشخصي ووثائق الشركة وصور المعدات وتقارير الفحص/المختبر تُخزَّن للعرض والتحقق.',
            'ترتبط مفاتيح التخزين بحسابك (بما في ذلك مسارات مرتبطة بالهاتف في وحدة الرفع).',
          ],
        },
        {
          heading: '5. وحدة طلبات التسعير والمناقصات (RFQ)',
          bullets: [
            'عنوان الطلب والفئة (تأجير معدات، خدمات، قطع غيار، لوجستيات، قوى عاملة) والموقع والكمية ونطاق الميزانية والموعد النهائي.',
            'ترتبط طلبات التسعير بحساب المشتري وتُطابَق مع الموردين المؤهلين حسب الفئة والموقع.',
          ],
        },
        {
          heading: '6. وحدة العروض والقوائم',
          bullets: [
            'سعر العرض ومدى التوفر ومدة التسليم والشروط المقدَّمة من الموردين ردًا على طلب التسعير.',
            'قوائم كتالوج المنتجات/الخدمات (معدات، قطع غيار، مخزون تأجير، عروض خدمات) التي ينشرها الموردون حيثما تتوفر هذه الميزة.',
            'ترتبط العروض والقوائم بحساب المورّد ليتمكن المشترون من مقارنة العروض واختيار الفائز.',
          ],
        },
        {
          heading: '7. كيف نستخدم المعلومات',
          bullets: [
            'إنشاء حسابات المشترين/الموردين وإرسال OTP وتأمين الدخول بالرمز السري أو البيومترية.',
            'التحقق من هوية الشركة والمورّد وتمكين انضمام المورّد وتبديل الدور.',
            'تشغيل ميزات السوق: مطابقة طلبات التسعير وتقديم العروض ودلائل الموردين.',
            'حماية المنصة (منع الاحتيال وحدود المعدل وإلغاء الجلسات) وتحسين الاعتمادية.',
          ],
        },
        {
          heading: '8. مشاركة المعلومات',
          bullets: [
            'لا نبيع البيانات الشخصية أو بيانات الشركة.',
            `نشارك بيانات محدودة مع مزودي الخدمات اللازمين لتشغيل ${BRAND_AR} (الاستضافة وقاعدة البيانات وواتساب والخرائط والتحليلات) ضمن ضمانات مناسبة.`,
            'قد تُشارك تفاصيل طلب التسعير بين المشتري والمورّد المتطابقين لإتمام الصفقة.',
            'قد نكشف المعلومات عندما يتطلب القانون ذلك.',
          ],
        },
        {
          heading: '9. الاحتفاظ والأمان وخياراتك',
          bullets: [
            `نحتفظ بالبيانات بقدر الحاجة لتشغيل ${BRAND_AR} والالتزامات القانونية وحل النزاعات. قد تُحذف الحسابات المعطّلة أو تُجهّل مع الوقت.`,
            'تشمل الحماية تشفير الاتصال وتجزئة الرمز السري وجلسات JWT مع الإلغاء من الخادم.',
            'يمكنك تحديث الملف في الإعدادات وإدارة أذونات الجهاز وطلب الوصول أو التصحيح أو الحذف حيث يسمح القانون.',
          ],
        },
        {
          heading: '10. تواصل معنا',
          paragraphs: [`للاستفسارات حول سياسة الخصوصية: ${SUPPORT_EMAIL} أو الدعم داخل التطبيق.`],
        },
      ],
    },
    terms: {
      title: 'الشروط والأحكام',
      effectiveDate: EFFECTIVE_DATE_AR,
      lastUpdated: EFFECTIVE_DATE_AR,
      intro: `تحكم هذه الشروط استخدامك لـ ${BRAND_AR}، بما في ذلك المصادقة والتحقق من الشركة/المورّد وطلبات التسعير والعروض والقوائم.`,
      sections: [
        {
          heading: '1. قبول الشروط',
          paragraphs: [
            `بإنشاء حساب ${BRAND_AR} أو استخدام أي جزء من التطبيقات أو الخدمات، فإنك توافق على هذه الشروط. إذا كنت لا توافق فلا تستخدم ${BRAND_AR}.`,
          ],
        },
        {
          heading: '2. الأهلية والحسابات (Auth)',
          bullets: [
            'يجب أن يكون عمرك 18 سنة فأكثر وتقديم بيانات هاتف وشركة وملف دقيقة.',
            'أنت مسؤول عن الرمز السري والبيومترية (إن فُعّلت) ونشاط حسابك.',
            `قد تلغي ${BRAND_AR} الجلسات عند تسجيل الخروج أو الدخول من جهاز آخر.`,
          ],
        },
        {
          heading: '3. التحقق من الشركة والمورّد',
          bullets: [
            'قد يرسل المشترون بيانات السجل التجاري؛ وقد يرسل الموردون بيانات الترخيص والقدرات للتحقق.',
            'يُحظر تقديم وثائق مزيفة أو إساءة استخدام التحقق وقد يؤدي ذلك إلى التعليق.',
          ],
        },
        {
          heading: '4. استخدام المنصة — طلبات التسعير والعروض والقوائم',
          bullets: [
            'قد ينشر المشترون طلبات تسعير ومناقصات تصف المعدات أو الخدمات أو الإمدادات المطلوبة.',
            'قد يقدّم الموردون عروض أسعار وينشرون، حيثما تتوفر الميزة، قوائم كتالوج للمعدات وقطع الغيار والخدمات.',
            'أنت مسؤول عن دقة وقانونية ما تنشره من طلبات وعروض وقوائم وتواصل.',
            'يُحظر إساءة استخدام مطابقة طلبات التسعير أو الرسائل أو الأرصدة أو ميزات الدفع.',
          ],
        },
        {
          heading: '5. الصفقات والمدفوعات',
          paragraphs: [
            'تُؤكَّد الصفقة وفق القواعد المعروضة في التطبيق وقت القبول. قد تختلف الأسعار والرسوم وخيارات الدفع وسياسات الإلغاء حسب طلب التسعير والعرض والفئة.',
          ],
        },
        {
          heading: '6. الاستخدام المقبول',
          bullets: [
            `يُحظر الاستخدام غير القانوني أو المسيء أو الاحتيالي لـ ${BRAND_AR}.`,
            'يُحظر محاولة تعطيل أو اختراق المصادقة أو الرفع أو الخدمات الأخرى.',
          ],
        },
        {
          heading: '7. تحديد المسؤولية والتغييرات',
          paragraphs: [
            `إلى أقصى حد يسمح به القانون، تُقدَّم ${BRAND_AR} «كما هي». لسنا مسؤولين عن الخسائر غير المباشرة، بما في ذلك التفاعل بين المشترين والموردين.`,
            'قد نحدّث هذه الشروط من وقت لآخر. استمرار الاستخدام بعد النشر يعني قبول الشروط المعدّلة.',
          ],
        },
      ],
    },
  },
};
