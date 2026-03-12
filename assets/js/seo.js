const SEO_CONFIG = {
  siteName: 'TopGirl ApexGirl',
  siteDescription: {
    en: 'TopGirl (ApexGirl) fansite - Complete database, guides, and tools. The ultimate resource for A3Games players worldwide.',
    fr: 'Fansite TopGirl (ApexGirl) - Base de données complète, guides et outils. La ressource ultime pour les joueurs de A3Games.',
    es: 'Fansite de TopGirl (ApexGirl) - Base de datos completa, guías y herramientas. El recurso definitivo para jugadores de A3Games.',
    de: 'TopGirl (ApexGirl) Fanseite - Komplette Datenbank, Guides und Tools. Die ultimative Ressource für A3Games-Spieler.',
    ja: 'TopGirl（ApexGirl）ファンサイト - データベース、ガイド、ツール。A3Gamesプレイヤーのための究極の資源。',
    ko: 'TopGirl (ApexGirl) 팬사이트 - 데이터베이스, 가이드, 도구. A3Games 플레이어를 위한 최고의 리소스.',
    zh: 'TopGirl（ApexGirl）粉丝网站 - 完整的数据库、指南和工具。A3Games玩家的终极资源。',
    pt: 'Fansite TopGirl (ApexGirl) - Banco de dados completo, guias e ferramentas. O recurso definitivo para jogadores de A3Games.',
    it: 'Fansite TopGirl (ApexGirl) - Database completa, guide e strumenti. La risorsa definitiva per i giocatori di A3Games.',
    ru: 'Фан-сайт TopGirl (ApexGirl) - Полная база данных, гайды и инструменты. Лучший ресурс для игроков A3Games.',
    ar: 'موقع المعجبين TopGirl (ApexGirl) - قاعدة بيانات كاملة وأدلة وأدوات. المورد النهائي لاعب A3Games.',
    id: 'Fansite TopGirl (ApexGirl) - Database lengkap, panduan, dan alat. Sumber utama untuk pemain A3Games di seluruh dunia.',
    pl: 'Fandom TopGirl (ApexGirl) - Kompletna baza danych, poradniki i narzędzia. Najlepsze źródło dla graczy A3Games na całym świecie.'
  },
  languages: {
    'en': 'English',
    'fr': 'Français',
    'es': 'Español',
    'de': 'Deutsch',
    'ja': '日本語',
    'ko': '한국어',
    'zh': '中文',
    'pt': 'Português',
    'it': 'Italiano',
    'ru': 'Русский',
    'ar': 'العربية',
    'id': 'Bahasa Indonesia',
    'pl': 'Polski'
  },
  alternateNames: {
    en: 'TopGirl',
    fr: 'TopGirl',
    es: 'TopGirl',
    de: 'TopGirl',
    ja: 'トップガール',
    ko: '탑걸',
    zh: 'TopGirl',
    pt: 'TopGirl',
    it: 'TopGirl',
    ru: 'ТопГёрл',
    ar: 'توبغيرل',
    id: 'TopGirl',
    pl: 'TopGirl'
  },
  social: {
    twitter: '@topgirlgame',
    facebook: 'topgirlgame'
  }
};

function generateHreflang(currentLang, baseUrl) {
  let html = '';
  
  for (const [lang, name] of Object.entries(SEO_CONFIG.languages)) {
    const url = lang === currentLang 
      ? baseUrl 
      : `${baseUrl}/${lang}/`;
    
    html += `<link rel="alternate" hreflang="${lang}" href="${url}">\n`;
    html += `<link rel="alternate" hreflang="x-default" href="${baseUrl}/en/">\n`;
  }
  
  return html;
}

function generateMetaTags(page, currentLang, baseUrl) {
  const title = page.title[currentLang] || page.title['en'];
  const description = page.description[currentLang] || page.description['en'];
  const canonical = `${baseUrl}/${currentLang === 'en' ? '' : currentLang + '/'}${page.path}`;
  
  return {
    title: `${title} | ${SEO_CONFIG.siteName}`,
    description,
    canonical,
    ogTitle: title,
    ogDescription: description,
    ogUrl: canonical,
    ogImage: `${baseUrl}/assets/images/og-image-${currentLang}.jpg`,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: `${baseUrl}/assets/images/og-image-${currentLang}.jpg`,
    keywords: page.keywords?.join(', ') || 'TopGirl, ApexGirl, A3Games, guides, database, tips'
  };
}

function generateJsonLd(page, currentLang, baseUrl) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "name": SEO_CONFIG.siteName,
        "url": baseUrl,
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${baseUrl}/${currentLang}/database/?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "name": SEO_CONFIG.siteName,
        "url": baseUrl,
        "logo": `${baseUrl}/assets/images/logo.png`,
        "sameAs": [
          `https://twitter.com/${SEO_CONFIG.social.twitter}`,
          `https://facebook.com/${SEO_CONFIG.social.facebook}`
        ]
      },
      {
        "@type": "VideoGame",
        "name": "TopGirl",
        "alternateName": ["ApexGirl"],
        "description": SEO_CONFIG.siteDescription[currentLang],
        "genre": ["Simulation", "Card Game", "Strategy"],
        "publisher": {
          "@type": "Organization",
          "name": "A3Games"
        },
        "applicationCategory": "Game"
      }
    ]
  };

  if (page.type === 'article') {
    structuredData['@graph'].push({
      "@type": "Article",
      "headline": page.title[currentLang],
      "description": page.description[currentLang],
      "author": {
        "@type": "Organization",
        "name": SEO_CONFIG.siteName
      },
      "publisher": {
        "@type": "Organization",
        "name": SEO_CONFIG.siteName,
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/assets/images/logo.png`
        }
      },
      "datePublished": page.date || "2026-03-12",
      "dateModified": page.modifiedDate || "2026-03-12"
    });
  }

  if (page.type === 'faq') {
    structuredData['@graph'].push({
      "@type": "FAQPage",
      "mainEntity": page.faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question[currentLang],
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer[currentLang]
        }
      }))
    });
  }

  return JSON.stringify(structuredData, null, 2);
}

function generateSitemap(pages, baseUrl) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  const today = new Date().toISOString().split('T')[0];
  
  for (const page of pages) {
    for (const lang of Object.keys(SEO_CONFIG.languages)) {
      const url = lang === 'en' 
        ? `${baseUrl}${page.path}` 
        : `${baseUrl}/${lang}${page.path}`;
      
      xml += '  <url>\n';
      xml += `    <loc>${url}</loc>\n`;
      xml += `    <lastmod>${page.lastmod || today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq || 'weekly'}</changefreq>\n`;
      xml += `    <priority>${page.priority || '0.8'}</priority>\n`;
      
      for (const altLang of Object.keys(SEO_CONFIG.languages)) {
        const altUrl = altLang === 'en' 
          ? `${baseUrl}${page.path}` 
          : `${baseUrl}/${altLang}${page.path}`;
        xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altUrl}"/>\n`;
      }
      
      xml += '  </url>\n';
    }
  }
  
  xml += '</urlset>';
  return xml;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SEO_CONFIG, generateHreflang, generateMetaTags, generateJsonLd, generateSitemap };
}
