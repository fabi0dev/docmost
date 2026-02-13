'use client';

import { useEffect, useState } from 'react';

/**
 * Retorna true quando a viewport atende à media query.
 * Usa 768px (Tailwind md) como breakpoint padrão para "mobile".
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/** True quando viewport < 768px (mobile). */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}
