'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppContext } from './app-provider';
import { Plus, Trash2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

export function ShoppingListTab() {
  const { shoppingList, addShoppingListItem, toggleShoppingListItem, removeShoppingListItem, clearCompletedItems } = useAppContext();
  const [newItemName, setNewItemName] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    addShoppingListItem(newItemName);
    setNewItemName('');
  };

  const pendingItems = shoppingList.filter(item => !item.isCompleted);
  const completedItems = shoppingList.filter(item => item.isCompleted);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mi Lista de la Compra</CardTitle>
        <CardDescription>Gestiona los artículos que necesitas comprar en tu próxima visita.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddItem} className="flex items-center gap-2 mb-6">
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Ej: Aceite de oliva"
            aria-label="Nuevo artículo para la lista de la compra"
          />
          <Button type="submit" size="icon" aria-label="Añadir artículo">
            <Plus className="h-4 w-4" />
          </Button>
        </form>

        <ScrollArea className="h-[50vh]">
          <div className="space-y-4">
             {pendingItems.length > 0 ? (
                <div className="space-y-2">
                  {pendingItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-md p-2 hover:bg-secondary/50 transition-colors">
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={item.isCompleted}
                        onCheckedChange={() => toggleShoppingListItem(item.id, item.isCompleted)}
                        aria-label={`Marcar ${item.name} como completado`}
                      />
                      <label
                        htmlFor={`item-${item.id}`}
                        className={cn("flex-1 text-sm font-medium leading-none cursor-pointer", 
                          item.isCompleted && "line-through text-muted-foreground"
                        )}
                      >
                        {item.name}
                      </label>
                       <Button variant="ghost" size="icon" onClick={() => removeShoppingListItem(item.id)}>
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                       </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center text-sm py-4">Tu lista de la compra está vacía.</p>
              )}

              {completedItems.length > 0 && (
                <div>
                  <Separator className="my-4" />
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Artículos Completados</h3>
                  <div className="space-y-2">
                    {completedItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 rounded-md p-2">
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={item.isCompleted}
                          onCheckedChange={() => toggleShoppingListItem(item.id, item.isCompleted)}
                          aria-label={`Marcar ${item.name} como no completado`}
                        />
                        <label
                          htmlFor={`item-${item.id}`}
                          className={cn("flex-1 text-sm font-medium leading-none cursor-pointer", 
                            item.isCompleted && "line-through text-muted-foreground"
                          )}
                        >
                          {item.name}
                        </label>
                        <Button variant="ghost" size="icon" onClick={() => removeShoppingListItem(item.id)}>
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {shoppingList.length === 0 && pendingItems.length === 0 && (
                 <div className="h-24 flex items-center justify-center">
                    <p className="text-muted-foreground text-center text-sm">Añade artículos a tu lista de la compra usando el campo de arriba.</p>
                 </div>
              )}
          </div>
        </ScrollArea>
      </CardContent>
      {completedItems.length > 0 && (
        <CardFooter>
          <Button variant="outline" onClick={clearCompletedItems} className="w-full">
            <Trash2 className="mr-2 h-4 w-4" /> Limpiar Artículos Completados
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
