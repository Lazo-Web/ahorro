'use client';

import { AppProvider } from '@/components/app/app-provider';
import { AppShell } from '@/components/app/app-shell';
import { useEffect, useState } from 'react';

export function ClientWrapper() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
