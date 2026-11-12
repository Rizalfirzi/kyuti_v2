'use client';

import React, { useEffect, useRef } from 'react';

interface Props {
  html: string;
  initialData: any;
}

export default function LegacyHtmlContainer({ html, initialData }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Set global initial data
    if (typeof window !== 'undefined') {
      (window as any).INITIAL_DATA = initialData;
    }

    // 2. Load YouTube API if not present
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const ytScript = document.createElement('script');
      ytScript.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(ytScript);
    }

    // 3. Mount and execute app.js cleanly
    const loadAppScript = () => {
      const existing = document.getElementById('kyuti-native-engine');
      if (existing) {
        existing.remove();
      }

      const script = document.createElement('script');
      script.id = 'kyuti-native-engine';
      script.src = `/assets/js/app.js?t=${Date.now()}`;
      script.async = false;
      document.body.appendChild(script);
    };

    loadAppScript();

    // 4. Handle pageshow (browser back/forward cache)
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [initialData]);

  return (
    <div
      ref={containerRef}
      style={{ display: 'contents' }}
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
    />
  );
}

