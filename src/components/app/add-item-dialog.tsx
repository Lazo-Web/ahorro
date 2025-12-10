'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useAppContext } from './app-provider';
import { supermarkets } from '@/data/mock-data';
import { useToast } from '@/hooks/use-toast';


const formSchema = z.object({
  item: z.string().min(2, { message: 'Item name must be at least 2 characters.' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
  supermarket: z.string().min(1, { message: 'Please select a supermarket.' }),
});

export function AddItemDialog() {
  const [open, setOpen] = useState(false);
  const { addPurchase } = useAppContext();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item: '',
      price: 0,
      supermarket: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addPurchase(values);
    toast({
      title: 'Item Added',
      description: `${values.item} has been added to your pantry and purchase history.`,
    });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle />
          Scan Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Purchase</DialogTitle>
          <DialogDescription>
            Simulate scanning a new item. Enter the details below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="item"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Organic Milk" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (€)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g., 1.99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supermarket"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supermarket</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a supermarket" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {supermarkets.map((market) => (
                        <SelectItem key={market} value={market}>{market}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
                Add Item
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
