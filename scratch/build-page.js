const fs = require('fs');
const path = require('path');

const legacyDir = path.join(__dirname, '..', '_legacy_php');

const headerFile = fs.readFileSync(path.join(legacyDir, 'includes', 'header.php'), 'utf-8');
const indexFile = fs.readFileSync(path.join(legacyDir, 'index.php'), 'utf-8');
const modalsFile = fs.readFileSync(path.join(legacyDir, 'includes', 'modals.php'), 'utf-8');
const footerFile = fs.readFileSync(path.join(legacyDir, 'includes', 'footer.php'), 'utf-8');

// 1. Extract from header: from '<div class="app-container">' to '</header>'
const headerStartIndex = headerFile.indexOf('<div class="app-container">');
const headerEndIndex = headerFile.indexOf('</header>') + '</header>'.length;
const headerPart = headerFile.substring(headerStartIndex, headerEndIndex);

// 2. Extract from index: from '<!-- 1. LANDING BIO / HUB VIEW' to the end of storeView
const indexStartIndex = indexFile.indexOf('<!-- 1. LANDING BIO / HUB VIEW');
const indexEndIndex = indexFile.indexOf('<?php\n// Include Modals');
const indexPart = indexFile.substring(
  indexStartIndex !== -1 ? indexStartIndex : indexFile.indexOf('<div class="bio-hub-view"'),
  indexEndIndex !== -1 ? indexEndIndex : indexFile.length
);

// 3. Modals part is all of modalsFile
const modalsPart = modalsFile;

// 4. Extract from footer: from '<!-- Floating Cart Bar -->' to '<div class="toast-wrap" id="toastWrap"></div>'
const footerStartIndex = footerFile.indexOf('<!-- Floating Cart Bar -->');
const footerEndIndex = footerFile.indexOf('<div class="toast-wrap" id="toastWrap"></div>') + '<div class="toast-wrap" id="toastWrap"></div>'.length;
const footerPart = footerFile.substring(footerStartIndex, footerEndIndex);

let combined = headerPart + '\n' + indexPart + '\n' + modalsPart + '\n' + footerPart;

// Add Mobile Admin Dashboard banner inside adminPricingSheet
const adminSheetTarget = '<div class="sheet-body" style="padding-bottom:90px">';
const adminDashboardBanner = `<div class="sheet-body" style="padding-bottom:90px">
            <!-- Mobile Admin Dashboard Banner Link -->
            <div style="background:linear-gradient(135deg, #FCE7F3, #FDF2F4);border:1.5px solid var(--brand-primary);border-radius:var(--radius-md);padding:12px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between">
                <div>
                    <strong style="color:var(--brand-primary-dark);font-size:13px;display:block">📦 Dashboard Daftar Pesanan Mobile</strong>
                    <span style="font-size:11px;color:var(--text-muted)">Update status #80537 & upload foto bukti (Vercel Blob)</span>
                </div>
                <a href="/admin" class="btn btn-primary" style="text-decoration:none;font-size:12px;font-weight:800;padding:8px 14px;border-radius:12px;white-space:nowrap">
                    Buka Dashboard
                </a>
            </div>`;
combined = combined.replace(adminSheetTarget, adminDashboardBanner);

// Route gear button to /admin
combined = combined.replace(
  '<button type="button" class="open-admin-trigger-link" id="openAdminPricingBtn" title="Kelola Fee &amp; Harga" aria-label="Kelola Fee &amp; Harga" style="background:transparent;border:none;color:var(--text-muted);font-size:14px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:4px;opacity:0.6;transition:var(--transition)">\n                        <span>⚙️</span>\n                    </button>',
  '<a href="/admin" class="open-admin-trigger-link" id="openAdminPricingBtn" title="Halaman Admin" aria-label="Halaman Admin" style="background:transparent;border:none;color:var(--text-muted);font-size:14px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:4px;opacity:0.6;transition:var(--transition);text-decoration:none">\n                        <span>⚙️</span>\n                    </a>'
);

// 1. Replace header logo with brand-badge-img (keeping only branch A, completely eliminating branch B)
combined = combined.replace(
  /<\?php\s*if\s*\(!empty\(\$logoImg\)\):[\s\S]*?<\?php\s*else:[\s\S]*?<\?php\s*endif;\s*\?>/i,
  '<img src="/assets/img/logo/kyuti.jpeg" alt="Kedai Kyuti" class="brand-badge-img">'
);

// 2. Replace bio card avatar with bio-avatar-img (keeping only branch A, completely eliminating branch B)
combined = combined.replace(
  /<\?php\s*if\s*\(!empty\(\$logoImg\)\):[\s\S]*?<\?php\s*else:[\s\S]*?<\?php\s*endif;\s*\?>/i,
  '<img src="/assets/img/logo/kyuti.jpeg" alt="Kedai Kyuti" class="bio-avatar-img">'
);

// Replacements for PHP tags
const replacements = [
  [/<\?=\s*htmlspecialchars\(\$storeName[^)]*\)\s*\?>/g, 'Kedai Kyuti'],
  [/<\?=\s*htmlspecialchars\(\$storeTitle\)\s*\?>/g, 'Kedai Kyuti'],
  [/<\?=\s*htmlspecialchars\(\$domainName\)\s*\?>/g, 'kedaikyuti.my.id'],
  [/<\?=\s*htmlspecialchars\(\$tagline\)\s*\?>/g, 'JASDOR KOPI KENANGAN'],
  [/<\?=\s*htmlspecialchars\(\$logoImg\s*\?:[^)]+\)\s*\?>/g, '/assets/img/logo/kyuti.jpeg'],
  [/<\?=\s*htmlspecialchars\(\$logoImg\)\s*\?>/g, '/assets/img/logo/kyuti.jpeg'],
  [/<\?=\s*htmlspecialchars\(\$logoText\)\s*\?>/g, '୨୧'],
  [/<\?=\s*htmlspecialchars\(config\('store\.bio_title'[^)]*\)\)\s*\?>/g, '୨୧ Kedai Kyuti ୨୧'],
  [/<\?=\s*htmlspecialchars\(config\('store\.bio_badge'[^)]*\)\)\s*\?>/g, '🌸 JASDOR KOPI KENANGAN 🌸'],
  [/<\?=\s*htmlspecialchars\(config\('store\.bio_quote'[^)]*\)\)\s*\?>/g, '♡ your little corner for daily food & beverage deals.'],
  [/<\?=\s*htmlspecialchars\(config\('store\.bio_desc'[^)]*\)\)\s*\?>/g, 'fast response, friendly prices, and service made with love ♡'],
  [/<\?=\s*htmlspecialchars\(\$socialLinks\['wa'\][^)]*\)\s*\?>/g, 'https://wa.me/628972276154'],
  [/<\?=\s*htmlspecialchars\(\$socialLinks\['tele_testi'\][^)]*\)\s*\?>/g, 'https://t.me/kedaikyuti'],
  [/<\?=\s*htmlspecialchars\(\$socialLinks\['x_twitter'\][^)]*\)\s*\?>/g, 'https://x.com/lolaloliyo?s=11'],
  [/<\?=\s*htmlspecialchars\(\$socialLinks\['wa_channel'\][^)]*\)\s*\?>/g, 'https://whatsapp.com/channel/0029VbDgR1s6BIEb4d0JWl26'],
  [/<\?=\s*htmlspecialchars\(config\('store\.social_links\.wa'[^)]*\)\)\s*\?>/g, 'https://wa.me/628972276154'],
  [/<\?=\s*htmlspecialchars\(config\('store\.social_links\.tele_testi'[^)]*\)\)\s*\?>/g, 'https://t.me/kedaikyuti'],
  [/<\?=\s*htmlspecialchars\(config\('store\.social_links\.x_twitter'[^)]*\)\)\s*\?>/g, 'https://x.com/lolaloliyo?s=11'],
  [/<\?=\s*htmlspecialchars\(config\('store\.social_links\.wa_channel'[^)]*\)\)\s*\?>/g, 'https://whatsapp.com/channel/0029VbDgR1s6BIEb4d0JWl26'],
  [/<\?=\s*htmlspecialchars\(config\('store\.name'[^)]*\)\)\s*\?>/g, 'Kedai Kyuti'],
  [/<\?=\s*htmlspecialchars\(\$modalLogoImg\)\s*\?>/g, '/assets/img/logo/kyuti.jpeg'],
  [/<\?=\s*date\('Y'\)\s*\?>/g, '2026'],
  [/<\?=\s*date\('j'\)\s*\?>/g, String(new Date().getDate())],
  [/<\?=\s*strtoupper\(htmlspecialchars\(\$storeTitle\)\)\s*\?>/g, 'KEDAI KYUTI'],
  [/<\?=\s*\$webHoursState\['isOpen'\]\s*\?\s*['"]whb-open['"]\s*:\s*['"]whb-closed['"]\s*\?>/g, 'whb-open'],
  [/<\?=\s*htmlspecialchars\(\$webHoursState\['statusText'\]\)\s*\?>/g, 'Pemesanan Buka (09:00 - 12:00 WIB)'],
  [/<\?=\s*\$webHoursState\['isOpen'\][\s\S]*?WIB'\)\s*\?>/g, 'Terima pesanan sekarang via WhatsApp ♡'],
  [/<\?=\s*htmlspecialchars\(\$initialWifi\['date'\][\s\S]*?\?>/g, 'Hari Ini'],
  [/<\?=\s*htmlspecialchars\(\$initialWifi\['wifi'\]\['ssid'\][^)]*\)\s*\?>/g, 'Teman Kenangan'],
  [/<\?=\s*htmlspecialchars\(\$initialWifi\['wifi'\]\['password'\][\s\S]*?\?>/g, `KopiBikinSemangat@${new Date().getDate()}`],
  [/<\?=\s*htmlspecialchars\(\$initialOutlet\['name'\][^)]*\)\s*\?>/g, 'Kopi Kenangan Codefin Kemang'],
  [/<\?=\s*htmlspecialchars\(\$initialOutlet\['statusText'\][^)]*\)\s*\?>/g, 'Buka'],
  [/<\?=\s*htmlspecialchars\(\$initialOutlet\['hours'\][^)]*\)\s*\?>/g, 'Buka Setiap Hari'],
  [/<\?=\s*\(!empty\(\$initialOutlet\['canOrder'\]\) \? 'pill-open' : 'pill-closed'\)\s*\?>/g, 'pill-open'],
  [/<\?=\s*!empty\(\$initialOutlet\['isPremium'\]\)\s*\?\s*''\s*:\s*'display:none;'\s*\?>/g, 'display:none;'],
  [/<\?php[\s\S]*?\?>/g, ''],
];

for (const [pattern, replacement] of replacements) {
  combined = combined.replace(pattern, replacement);
}

fs.writeFileSync(path.join(__dirname, 'page-template.html'), combined, 'utf-8');
console.log('Successfully written page-template.html, length:', combined.length);
