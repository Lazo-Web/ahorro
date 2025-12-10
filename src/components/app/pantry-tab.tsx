'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

export function PantryTab() {
  const { pantry, purchases, removeFromPantry } = useAppContext();
  const { toast } = useToast();

  const handleRemove = (itemId: string, itemName: string) => {
    removeFromPantry(itemId);
    toast({
      title: 'Item Used',
      description: `${itemName} has been removed from your pantry.`,
    });
  };

  const getPurchaseDetails = (purchaseId: string) => {
    return purchases.find(p => p.id === purchaseId);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Pantry</CardTitle>
        <CardDescription>Here are all the items you currently have in stock.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Supermarket</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pantry.length > 0 ? (
                pantry.map((item) => {
                  const purchase = getPurchaseDetails(item.purchaseId);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        {purchase ? <Badge variant="secondary">{purchase.supermarket}</Badge> : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {purchase ? new Date(purchase.date).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(item.id, item.name)}
                          aria-label={`Use up ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Your pantry is empty. Scan items to add them.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
