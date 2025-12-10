'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppHeader } from '@/components/app/header';
import { DashboardTab } from '@/components/app/dashboard-tab';
import { PantryTab } from '@/components/app/pantry-tab';
import { ShoppingListTab } from '@/components/app/shopping-list-tab';
import { Archive, LayoutDashboard, ShoppingCart } from 'lucide-react';

export function AppShell() {
  return (
      <div className="min-h-screen w-full bg-background">
        <AppHeader />
        <main className="p-4 md:p-6 lg:p-8">
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto mb-6">
                <TabsTrigger value="dashboard">
                  <LayoutDashboard className="mr-2" />
                  Panel
                </TabsTrigger>
                <TabsTrigger value="pantry">
                  <Archive className="mr-2" />
                  Despensa
                </TabsTrigger>
                <TabsTrigger value="shopping-list">
                  <ShoppingCart className="mr-2" />
                  Lista de Compra
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
  );
}
