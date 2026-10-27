// Every word on the site lives here, in Bangla and English. The 3D room, the
// side panels and the 2D/SEO page all read from this file.

export type Lang = 'bn' | 'en'
export type L = { bn: string; en: string }
export const tr = (l: L, lang: Lang) => l[lang]

export type StopId = 'home' | 'czcommerce' | 'services' | 'products' | 'work' | 'tech' | 'courier' | 'process' | 'contact' | 'leadership'

export const STOPS: { id: StopId; label: L }[] = [
  { id: 'home', label: { bn: 'হোম', en: 'Home' } },
  { id: 'czcommerce', label: { bn: 'CZ Commerce', en: 'CZ Commerce' } },
  { id: 'services', label: { bn: 'সার্ভিস', en: 'Services' } },
  { id: 'products', label: { bn: 'প্রোডাক্ট', en: 'Products' } },
  { id: 'work', label: { bn: 'কাজ', en: 'Work' } },
  { id: 'tech', label: { bn: 'টেক স্ট্যাক', en: 'Tech Stack' } },
  { id: 'courier', label: { bn: 'কুরিয়ার চেক', en: 'Courier Check' } },
  { id: 'process', label: { bn: 'প্রসেস', en: 'Process' } },
  { id: 'contact', label: { bn: 'যোগাযোগ', en: 'Contact' } },
  { id: 'leadership', label: { bn: 'নেতৃত্ব', en: 'Leadership' } },
]

export const CONTACT = {
  phone: '+880 1613-926617',
  phoneHref: 'tel:+8801613926617',
  whatsapp: '+880 1885-660190',
  whatsappNumber: '8801885660190',
  email: 'support@coderzonebd.com',
  address: { bn: 'ইসলামিয়া কলেজ রোড, বয়রা, খুলনা', en: 'Islamia College Road, Boyra, Khulna' } as L,
  portal: 'https://portal.czbd.app',
  github: 'https://github.com/coderzonebd',
  website: 'https://coderzonebd.com',
}

export const waLink = (text: string) => `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(text)}`

export const COMPANY = {
  name: 'Coder Zone BD',
  headline: {
    bn: 'বিক্রি বাড়ুক, ঝামেলা কমুক — সেই সফটওয়্যার আমরা বানাই।',
    en: 'Sell more. Stress less. We build the software that does both.',
  } as L,
  intro: {
    bn: 'খুলনা থেকে ২০২৪ সাল থেকে কাজ করছি। ওয়েবসাইট, ই-কমার্স, কাস্টম সফটওয়্যার আর নিজেদের প্রোডাক্ট — সবকিছু নিজেদের টিমে বানাই।',
    en: 'A Khulna software studio, working since 2024. Websites, e-commerce, custom software and our own products — all built by our in-house team.',
  } as L,
  stats: [
    { value: '100+', label: { bn: 'স্টোরে চলে CheckoutGuard', en: 'stores run CheckoutGuard' } },
    { value: '4', label: { bn: 'সার্ভিস লাইন', en: 'service lines' } },
    { value: '24/7', label: { bn: 'মনিটরিং', en: 'monitoring' } },
    { value: '100%', label: { bn: 'ইন-হাউস টিম', en: 'in-house' } },
  ] as { value: string; label: L }[],
  whyTitle: { bn: 'কেন আমরা', en: 'Why us' } as L,
  why: [
    { bn: 'প্যাকেজ না, আগে আসল আলাপ — আপনার সমস্যা বুঝে তারপর সমাধান।', en: 'A real conversation first, not a package — we understand the problem before proposing a fix.' },
    { bn: 'যারা বানাচ্ছে, তাদের সাথে সরাসরি কথা বলুন — মাঝে কোনো দালাল নেই।', en: 'Direct access to the people who build your project — no middlemen.' },
    { bn: 'কোড, সার্ভার আর অ্যাকাউন্ট — সবকিছুর মালিক আপনি।', en: 'You own the code, the servers and the accounts.' },
    { bn: 'লঞ্চের পরে বাগ ফিক্স আর ছোটখাটো পরিবর্তনে নতুন বিল নেই।', en: 'Post-launch bug fixes and small changes without a new bill.' },
  ] as L[],
  team: [
    { name: 'Rakib Uddin', role: 'CEO · CTO' },
    { name: 'Barek Mian', role: 'CMO · CFO' },
  ],
}

/** The founders' cabins: only facts already stated above (names, roles, the studio). */
export const LEADERSHIP = {
  intro: {
    bn: 'Coder Zone BD চালান দুই প্রতিষ্ঠাতা। খুলনার এই স্টুডিও ২০২৪ সাল থেকে কাজ করছে, আর সবকিছু বানায় নিজেদের টিম। যারা বানাচ্ছে, তাদের সাথে সরাসরি কথা বলুন — মাঝে কোনো দালাল নেই।',
    en: 'Coder Zone BD is led by its two founders. The Khulna studio has been working since 2024, and everything is built by its in-house team. You talk directly to the people who build your project — no middlemen.',
  } as L,
  founders: [
    { who: 'ceo' as const, name: 'Rakib Uddin', role: 'CEO · CTO', duty: { bn: 'প্রধান নির্বাহী ও প্রযুক্তি প্রধান', en: 'Chief Executive and Chief Technology Officer' } as L },
    { who: 'cmo' as const, name: 'Barek Mian', role: 'CMO · CFO', duty: { bn: 'প্রধান মার্কেটিং ও আর্থিক কর্মকর্তা', en: 'Chief Marketing and Chief Financial Officer' } as L },
  ],
  assistant: {
    bn: 'প্রতিটি কেবিনের ডেস্কের স্ক্রিনে আছে একজন AI সহকারী। প্রতিষ্ঠাতা ব্যস্ত থাকলেও প্রশ্ন করুন — যেকোনো সময়।',
    en: 'Each cabin has an AI assistant on the desk screen. Ask it anything, any time — even when the founder is busy.',
  } as L,
  ask: { bn: 'AI সহকারীকে জিজ্ঞেস করুন', en: 'Ask the AI assistant' } as L,
}

export interface Service {
  id: string
  letter: string
  title: L
  card: L
  desc: L
  gets: L[]
  /** Formatted starting price, or null when it is quoted after discussion. */
  price: L | null
  duration: L | null
  proof: string[]
}

export const SERVICES: Service[] = [
  {
    id: 'website', letter: 'a',
    title: { bn: 'বিজনেস ওয়েবসাইট', en: 'Business Website' },
    card: { bn: 'দ্রুত, মোবাইল-ফ্রেন্ডলি কোম্পানি সাইট', en: 'Fast, mobile-first company site' },
    desc: { bn: 'আপনার ব্যবসার পরিচয়, সার্ভিস আর যোগাযোগ এক জায়গায় — মোবাইলে দ্রুত লোড হয়, গুগলে খুঁজে পাওয়া যায়।', en: 'Your business, services and contact details in one place — loads fast on phones and is easy to find on Google.' },
    gets: [
      { bn: '৫–৮টি পেজ', en: '5–8 pages' },
      { bn: 'মোবাইলে দ্রুত লোড', en: 'Fast on mobile' },
      { bn: 'বেসিক SEO সেটআপ', en: 'Basic SEO setup' },
      { bn: 'কন্টাক্ট ফর্ম', en: 'Contact form' },
    ],
    price: { bn: '৳১০,০০০', en: '৳10,000' },
    duration: { bn: '১০–১৪ দিন', en: '10–14 days' },
    proof: ['cosmooit'],
  },
  {
    id: 'ecommerce', letter: 'b',
    title: { bn: 'ই-কমার্স স্টোর', en: 'E-commerce Store' },
    card: { bn: 'বিকাশ, কুরিয়ার আর CheckoutGuard সহ', en: 'With bKash, couriers and CheckoutGuard' },
    desc: { bn: 'WooCommerce-এ পুরো অনলাইন দোকান — পেমেন্ট, কুরিয়ার বুকিং আর ফেক অর্ডার আটকানো সহ।', en: 'A complete WooCommerce shop — payments, courier booking and fake-order protection included.' },
    gets: [
      { bn: 'WooCommerce স্টোর', en: 'WooCommerce store' },
      { bn: 'বিকাশ পেমেন্ট', en: 'bKash payments' },
      { bn: 'কুরিয়ার ইন্টিগ্রেশন', en: 'Courier integration' },
      { bn: 'CheckoutGuard ১ বছর ফ্রি', en: 'CheckoutGuard free for 1 year' },
    ],
    price: { bn: '৳২০,০০০', en: '৳20,000' },
    duration: { bn: '৩–৪ সপ্তাহ', en: '3–4 weeks' },
    proof: ['zayapin', 'innercollection', 'zalonbd', 'backend-ecom'],
  },
  {
    id: 'webapp', letter: 'c',
    title: { bn: 'কাস্টম ওয়েব অ্যাপ / SaaS', en: 'Custom Web App / SaaS' },
    card: { bn: 'লগইন, ড্যাশবোর্ড, অ্যাডমিন, API', en: 'Login, dashboards, admin, API' },
    desc: { bn: 'আপনার কাজের ধরন অনুযায়ী বানানো সফটওয়্যার — রেডিমেড টুলে যা মেলে না, সেটা আমরা বানাই।', en: 'Software shaped around how you work — for the jobs off-the-shelf tools don\'t fit.' },
    gets: [
      { bn: 'ইউজার লগইন ও রোল', en: 'User login and roles' },
      { bn: 'ড্যাশবোর্ড ও রিপোর্ট', en: 'Dashboards and reports' },
      { bn: 'অ্যাডমিন প্যানেল', en: 'Admin panel' },
      { bn: 'API ও ইন্টিগ্রেশন', en: 'API and integrations' },
    ],
    price: { bn: '৳৩০,০০০', en: '৳30,000' },
    duration: { bn: '৬–১০ সপ্তাহ', en: '6–10 weeks' },
    proof: ['czcommerce', 'licensing', 'mess'],
  },
  {
    id: 'plugin', letter: 'd',
    title: { bn: 'ওয়ার্ডপ্রেস প্লাগইন ও ইন্টিগ্রেশন', en: 'WordPress Plugin & Integration' },
    card: { bn: 'পেমেন্ট ও কুরিয়ার API', en: 'Payment and courier APIs' },
    desc: { bn: 'কাস্টম ওয়ার্ডপ্রেস প্লাগইন আর API সংযোগ — Steadfast, Pathao, Carrybee, Paperfly, RedX; বিকাশ, Stripe।', en: 'Custom WordPress plugins and API connections — Steadfast, Pathao, Carrybee, Paperfly, RedX; bKash, Stripe.' },
    gets: [
      { bn: 'কাস্টম প্লাগইন', en: 'Custom plugins' },
      { bn: 'কুরিয়ার API (৫টি কুরিয়ার)', en: 'Courier APIs (5 couriers)' },
      { bn: 'পেমেন্ট গেটওয়ে (বিকাশ, Stripe)', en: 'Payment gateways (bKash, Stripe)' },
    ],
    price: { bn: '৳৫,০০০', en: '৳5,000' },
    duration: null,
    proof: ['checkoutguard'],
  },
  {
    id: 'mobile', letter: 'e',
    title: { bn: 'মোবাইল অ্যাপ (Flutter)', en: 'Mobile App (Flutter)' },
    card: { bn: 'এক কোডে Android + iOS', en: 'Android + iOS from one codebase' },
    desc: { bn: 'Flutter দিয়ে একসাথে Android আর iOS অ্যাপ — আপনার ওয়েব সিস্টেমের সাথে যুক্ত।', en: 'Android and iOS apps built together in Flutter, connected to your web system.' },
    gets: [
      { bn: 'Android + iOS অ্যাপ', en: 'Android + iOS apps' },
      { bn: 'API সংযোগ', en: 'API connection' },
      { bn: 'স্টোরে পাবলিশে সহায়তা', en: 'Help publishing to the stores' },
    ],
    price: { bn: '৳২০,০০০', en: '৳20,000' },
    duration: { bn: '৬–১০ সপ্তাহ', en: '6–10 weeks' },
    proof: ['ownpay'],
  },
  {
    id: 'social', letter: 'f',
    title: { bn: 'সোশ্যাল মিডিয়া অটোমেশন', en: 'Social Media Automation' },
    card: { bn: 'পোস্ট শিডিউল ও অটোমেশন', en: 'Post scheduling and automation' },
    desc: { bn: 'পোস্ট শিডিউল, মেসেজ আর রিপোর্ট অটোমেট করে সময় বাঁচান।', en: 'Automate post scheduling, messages and reports to save hours every week.' },
    gets: [
      { bn: 'শিডিউলড পোস্টিং', en: 'Scheduled posting' },
      { bn: 'অটোমেটেড ওয়ার্কফ্লো', en: 'Automated workflows' },
    ],
    price: { bn: '৳৫,০০০', en: '৳5,000' },
    duration: null,
    proof: ['czsocial'],
  },
  {
    id: 'iot', letter: 'g',
    title: { bn: 'IoT ও ফার্মওয়্যার (ESP32)', en: 'IoT & Firmware (ESP32)' },
    card: { bn: 'ESP32 ডিভাইস ও ফার্মওয়্যার', en: 'ESP32 devices and firmware' },
    desc: { bn: 'ESP32 ভিত্তিক ডিভাইসের ফার্মওয়্যার আর তার সাথে যুক্ত সার্ভার/অ্যাপ।', en: 'Firmware for ESP32-based devices, plus the server or app they talk to.' },
    gets: [
      { bn: 'ESP32 ফার্মওয়্যার', en: 'ESP32 firmware' },
      { bn: 'ডিভাইস–সার্ভার সংযোগ', en: 'Device-to-server connection' },
    ],
    price: { bn: '৳৫,০০০', en: '৳5,000' },
    duration: null,
    proof: ['companionos'],
  },
  {
    id: 'maintenance', letter: 'h',
    title: { bn: 'মাসিক মেইনটেন্যান্স', en: 'Monthly Maintenance' },
    card: { bn: 'আপডেট, ব্যাকআপ, মনিটরিং', en: 'Updates, backups, monitoring' },
    desc: { bn: 'সাইট চালু থাকুক নিশ্চিন্তে — নিয়মিত আপডেট, ব্যাকআপ, ছোট পরিবর্তন আর মনিটরিং।', en: 'Keep your site healthy — regular updates, backups, small changes and monitoring.' },
    gets: [
      { bn: 'নিয়মিত আপডেট', en: 'Regular updates' },
      { bn: 'ব্যাকআপ', en: 'Backups' },
      { bn: 'ছোটখাটো পরিবর্তন', en: 'Small changes' },
      { bn: 'আপটাইম মনিটরিং', en: 'Uptime monitoring' },
    ],
    price: { bn: '৳২,০০০/মাস', en: '৳2,000/month' },
    duration: null,
    proof: [],
  },
]

export const priceText = (s: Service, lang: Lang) =>
  s.price
    ? lang === 'bn' ? `আনুমানিক শুরু ${s.price.bn}, আলোচনা সাপেক্ষে` : `Approx. from ${s.price.en}, negotiable`
    : lang === 'bn' ? 'মূল্য আলোচনা সাপেক্ষে' : 'Price on discussion'

export interface ProductInfo {
  id: string
  name: string
  color: string
  /** Path under the site base, e.g. logos/czcommerce.svg */
  logo: string
  tagline: L
  desc: L
  features: L[]
  tiers: { name: string; price: L }[]
  note?: L
  links: { label: L; url: string }[]
  comingSoon?: boolean
}

export const PRODUCTS: ProductInfo[] = [
  {
    id: 'czcommerce', name: 'CZ Commerce', color: '#2B3FD6', logo: 'logos/czcommerce.svg',
    tagline: { bn: 'এফ-কমার্স সেলারদের বাংলা প্যানেল', en: 'Bangla panel for f-commerce sellers' },
    desc: { bn: 'ফেসবুক সেলারদের জন্য অনলাইন স্টোর আর অর্ডার ম্যানেজমেন্ট — এক জায়গায়, বাংলায়।', en: 'Online store and order management for Facebook sellers — in one place, in Bangla.' },
    features: [
      { bn: 'অনলাইন স্টোর ও ল্যান্ডিং পেজ', en: 'Online store and landing pages' },
      { bn: '৪টি কুরিয়ারে বাল্ক বুকিং', en: 'Bulk booking on 4 couriers' },
      { bn: 'ফেক অর্ডার চেক', en: 'Fake-order check' },
      { bn: 'মেসেঞ্জার ইনবক্স', en: 'Messenger inbox' },
    ],
    tiers: [
      { name: 'Free', price: { bn: 'ফ্রি', en: 'Free' } },
      { name: 'Starter', price: { bn: '৳৬৯০/মাস', en: '৳690/mo' } },
      { name: 'Growth', price: { bn: '৳১,৪৯০/মাস', en: '৳1,490/mo' } },
      { name: 'Pro', price: { bn: '৳২,৯৯০/মাস', en: '৳2,990/mo' } },
    ],
    note: { bn: 'কুপন CZ50 — ৬ মাস ৫০% ছাড়', en: 'Coupon CZ50 — 50% off for 6 months' },
    links: [{ label: { bn: 'czcommerce.app দেখুন', en: 'Visit czcommerce.app' }, url: 'https://czcommerce.app/' }],
  },
  {
    id: 'checkoutguard', name: 'CheckoutGuard', color: '#0E8A5F', logo: 'logos/checkoutguard.png',
    tagline: { bn: 'WooCommerce অর্ডার সুরক্ষা', en: 'WooCommerce order protection' },
    desc: { bn: 'অসম্পূর্ণ চেকআউট ধরে, ফ্রড অর্ডার আটকায়, আর ৫টি কুরিয়ারে কাস্টমারের ডেলিভারি সাকসেস রেট দেখায়।', en: 'Captures incomplete checkouts, blocks fraud and shows a customer\'s delivery success rate across 5 couriers.' },
    features: [
      { bn: 'অসম্পূর্ণ চেকআউট', en: 'Incomplete checkouts' },
      { bn: 'ফ্রড ব্লকিং', en: 'Fraud blocking' },
      { bn: '৫ কুরিয়ারে সাকসেস রেট', en: 'Courier success rate (5 couriers)' },
      { bn: 'ইনভয়েস', en: 'Invoices' },
    ],
    tiers: [
      { name: 'Free', price: { bn: 'ফ্রি', en: 'Free' } },
      { name: 'Basic', price: { bn: '৳২৯৯/মাস', en: '৳299/mo' } },
      { name: 'Pro', price: { bn: '৳৪৯৯/মাস', en: '৳499/mo' } },
      { name: 'Agency', price: { bn: '৳৯৯৯/মাস', en: '৳999/mo' } },
    ],
    links: [
      { label: { bn: 'প্রোডাক্ট পেজ', en: 'Product page' }, url: 'https://coderzonebd.com/products/checkoutguard' },
      { label: { bn: 'WordPress.org', en: 'WordPress.org' }, url: 'https://wordpress.org/plugins/checkoutguard/' },
    ],
  },
  {
    id: 'laravel-ecom', name: 'Laravel Ecom', color: '#1C1E26', logo: 'logos/coderzone-mark.png',
    tagline: { bn: 'লাইসেন্সড Laravel ই-কমার্স', en: 'Licensed Laravel e-commerce' },
    desc: { bn: 'নিজের সার্ভারে চালানোর মতো পূর্ণ Laravel ই-কমার্স সিস্টেম, লাইসেন্সসহ।', en: 'A complete Laravel e-commerce system to run on your own server, with a licence.' },
    features: [
      { bn: 'নিজের সার্ভারে হোস্ট', en: 'Self-hosted' },
      { bn: 'অ্যাডমিন প্যানেল', en: 'Admin panel' },
    ],
    tiers: [
      { name: 'Lifetime', price: { bn: '৳২০,০০০ লাইফটাইম (সেলফ-হোস্টেড)', en: '৳20,000 lifetime (self-hosted)' } },
    ],
    note: { bn: 'কোনো মাসিক ফি নেই — একবার কিনুন, নিজের সার্ভারে চালান।', en: 'No monthly fee — buy once, run it on your own server.' },
    links: [{ label: { bn: 'প্রোডাক্ট পেজ', en: 'Product page' }, url: 'https://coderzonebd.com/products/laravel-ecom' }],
  },
  {
    id: 'czsocial', name: 'CZ Social', color: '#E87A0C', logo: 'logos/coderzone-mark.png',
    tagline: { bn: 'শীঘ্রই আসছে', en: 'Coming soon' },
    desc: { bn: 'সোশ্যাল মিডিয়া অটোমেশন প্ল্যাটফর্ম — এখন ডেভেলপমেন্টে আছে, এখনো বিক্রি হচ্ছে না।', en: 'A social media automation platform — in development, not for sale yet.' },
    features: [],
    tiers: [],
    links: [],
    comingSoon: true,
  },
  {
    id: 'tinybot', name: 'TinyBot', color: '#6C3CE0', logo: 'logos/coderzone-mark.png',
    tagline: { bn: 'আমাদের প্রথম ফিজিক্যাল প্রোডাক্ট — শীঘ্রই আসছে', en: 'Our first physical product — coming soon' },
    desc: { bn: 'Coder Zone BD-এর প্রথম হার্ডওয়্যার প্রোডাক্ট, এখন ডেভেলপমেন্টে আছে। লঞ্চের খবর সবার আগে পেতে হোয়াটসঅ্যাপে মেসেজ দিন।', en: "Coder Zone BD's first hardware product, in development now. Message us on WhatsApp to hear first when it launches." },
    features: [],
    tiers: [],
    links: [],
    comingSoon: true,
  },
]

/** The CZ Commerce launchpad in the middle of the studio: slides on its screen and the panel's pitch. */
export const CZ_PROMO = {
  url: 'https://czcommerce.app/',
  hook: { bn: 'ফেসবুকে বিক্রি করেন? নিজের অনলাইন স্টোর খুলুন — ফ্রি-তে।', en: 'Selling on Facebook? Open your own online store — free.' } as L,
  sub: { bn: 'অর্ডার, কুরিয়ার, ফেক অর্ডার চেক আর মেসেঞ্জার — সব এক প্যানেলে, বাংলায়।', en: 'Orders, couriers, fake-order checks and Messenger — one panel, in Bangla.' } as L,
  start: { bn: 'ফ্রি-তে শুরু করুন', en: 'Start free' } as L,
  whatsapp: { bn: 'হোয়াটসঅ্যাপে সেটআপে সাহায্য নিন', en: 'Get setup help on WhatsApp' } as L,
  waText: { bn: 'আসসালামু আলাইকুম! 3D স্টুডিও থেকে CZ Commerce সম্পর্কে জানতে চাই।', en: 'Hi! I saw CZ Commerce in the 3D studio and would like to know more.' } as L,
  slides: [
    { title: { bn: 'ফেসবুকে বিক্রি করেন?', en: 'Selling on Facebook?' }, body: { bn: 'নিজের অনলাইন স্টোর খুলুন — ফ্রি-তে, ৫ মিনিটে।', en: 'Open your own online store — free, in 5 minutes.' } },
    { title: { bn: 'সব এক প্যানেলে', en: 'Everything in one panel' }, body: { bn: 'স্টোর ও ল্যান্ডিং পেজ · ৪ কুরিয়ারে বাল্ক বুকিং · ফেক অর্ডার চেক · মেসেঞ্জার ইনবক্স', en: 'Store and landing pages · bulk booking on 4 couriers · fake-order check · Messenger inbox' } },
    { title: { bn: 'হোস্টিং খরচ নেই', en: 'No hosting bills' }, body: { bn: 'ফ্রি প্ল্যান · Starter ৳৬৯০ · Growth ৳১,৪৯০ · Pro ৳২,৯৯০ / মাস', en: 'Free plan · Starter ৳690 · Growth ৳1,490 · Pro ৳2,990 / month' } },
    { title: { bn: 'কুপন CZ50', en: 'Coupon CZ50' }, body: { bn: '৬ মাস ৫০% ছাড় — আজই শুরু করুন: czcommerce.app', en: '50% off for 6 months — start today at czcommerce.app' } },
  ] as { title: L; body: L }[],
}

export interface WorkItem {
  id: string
  name: string
  type: L
  stack: string
  url?: string
  /** Real screenshot in public/work/<id>.jpg (only for live sites). */
  shot?: boolean
}

export const WORK: WorkItem[] = [
  { id: 'checkoutguard', name: 'CheckoutGuard', type: { bn: 'ওয়ার্ডপ্রেস প্লাগইন', en: 'WordPress plugin' }, stack: 'WordPress · WooCommerce · PHP', url: 'https://wordpress.org/plugins/checkoutguard/', shot: true },
  { id: 'zayapin', name: 'Zayapin', type: { bn: 'ই-কমার্স স্টোর', en: 'E-commerce store' }, stack: 'E-commerce', url: 'https://zayapin.com', shot: true },
  { id: 'innercollection', name: 'Inner Collection', type: { bn: 'ই-কমার্স স্টোর', en: 'E-commerce store' }, stack: 'E-commerce', url: 'https://innercollection.com.bd', shot: true },
  { id: 'zalonbd', name: 'ZalonBD', type: { bn: 'ই-কমার্স স্টোর', en: 'E-commerce store' }, stack: 'E-commerce', url: 'https://zalonbd.com', shot: true },
  { id: 'cosmooit', name: 'Cosmoo IT', type: { bn: 'বিজনেস ওয়েবসাইট', en: 'Business website' }, stack: 'Website', url: 'https://cosmooit.com', shot: true },
  { id: 'czcommerce', name: 'CZ Commerce', type: { bn: 'SaaS প্ল্যাটফর্ম', en: 'SaaS platform' }, stack: 'SaaS', url: 'https://czcommerce.app', shot: true },
  { id: 'backend-ecom', name: 'Laravel eCommerce Backend', type: { bn: 'ই-কমার্স ব্যাকএন্ড', en: 'E-commerce backend' }, stack: 'Laravel 12', url: 'https://github.com/devrkb21/backend-ecom' },
  { id: 'czsocial', name: 'CZ Social', type: { bn: 'ডেভেলপমেন্টে আছে', en: 'In development' }, stack: 'Laravel · Livewire' },
  { id: 'licensing', name: 'Licensing & Subscription Engine', type: { bn: 'লাইসেন্সিং সিস্টেম', en: 'Licensing system' }, stack: 'Go · PostgreSQL · Redis · RabbitMQ' },
  { id: 'mess', name: 'Mess Management', type: { bn: 'ম্যানেজমেন্ট অ্যাপ', en: 'Management app' }, stack: 'TypeScript' },
  { id: 'finite', name: 'Finite', type: { bn: 'পার্সোনাল ফিন্যান্স PWA', en: 'Personal-finance PWA' }, stack: 'Laravel · Filament' },
  { id: 'ownpay', name: 'OwnPay Console', type: { bn: 'মোবাইল অ্যাপ', en: 'Mobile app' }, stack: 'Flutter' },
  { id: 'companionos', name: 'CompanionOS', type: { bn: 'ডিভাইস ফার্মওয়্যার', en: 'Device firmware' }, stack: 'ESP32 firmware' },
]

export const workById = (id: string) => WORK.find((w) => w.id === id)

export const COURIER = {
  title: { bn: 'কুরিয়ার চেক', en: 'Courier Check' } as L,
  desc: {
    bn: 'একটা ফোন নম্বর দিন — Pathao, Steadfast, RedX, Paperfly আর Carrybee মিলিয়ে সেই কাস্টমারের ডেলিভারি হিস্ট্রি দেখুন। ফ্রি, লগইন লাগে না।',
    en: 'Enter a phone number and see that customer\'s delivery history across Pathao, Steadfast, RedX, Paperfly and Carrybee. Free, no login.',
  } as L,
  couriers: ['Pathao', 'Steadfast', 'RedX', 'Paperfly', 'Carrybee'],
  logos: {
    Pathao: 'logos/couriers/pathao.svg', Steadfast: 'logos/couriers/steadfast.webp', RedX: 'logos/couriers/redx.svg',
    Paperfly: 'logos/couriers/paperfly.svg', Carrybee: 'logos/couriers/carrybee.webp',
  } as Record<string, string>,
  url: 'https://coderzonebd.com/courier-check',
  cta: { bn: 'এখনই চেক করুন', en: 'Check now' } as L,
}

export const PROCESS: { id: string; title: L; desc: L }[] = [
  { id: 'discover', title: { bn: 'আলোচনা ও পরিকল্পনা', en: 'Discover' }, desc: { bn: 'সাইন করার আগেই কাজের পরিধি, সময় আর খরচ লিখিতভাবে।', en: 'Scope, timeline and cost in writing before you sign.' } },
  { id: 'build', title: { bn: 'ডিজাইন ও ডেভেলপমেন্ট', en: 'Design & Build' }, desc: { bn: 'কাজ চলাকালীন নিয়মিত অগ্রগতির আপডেট।', en: 'Regular progress updates while we build.' } },
  { id: 'launch', title: { bn: 'লঞ্চ', en: 'Launch' }, desc: { bn: 'টেস্টিং, স্পিড, ব্যাকআপ আর মনিটরিং চেকলিস্ট মেনে লাইভ।', en: 'Go live with a testing, speed, backups and monitoring checklist.' } },
  { id: 'support', title: { bn: 'সাপোর্ট', en: 'Support' }, desc: { bn: 'লঞ্চের পর ৩০ দিন ফ্রি বাগ ফিক্স ও ছোট পরিবর্তন, তারপর চাইলে মেইনটেন্যান্স।', en: '30 days of free bug fixes and small changes after launch, then optional maintenance.' } },
]

export const FAQ: { q: L; a: L }[] = [
  { q: { bn: 'কোডের মালিক কে?', en: 'Who owns the code?' }, a: { bn: 'আপনি। কোড, সার্ভার, অ্যাকাউন্ট — সব আপনার নামে।', en: 'You do. Code, servers and accounts are all yours.' } },
  { q: { bn: 'লঞ্চের পরে সাপোর্ট আছে?', en: 'Support after launch?' }, a: { bn: 'হ্যাঁ, ৩০ দিন ফ্রি বাগ ফিক্স ও ছোট পরিবর্তন।', en: 'Yes — 30 days of free bug fixes and small changes.' } },
  { q: { bn: 'পেমেন্ট কীভাবে?', en: 'How do payments work?' }, a: { bn: 'ধাপে ধাপে (যেমন ৫০% শুরুতে, বাকিটা লঞ্চে) — বিকাশ, নগদ, রকেট, কার্ড (Stripe) বা ব্যাংক।', en: 'In stages (e.g. 50% upfront, the rest at launch) — bKash, Nagad, Rocket, card (Stripe) or bank.' } },
  { q: { bn: 'হোস্টিং?', en: 'Hosting?' }, a: { bn: 'আমাদের হোস্টিং, অথবা আপনার নিজের হোস্টিং প্রায় ফ্রিতে সেটআপ করে দিই।', en: 'Ours, or we set up your own hosting almost free.' } },
  { q: { bn: 'খুলনার বাইরে কাজ করেন?', en: 'Do you work outside Khulna?' }, a: { bn: 'হ্যাঁ, সারা বাংলাদেশ ও দেশের বাইরে — অনলাইনে।', en: 'Yes — across Bangladesh and abroad, online.' } },
]

export const TECH = ['Next.js', 'React', 'Go', 'PostgreSQL', 'Laravel', 'WordPress', 'WooCommerce', 'Node.js', 'TypeScript', 'Flutter', 'Stripe', 'bKash', 'Cloudflare']

/** Official marks: Simple Icons (CC0) in each brand's own colour; bKash from bkash.com. */
export const TECH_LOGOS: Record<string, string> = {
  'Next.js': 'logos/tech/nextjs.svg', React: 'logos/tech/react.svg', Go: 'logos/tech/go.svg', PostgreSQL: 'logos/tech/postgresql.svg',
  Laravel: 'logos/tech/laravel.svg', WordPress: 'logos/tech/wordpress.svg', WooCommerce: 'logos/tech/woocommerce.svg',
  'Node.js': 'logos/tech/nodejs.svg', TypeScript: 'logos/tech/typescript.svg', Flutter: 'logos/tech/flutter.svg',
  Stripe: 'logos/tech/stripe.svg', bKash: 'logos/tech/bkash.svg', Cloudflare: 'logos/tech/cloudflare.svg',
}

/** Reviews stay off until real ones exist; flip this and fill TESTIMONIALS then. */
export const SHOW_TESTIMONIALS = false
export const TESTIMONIALS: { name: string; company: string; quote: L }[] = []

export const UI = {
  tagline: { bn: '3D স্টুডিও', en: '3D Studio' },
  addToQuote: { bn: 'কোটে যোগ করুন', en: 'Add to quote' },
  inQuote: { bn: 'কোটে যোগ হয়েছে', en: 'Added to quote' },
  whatsapp: { bn: 'WhatsApp-এ জিজ্ঞেস করুন', en: 'Ask on WhatsApp' },
  quote: { bn: 'কোট লিস্ট', en: 'Quote list' },
  openQuote: { bn: 'কোট লিস্ট খুলুন', en: 'Open quote list' },
  whatYouGet: { bn: 'যা পাবেন', en: 'What you get' },
  duration: { bn: 'সময়', en: 'Duration' },
  price: { bn: 'মূল্য', en: 'Price' },
  proof: { bn: 'আমাদের কাজ', en: 'Proof' },
  pricing: { bn: 'প্ল্যান', en: 'Pricing' },
  visit: { bn: 'ভিজিট করুন', en: 'Visit site' },
  noPublic: { bn: 'পাবলিক সাইট নেই — নাম আর টেক স্ট্যাক দেওয়া হলো।', en: 'No public site — name and stack shown.' },
  comingSoon: { bn: 'শীঘ্রই আসছে', en: 'Coming soon' },
  close: { bn: 'বন্ধ করুন', en: 'Close' },
  prev: { bn: 'আগেরটা', en: 'Previous' },
  next: { bn: 'পরেরটা', en: 'Next' },
  emptyQuote: { bn: 'এখনো কিছু যোগ করেননি। সার্ভিস থেকে "কোটে যোগ করুন" চাপুন।', en: 'Nothing added yet. Tap "Add to quote" on a service.' },
  browseServices: { bn: 'সার্ভিস দেখুন', en: 'Browse services' },
  name: { bn: 'আপনার নাম', en: 'Your name' },
  phone: { bn: 'ফোন নম্বর', en: 'Phone number' },
  budget: { bn: 'বাজেট', en: 'Budget' },
  note: { bn: 'প্রজেক্ট সম্পর্কে কিছু লিখুন', en: 'Tell us about the project' },
  sendWa: { bn: 'WhatsApp-এ পাঠান', en: 'Send on WhatsApp' },
  sendMail: { bn: 'ইমেইলে পাঠান', en: 'Send by email' },
  required: { bn: 'নাম আর ফোন নম্বর দিন', en: 'Please add your name and phone' },
  contactTitle: { bn: 'যোগাযোগ ও কোট', en: 'Contact & quote' },
  team: { bn: 'টিম', en: 'Team' },
  faq: { bn: 'সাধারণ প্রশ্ন', en: 'FAQ' },
  skip3d: { bn: '3D বাদ দিন', en: 'Skip 3D' },
  view3d: { bn: '3D দেখুন', en: 'View in 3D' },
  loading: { bn: 'স্টুডিও সাজানো হচ্ছে…', en: 'Setting up the studio…' },
  hint: { bn: 'টেনে চারপাশ দেখুন · স্ক্রল করে জুম · ক্লিক করে খুলুন · Esc দিয়ে পেছনে', en: 'Drag to look around · Scroll to zoom · Click to open · Esc to go back' },
  hintTouch: { bn: 'টেনে চারপাশ দেখুন · দুই আঙুলে জুম · ট্যাপ করে খুলুন', en: 'Drag to look around · Pinch to zoom · Tap to open' },
  tour: { bn: 'ট্যুর', en: 'Tour' },
  stopTour: { bn: 'থামান', en: 'Stop' },
  overview: { bn: 'পুরো স্টুডিও', en: 'Overview' },
  help: { bn: 'কীভাবে ঘুরবেন', en: 'How to explore' },
  go: { bn: 'যান', en: 'Go to' },
  slowSwitched: { bn: 'ডিভাইস ধীর মনে হচ্ছে, তাই 2D ভার্সন দেখাচ্ছি।', en: 'Your device seems slow, so we switched to the 2D version.' },
  whyUs: { bn: 'কেন আমরা', en: 'Why us' },
  about: { bn: 'আমাদের সম্পর্কে', en: 'About us' },
  step: { bn: 'ধাপ', en: 'Step' },
  budgets: [
    { bn: 'ঠিক করিনি', en: 'Not sure yet' },
    { bn: '৳১০,০০০-এর কম', en: 'Under ৳10,000' },
    { bn: '৳১০,০০০ – ৳৩০,০০০', en: '৳10,000 – ৳30,000' },
    { bn: '৳৩০,০০০ – ৳১ লাখ', en: '৳30,000 – ৳1 lakh' },
    { bn: '৳১ লাখের বেশি', en: 'Over ৳1 lakh' },
  ],
} satisfies Record<string, L | L[]>

/** "See the studio in AR" (src/components/ArView.tsx). */
export const AR_TEXT = {
  button: { bn: 'AR-এ দেখুন', en: 'View in AR' },
  title: { bn: 'টেবিলের ওপর আমাদের স্টুডিও', en: 'Our studio on your table' },
  alt: { bn: 'Coder Zone BD স্টুডিওর ছোট একটি 3D মডেল', en: 'A miniature 3D model of the Coder Zone BD studio' },
  place: { bn: 'টেবিলে বসিয়ে দেখুন', en: 'Place it on your table' },
  howTo: { bn: 'ক্যামেরা একটা টেবিল বা মেঝের দিকে ধরুন, তারপর বসান। দুই আঙুলে ছোট-বড় করুন, ঘোরান।', en: 'Point your camera at a table or the floor, then place it. Pinch to resize, twist to turn.' },
  scan: { bn: 'ফোনের ক্যামেরা দিয়ে স্ক্যান করুন, স্টুডিওটা আপনার টেবিলে বসিয়ে দেখুন।', en: 'Scan with your phone camera to put the studio on your table.' },
  works: { bn: 'Android (Chrome) আর iPhone / iPad (Safari)-তে চলে।', en: 'Works on Android (Chrome) and iPhone / iPad (Safari).' },
  noAr: { bn: 'এই ডিভাইসে AR চলছে না, তবে মডেলটা ঘুরিয়ে দেখতে পারেন।', en: "AR isn't available on this device, but you can turn the model around." },
  loading: { bn: 'মডেল লোড হচ্ছে…', en: 'Loading the model…' },
} satisfies Record<string, L>

/** Festival greetings shown in the room on the day (src/three/Festivals.tsx). */
export const FESTIVAL_TEXT = {
  boishakh: { bn: 'শুভ নববর্ষ', en: 'Shubho Noboborsho' },
  boishakhSub: { bn: 'বঙ্গাব্দ', en: 'Happy Bengali New Year' },
  eid: { bn: 'ঈদ মোবারক', en: 'Eid Mubarak' },
  eidSub: { bn: 'সবাইকে ঈদের শুভেচ্ছা', en: 'Warm Eid wishes to everyone' },
  ekushe: { bn: 'অমর একুশে', en: 'Amar Ekushe' },
  ekusheSub: { bn: '২১ ফেব্রুয়ারি · আন্তর্জাতিক মাতৃভাষা দিবস', en: '21 February · International Mother Language Day' },
  victory: { bn: 'মহান বিজয় দিবস', en: 'Victory Day' },
  victorySub: { bn: '১৬ ডিসেম্বর', en: '16 December' },
  independence: { bn: 'মহান স্বাধীনতা দিবস', en: 'Independence Day' },
  independenceSub: { bn: '২৬ মার্চ', en: '26 March' },
  newyear: { bn: 'হ্যাপি নিউ ইয়ার', en: 'Happy New Year' },
} satisfies Record<string, L>
/** Coin hunt: what a visitor gets for finding all five hidden CZ coins (confirmed by the team). */
export const COIN_REWARD: L = {
  bn: 'প্রথম প্রজেক্টের সাথে ১ মাস ফ্রি মেইনটেন্যান্স',
  en: '1 month of free maintenance with your first project',
}
/** Prefilled WhatsApp message for claiming the coin-hunt reward. */
export const COIN_CLAIM: L = {
  bn: 'আসসালামু আলাইকুম! আমি 3D স্টুডিওতে ৫টা কয়েনই খুঁজে পেয়েছি — প্রথম প্রজেক্টের সাথে আমার ১ মাস ফ্রি মেইনটেন্যান্স চাই।',
  en: "Hi! I found all 5 coins in the 3D studio — I'd like my 1 month of free maintenance with my first project.",
}
