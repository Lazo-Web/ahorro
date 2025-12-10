'use client';

import { useEffect } from 'react';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppHeader } from '@/components/app/header';
import { DashboardTab } from '@/components/app/dashboard-tab';
import { PantryTab } from '@/components/app/pantry-tab';
import { ShoppingListTab } from '@/components/app/shopping-list-tab';
import { Archive, LayoutDashboard, Loader2, ShoppingCart } from 'lucide-react';
import { AppProvider } from './app-provider';

export function AppShell() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Conectando con la despensa...</p>
        </div>
      </div>
    );
  }

  return (
    <AppProvider>
      <div className="min-h-screen w-full bg-background">
        <AppHeader />
        <main className="p-4 md:p-6 lg:p-8">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto mb-6">
              <TabsTrigger value="dashboard">
                <LayoutDashboard className="mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="pantry">
                <Archive className="mr-2" />
                Pantry
              </TabsTrigger>
              <TabsTrigger value="shopping-list">
                <ShoppingCart className="mr-2" />
                Shopping List
              </TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard">
              <DashboardTab />
            </TabsContent>
            <TabsContent value="pantry">
              <PantryTab />
            </TabsContent>
            <TabsContent value="shopping-list">
              <ShoppingListTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AppProvider>
  );
}
