'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useAppContext } from './app-provider';
import { Archive, BrainCircuit, DollarSign, Lightbulb, List, Loader2, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { getSpendingPrediction } from '@/app/actions';
import type { PredictMonthlySpendingOutput } from '@/ai/flows/predict-monthly-spending';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

export function DashboardTab() {
  const { purchases, pantry, shoppingList } = useAppContext();
  const [prediction, setPrediction] = useState<PredictMonthlySpendingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const totalSpent = purchases.reduce((sum, p) => sum + p.price, 0);
  const dashboardHeroImage = PlaceHolderImages.find(img => img.id === 'dashboard-hero');

  const handlePrediction = async () => {
    setIsLoading(true);
    setPrediction(null);
    const result = await getSpendingPrediction({ purchaseHistory: purchases });
    if (result.success && result.data) {
      setPrediction(result.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Prediction Failed',
        description: result.error || 'An unknown error occurred.',
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {dashboardHeroImage && (
        <Card className="overflow-hidden">
          <div className="relative h-48 w-full md:h-64">
            <Image
              src={dashboardHeroImage.imageUrl}
              alt={dashboardHeroImage.description}
              fill
              className="object-cover"
              data-ai-hint={dashboardHeroImage.imageHint}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <h2 className="text-2xl font-bold text-white md:text-3xl font-headline">Welcome to Your Smart Pantry</h2>
              <p className="mt-2 text-primary-foreground/80 max-w-xl">
                Scan items, manage your pantry, and let AI help you save money on your next grocery run.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">in {purchases.length} transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items in Pantry</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pantry.length}</div>
            <p className="text-xs text-muted-foreground">items currently in stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shopping List</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shoppingList.filter(i => !i.isCompleted).length}</div>
            <p className="text-xs text-muted-foreground">items to buy</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Budget Helper</CardTitle>
            <BrainCircuit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button size="sm" className="w-full" onClick={handlePrediction} disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin"/> : <><Lightbulb className="mr-2 h-4 w-4"/> Predict Now</>}
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">Analyze your spending habits</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>AI Spending Analysis</CardTitle>
            <CardDescription>
              Let our AI predict your monthly spending and give you savings tips.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary"/>
                <p className="text-muted-foreground">Analyzing your purchase history...</p>
              </div>
            ) : prediction ? (
              <div className="space-y-4 text-center">
                <CardTitle className="text-base font-medium">Predicted Monthly Spending</CardTitle>
                <p className="text-4xl font-bold text-primary">€{prediction.predictedSpending.toFixed(2)}</p>
                <Card className="bg-secondary text-left">
                  <CardHeader className="flex-row items-center gap-2 space-y-0">
                    <Lightbulb className="text-accent-foreground h-5 w-5 bg-accent p-0.5 rounded-full" />
                    <CardTitle className="text-base">Savings Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-secondary-foreground">{prediction.savingsOpportunities}</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center text-muted-foreground space-y-2">
                <BrainCircuit className="mx-auto h-12 w-12" />
                <p>Click "Predict Now" to get your personalized budget insights.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Recent Purchases</CardTitle>
            <CardDescription>A log of your recently scanned items.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-grow">
            <ScrollArea className="h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Supermarket</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.length > 0 ? (
                    purchases.slice(0, 10).map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-medium">{purchase.item}</TableCell>
                        <TableCell><Badge variant="secondary">{purchase.supermarket}</Badge></TableCell>
                        <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">€{purchase.price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No purchases yet. Start by scanning an item.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
