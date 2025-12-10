'use client';

import { ScanLine } from 'lucide-react';
import { AddItemDialog } from './add-item-dialog';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <ScanLine className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl font-headline">
            ScanShop Saver
          </h1>
        </div>
        <AddItemDialog />
      </div>
    </header>
  );
}
