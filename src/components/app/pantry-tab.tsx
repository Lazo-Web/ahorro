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
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { format, differenceInDays, isBefore, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

export function PantryTab() {
  const { pantry, purchases, removeFromPantry } = useAppContext();
  const { toast } = useToast();

  const handleRemove = (itemId: string, itemName: string) => {
    removeFromPantry(itemId);
  };

  const getPurchaseDetails = (purchaseId: string) => {
    return purchases.find(p => p.id === purchaseId);
  }

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return { status: 'none', message: '' };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = parseISO(expiryDate);
    const daysUntilExpiry = differenceInDays(expiry, today);

    if (isBefore(expiry, today)) {
      return { status: 'expired', message: `Caducado hace ${Math.abs(daysUntilExpiry)} días` };
    }
    if (daysUntilExpiry <= 3) {
      return { status: 'expiring-soon', message: `Caduca en ${daysUntilExpiry + 1} día(s)` };
    }
    return { status: 'fresh', message: `Caduca el ${format(expiry, 'dd/MM/yyyy', { locale: es })}` };
  };

  const sortedPantry = [...pantry].sort((a, b) => {
    const aExpiry = a.expiryDate ? parseISO(a.expiryDate) : addDays(new Date(), 9999);
    const bExpiry = b.expiryDate ? parseISO(b.expiryDate) : addDays(new Date(), 9999);
    return differenceInDays(aExpiry, bExpiry);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mi Despensa</CardTitle>
        <CardDescription>Aquí están todos los artículos que tienes en stock, ordenados por fecha de caducidad.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh]">
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artículo</TableHead>
                  <TableHead>Supermercado</TableHead>
                  <TableHead>Fecha de Compra</TableHead>
                  <TableHead>Caducidad</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPantry.length > 0 ? (
                  sortedPantry.map((item) => {
                    const purchase = getPurchaseDetails(item.purchaseId);
                    const expiryInfo = getExpiryStatus(item.expiryDate);
                    return (
                      <TableRow key={item.id} className={expiryInfo.status === 'expiring-soon' ? 'bg-yellow-500/10' : expiryInfo.status === 'expired' ? 'bg-red-500/10' : ''}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          {purchase ? <Badge variant="secondary">{purchase.supermarket}</Badge> : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {purchase ? format(parseISO(purchase.date), 'dd/MM/yyyy', { locale: es }) : 'N/A'}
                        </TableCell>
                        <TableCell>
                           {expiryInfo.status !== 'none' ? (
                             <Tooltip>
                               <TooltipTrigger>
                                <span className='flex items-center gap-2'>
                                  {expiryInfo.status === 'expiring-soon' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                                  {expiryInfo.status === 'expired' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                                  {expiryInfo.message}
                                </span>
                               </TooltipTrigger>
                               <TooltipContent>
                                 <p>{expiryInfo.message}</p>
                               </TooltipContent>
                             </Tooltip>
                           ) : (
                             'N/A'
                           )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(item.id, item.name)}
                            aria-label={`Usar ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Tu despensa está vacía. Escanea artículos para añadirlos.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TooltipProvider>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
