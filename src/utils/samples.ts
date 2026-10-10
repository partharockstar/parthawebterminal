import { SamplePreset } from '../types';

// Helper to convert SVG markup to Data URL
function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

const videoStreamSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
  <rect width="900" height="600" fill="#0f0f0f"/>
  <!-- Top Navigation -->
  <rect x="0" y="0" width="900" height="56" fill="#212121"/>
  <rect x="24" y="16" width="32" height="24" rx="4" fill="#ff0000"/>
  <polygon points="36,22 36,34 46,28" fill="#ffffff"/>
  <text x="64" y="33" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="16">StreamTube</text>
  <rect x="260" y="12" width="380" height="32" rx="16" fill="#121212" stroke="#303030" stroke-width="1"/>
  <text x="280" y="32" fill="#888888" font-family="sans-serif" font-size="13">Search videos...</text>
  <circle cx="850" cy="28" r="14" fill="#3ea6ff"/>

  <!-- Sponsored Top Banner (Target 1) -->
  <rect x="24" y="72" width="560" height="48" rx="8" fill="#ff4d4f" fill-opacity="0.18" stroke="#ff4d4f" stroke-width="1.5"/>
  <text x="40" y="101" fill="#ff7875" font-family="sans-serif" font-weight="bold" font-size="14">🔥 SPONSORED AD: Get 90% Off VPN Today! [Annoying Banner]</text>
  <rect x="490" y="82" width="76" height="28" rx="6" fill="#ff4d4f"/>
  <text x="502" y="100" fill="#ffffff" font-family="sans-serif" font-size="11" font-weight="bold">Install Now</text>

  <!-- Video Player -->
  <rect x="24" y="132" width="560" height="315" rx="10" fill="#1e1e1e"/>
  <polygon points="290,270 290,320 330,295" fill="#ffffff" fill-opacity="0.8"/>
  <text x="240" y="350" fill="#888888" font-family="sans-serif" font-size="13">Main Player Screen (16:9)</text>

  <!-- Video Details -->
  <text x="24" y="475" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="18">Mastering Modern Web Architecture in 2026</text>
  <circle cx="44" cy="515" r="18" fill="#555555"/>
  <text x="72" y="514" fill="#ffffff" font-family="sans-serif" font-weight="600" font-size="14">TechExplorers</text>
  <text x="72" y="530" fill="#aaaaaa" font-family="sans-serif" font-size="12">1.2M subscribers</text>
  
  <!-- Subscribe Button (Target 2) -->
  <rect x="480" y="500" width="104" height="36" rx="18" fill="#ffffff"/>
  <text x="504" y="523" fill="#000000" font-family="sans-serif" font-weight="bold" font-size="13">Subscribe</text>

  <!-- Right Sidebar: Ads & Recommendations (Target 3) -->
  <rect x="608" y="72" width="268" height="120" rx="8" fill="#282828" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="620" y="96" fill="#f59e0b" font-family="sans-serif" font-weight="bold" font-size="12">⚠️ SIDEBAR PROMO AD</text>
  <text x="620" y="118" fill="#e2e8f0" font-family="sans-serif" font-size="13">Buy Crypto Cloud Mining</text>
  <rect x="620" y="134" width="110" height="26" rx="4" fill="#f59e0b"/>
  <text x="635" y="151" fill="#000000" font-family="sans-serif" font-size="11" font-weight="bold">Claim Reward</text>

  <!-- Recommended Videos list -->
  <rect x="608" y="208" width="100" height="60" rx="6" fill="#282828"/>
  <text x="718" y="228" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="500">React 19 Deep Dive</text>
  <text x="718" y="246" fill="#888888" font-family="sans-serif" font-size="11">Coding Master • 450K</text>

  <rect x="608" y="280" width="100" height="60" rx="6" fill="#282828"/>
  <text x="718" y="300" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="500">TypeScript Pro Tips</text>
  <text x="718" y="318" fill="#888888" font-family="sans-serif" font-size="11">Frontend Guy • 80K</text>
</svg>`;

const ecommerceSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
  <rect width="900" height="600" fill="#f8fafc"/>
  <!-- Top Notice Bar (Target 1) -->
  <rect x="0" y="0" width="900" height="40" fill="#e11d48"/>
  <text x="310" y="25" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="13">🚨 FLASH SALE ENDS IN 02:44:19 — USE CODE SAVE20</text>
  <text x="870" y="25" fill="#ffffff" font-family="sans-serif" font-size="16">✕</text>

  <!-- Header -->
  <rect x="0" y="40" width="900" height="64" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
  <text x="40" y="80" fill="#0f172a" font-family="sans-serif" font-weight="800" font-size="22">LUXE STORE</text>
  <rect x="220" y="56" width="460" height="34" rx="6" fill="#f1f5f9"/>
  <text x="240" y="78" fill="#94a3b8" font-family="sans-serif" font-size="13">Search products, brands and styles...</text>
  <text x="740" y="78" fill="#0f172a" font-family="sans-serif" font-weight="600" font-size="14">Cart (2)</text>

  <!-- Product Box -->
  <rect x="40" y="128" width="420" height="420" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
  <rect x="80" y="168" width="340" height="300" rx="8" fill="#e2e8f0"/>
  <text x="180" y="325" fill="#64748b" font-family="sans-serif" font-size="16" font-weight="600">Product Image Preview</text>

  <!-- Product Info & Actions -->
  <text x="490" y="160" fill="#2563eb" font-family="sans-serif" font-weight="bold" font-size="13">PREMIUM NOISE CANCELLING</text>
  <text x="490" y="196" fill="#0f172a" font-family="sans-serif" font-weight="bold" font-size="26">Wireless Pro Headphones X9</text>
  
  <!-- Price Block (Target 2) -->
  <rect x="490" y="216" width="350" height="56" rx="8" fill="#f1f5f9"/>
  <text x="506" y="252" fill="#0f172a" font-family="sans-serif" font-weight="800" font-size="26">$299.99</text>
  <text x="616" y="250" fill="#94a3b8" font-family="sans-serif" font-size="16" text-decoration="line-through">$399.99</text>
  <rect x="710" y="230" width="80" height="28" rx="14" fill="#22c55e"/>
  <text x="726" y="249" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold">Save 25%</text>

  <!-- Action Buttons (Target 3) -->
  <rect x="490" y="300" width="180" height="48" rx="8" fill="#0f172a"/>
  <text x="540" y="330" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="14">Add to Cart</text>

  <rect x="686" y="300" width="180" height="48" rx="8" fill="#2563eb"/>
  <text x="742" y="330" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="14">Buy Now</text>

  <!-- Sticky Newsletter Banner (Target 4) -->
  <rect x="490" y="380" width="376" height="120" rx="10" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="510" y="412" fill="#92400e" font-family="sans-serif" font-weight="bold" font-size="14">🔔 Win 10% Extra on Your Email Signup</text>
  <rect x="510" y="430" width="240" height="36" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
  <text x="522" y="453" fill="#94a3b8" font-family="sans-serif" font-size="12">Enter your email address...</text>
  <rect x="760" y="430" width="90" height="36" rx="6" fill="#d97706"/>
  <text x="782" y="453" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="12">Submit</text>
</svg>`;

const newsPortalSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
  <rect width="900" height="600" fill="#ffffff"/>
  <!-- Top Bar -->
  <rect x="0" y="0" width="900" height="60" fill="#111827"/>
  <text x="40" y="38" fill="#ffffff" font-family="serif" font-weight="bold" font-size="24">The Global Chronicle</text>
  <text x="760" y="36" fill="#9ca3af" font-family="sans-serif" font-size="13">Sign In • Subscribe</text>

  <!-- Article Headline -->
  <text x="140" y="115" fill="#111827" font-family="serif" font-weight="bold" font-size="30">Global Summit Announces Breakthrough in Clean Energy</text>
  <text x="140" y="145" fill="#6b7280" font-family="sans-serif" font-size="13">By Sarah Jenkins • Published Oct 9, 2026 • 5 min read</text>

  <!-- Article Body text with blur -->
  <text x="140" y="185" fill="#374151" font-family="serif" font-size="16">Leaders from over 40 nations agreed on a landmark roadmap designed to accelerate clean energy transition...</text>
  <text x="140" y="215" fill="#374151" font-family="serif" font-size="16">Under the new provisions, countries will fund zero-emission microgrids and provide localized incentives...</text>
  
  <!-- Blurred out content -->
  <rect x="140" y="235" width="620" height="110" fill="#9ca3af" fill-opacity="0.25"/>
  <text x="280" y="295" fill="#6b7280" font-family="sans-serif" font-size="16" font-style="italic">Content blurred by paywall overlay...</text>

  <!-- Sticky Paywall Modal Overlay (Target 1 & 2) -->
  <rect x="100" y="330" width="700" height="220" rx="12" fill="#1f2937" filter="drop-shadow(0 15px 30px rgba(0,0,0,0.5))"/>
  <rect x="360" y="350" width="180" height="32" rx="16" fill="#ef4444" fill-opacity="0.2"/>
  <text x="382" y="371" fill="#f87171" font-family="sans-serif" font-weight="bold" font-size="12">PREMIUM SUBSCRIBER ONLY</text>
  
  <text x="210" y="415" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="22">You have reached your free article limit</text>
  <text x="250" y="445" fill="#9ca3af" font-family="sans-serif" font-size="14">Subscribe now for unlimited investigative journalism for only $1/week.</text>

  <rect x="320" y="475" width="260" height="46" rx="8" fill="#3b82f6"/>
  <text x="388" y="504" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="15">Unlock Full Article</text>
</svg>`;

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'video-cleaner',
    title: 'StreamTube (Video UI)',
    description: 'Hide top sponsored ad banner, remove sidebar promos, customize subscribe button.',
    category: 'Media & Streaming',
    imageUrl: svgToDataUrl(videoStreamSvg),
    matchUrl: '*://*.streamtube.com/*',
    scriptName: 'StreamTube Cleaner',
    prompt: 'Clean video view, hide ad banners, and style action buttons.',
    regions: [
      {
        id: 'reg-1',
        x: 2.6,
        y: 12,
        width: 62.5,
        height: 8.5,
        beforeLabel: 'Top Sponsored Ad Banner',
        afterInstruction: 'Hide this banner completely (display: none !important)',
        color: '#ef4444',
      },
      {
        id: 'reg-2',
        x: 67.5,
        y: 12,
        width: 30,
        height: 20,
        beforeLabel: 'Sidebar Promo Card',
        afterInstruction: 'Remove this promo card completely from recommendations',
        color: '#f59e0b',
      },
      {
        id: 'reg-3',
        x: 53.3,
        y: 83.3,
        width: 12,
        height: 6.5,
        beforeLabel: 'Subscribe Button',
        afterInstruction: 'Change text to "Following ✓" and apply golden background (#eab308)',
        color: '#10b981',
      },
    ],
  },
  {
    id: 'ecommerce-booster',
    title: 'Luxe Store (Product Page)',
    description: 'Hide urgency countdown bar, remove email popup, highlight buy button.',
    category: 'Shopping',
    imageUrl: svgToDataUrl(ecommerceSvg),
    matchUrl: '*://*.luxestore.com/*',
    scriptName: 'Luxe Store Enhancer',
    prompt: 'Clean up shopping experience and enhance purchase actions.',
    regions: [
      {
        id: 'reg-e1',
        x: 0,
        y: 0,
        width: 100,
        height: 7,
        beforeLabel: 'Top Flash Sale Countdown Bar',
        afterInstruction: 'Hide this urgency countdown bar completely',
        color: '#ef4444',
      },
      {
        id: 'reg-e2',
        x: 54.4,
        y: 63.3,
        width: 42,
        height: 20.5,
        beforeLabel: 'Sticky Newsletter Box',
        afterInstruction: 'Remove this email subscription banner',
        color: '#f59e0b',
      },
      {
        id: 'reg-e3',
        x: 76.2,
        y: 50,
        width: 20,
        height: 8.2,
        beforeLabel: 'Buy Now Button',
        afterInstruction: 'Add green glowing border and inject a "Quick Checkout" badge',
        color: '#3b82f6',
      },
    ],
  },
  {
    id: 'paywall-reader',
    title: 'Global Chronicle (News Page)',
    description: 'Remove paywall modal dialog, restore scroll, unblur article text.',
    category: 'Reading',
    imageUrl: svgToDataUrl(newsPortalSvg),
    matchUrl: '*://*.globalchronicle.com/*',
    scriptName: 'Reader Mode & Paywall Remover',
    prompt: 'Unlock paywalled articles and enhance typography.',
    regions: [
      {
        id: 'reg-p1',
        x: 11.1,
        y: 55,
        width: 77.8,
        height: 37,
        beforeLabel: 'Paywall Modal Dialog Overlay',
        afterInstruction: 'Remove this modal completely and unlock body scroll (overflow: auto !important)',
        color: '#ef4444',
      },
      {
        id: 'reg-p2',
        x: 15.5,
        y: 39,
        width: 69,
        height: 18.5,
        beforeLabel: 'Blurred Article Paragraphs',
        afterInstruction: 'Remove filter: blur() styling so text is crisp and readable',
        color: '#8b5cf6',
      },
    ],
  },
];
