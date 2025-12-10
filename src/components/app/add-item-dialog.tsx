'use client';

import { useState, useRef, useEffect } from 'react';
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
  FormDescription,
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
import { CalendarIcon, Loader2, PlusCircle, ScanLine } from 'lucide-react';
import { useAppContext } from './app-provider';
import { supermarkets } from '@/data/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const formSchema = z.object({
  barcode: z.string().nonempty({ message: 'El código de barras es requerido.' }),
  item: z.string().min(2, { message: 'El nombre del producto debe tener al menos 2 caracteres.' }),
  price: z.coerce.number().positive({ message: 'El precio debe ser un número positivo.' }),
  supermarket: z.string().min(1, { message: 'Por favor, selecciona un supermercado.' }),
  calories: z.coerce.number().int().min(0).optional(),
  expiryDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddItemDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'scan' | 'form'>('scan');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | undefined>(undefined);
  const [isScannerSupported, setIsScannerSupported] = useState<boolean | undefined>(undefined);
  const [detectedBarcode, setDetectedBarcode] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { addPurchase } = useAppContext();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      barcode: '',
      item: '',
      price: 0,
      supermarket: '',
      calories: '' as any,
      expiryDate: undefined,
    },
  });

  useEffect(() => {
    if ('BarcodeDetector' in window) {
      setIsScannerSupported(true);
    } else {
      setIsScannerSupported(false);
    }
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let barcodeDetector: any | null = null;

    const startScan = async () => {
      if (!open || step !== 'scan' || !videoRef.current || !isScannerSupported) return;

      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        
        barcodeDetector = new (window as any).BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] });

        scannerIntervalRef.current = setInterval(async () => {
          if (!videoRef.current || !barcodeDetector) return;
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const foundBarcode = barcodes[0].rawValue;
              setDetectedBarcode(foundBarcode);
              form.setValue('barcode', foundBarcode);
              setStep('form');
            }
          } catch (scanError) {
            // console.error("Scanning error:", scanError);
          }
        }, 500); // Scan every 500ms

      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };

    const stopScan = () => {
       if (scannerIntervalRef.current) {
        clearInterval(scannerIntervalRef.current);
        scannerIntervalRef.current = null;
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    
    if (open && step === 'scan') {
      startScan();
    } else {
      stopScan();
    }

    return () => {
      stopScan();
    }
  }, [open, step, isScannerSupported, form]);

  const handleManualEntry = () => {
    form.setValue('barcode', 'ENTRADA-MANUAL');
    setStep('form');
  };

  const onSubmit = (values: FormValues) => {
    const purchaseData = {
      ...values,
      date: new Date().toISOString().split('T')[0],
      expiryDate: values.expiryDate ? values.expiryDate.toISOString().split('T')[0] : undefined,
    };
    addPurchase(purchaseData);
    form.reset();
    setStep('scan');
    setOpen(false);
    setDetectedBarcode('');
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        form.reset();
        setStep('scan');
        setHasCameraPermission(undefined);
        setDetectedBarcode('');
      }, 300);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle />
          Escanear Artículo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {step === 'scan' ? (
          <>
            <DialogHeader>
              <DialogTitle>Escanear Código de Barras</DialogTitle>
              <DialogDescription>
                Apunta la cámara al código de barras de un producto para añadirlo.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
               <div className="w-full aspect-[4/3] bg-muted rounded-lg overflow-hidden relative flex items-center justify-center">
                 <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                 <div className="absolute inset-0 bg-black/20" />
                 <div className="absolute w-2/3 h-1/3 border-4 border-primary/50 rounded-lg" />
                  
                  {isScannerSupported === false && (
                    <Alert variant="destructive" className="absolute bottom-4 w-5/6">
                      <AlertTitle>Escáner no Soportado</AlertTitle>
                      <AlertDescription>
                        Tu navegador no es compatible con el escaneo de códigos de barras.
                      </AlertDescription>
                    </Alert>
                  )}

                 {hasCameraPermission === false && (
                   <Alert variant="destructive" className="absolute bottom-4 w-5/6">
                     <AlertTitle>Acceso a la Cámara Denegado</AlertTitle>
                     <AlertDescription>
                       Activa los permisos de la cámara para usar el escáner.
                     </AlertDescription>
                   </Alert>
                 )}
               </div>
              <Button onClick={handleManualEntry} className="w-full">
                <ScanLine className="mr-2"/>
                Introducir Manualmente
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Añadir Nueva Compra</DialogTitle>
              <DialogDescription>
                Introduce los detalles del producto. El código de barras se ha rellenado automáticamente.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-2 max-h-[70vh] overflow-y-auto px-1">
                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código de Barras</FormLabel>
                      <FormControl>
                        <Input placeholder="Código de barras escaneado" {...field} readOnly className="bg-muted/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="item"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Producto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Leche Entera" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio (€)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="Ej: 1.99" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="calories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calorías</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Ej: 150" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Caducidad</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: es })
                                ) : (
                                  <span>Elige una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              locale={es}
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0,0,0,0))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Opcional. Se usa para las alertas de caducidad.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <FormField
                  control={form.control}
                  name="supermarket"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supermercado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un supermercado" />
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
                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                    {form.formState.isSubmitting ? (
                       <Loader2 className="animate-spin" />
                    ) : "Añadir a la Despensa"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
