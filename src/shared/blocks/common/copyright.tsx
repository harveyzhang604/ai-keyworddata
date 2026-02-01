'use client';

import { useEffect, useState } from 'react';

import { Brand as BrandType } from '@/shared/types/blocks/common';

export function Copyright({ brand }: { brand: BrandType }) {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'App';

  return (
    <div className={`text-muted-foreground text-sm`}>
      © {currentYear || 2024}{' '}
      <a
        href={brand?.url || appUrl}
        target={brand?.target || ''}
        className="text-primary hover:text-primary/80 cursor-pointer"
      >
        {brand?.title || appName}
      </a>
      , All rights reserved
    </div>
  );
}
