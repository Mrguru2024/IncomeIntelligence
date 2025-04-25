import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash, Send, Download, CreditCard, Clock, CheckCircle, File, Printer, Mail } from 'lucide-react';
import { format } from 'date-fns';

// Define the line item schema
const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be a positive number"),
  amount: z.number().min(0, "Amount must be a positive number"),
});

// Define the invoice schema
const createInvoiceSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Please enter a valid email").optional().nullable(),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  dueDate: z.date(),
  paymentMethod: z.string().min(1, "Payment method is required"),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  total: z.string(),
});

type CreateInvoiceFormValues = z.infer<typeof createInvoiceSchema>;

// Interface for Invoice type
interface Invoice {
  id: string;
  clientName: string;
  clientEmail: string | null;
  invoiceNumber: string;
  dueDate: string;
  paymentMethod: string;
  total: string;
  paid: boolean;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  createdAt: string;
  paidAt: string | null;
  stripePaymentIntent: string | null;
  invoicePdf: string | null;
}

// Interface for payment intent response
interface PaymentIntentResponse {
  clientSecret: string;
  invoiceId: string;
}

export default function InvoicesPage() {
  const { toast } = useToast();
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [lineItems, setLineItems] = useState<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[]>([{ description: '', quantity: 1, unitPrice: 0, amount: 0 }]);

  const form = useForm<CreateInvoiceFormValues>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      clientName: '',
      clientEmail: '',
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      paymentMethod: 'online',
      lineItems: [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }],
      total: '0',
    },
  });

  // Query to fetch all invoices
  const { data: invoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['/api/invoices'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/invoices');
      const data = await response.json();
      return data as Invoice[];
    },
  });

  // Mutation to create a new invoice
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: CreateInvoiceFormValues) => {
      const response = await apiRequest('POST', '/api/invoices', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({
        title: 'Invoice created',
        description: 'Your invoice has been created successfully.',
      });
      setIsCreatingInvoice(false);
      form.reset();
      setLineItems([{ description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create invoice: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation to delete an invoice
  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/invoices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({
        title: 'Invoice deleted',
        description: 'The invoice has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete invoice: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation to create a payment intent
  const createPaymentIntentMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await apiRequest('POST', `/api/invoices/${invoiceId}/payment-intent`);
      return response.json() as Promise<PaymentIntentResponse>;
    },
    onSuccess: (data) => {
      // Redirect to the payment page
      window.location.href = `/pay-invoice?client_secret=${data.clientSecret}&invoice_id=${data.invoiceId}`;
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create payment intent: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation to mark an invoice as paid
  const markPaidMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await apiRequest('POST', `/api/invoices/${invoiceId}/mark-paid`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({
        title: 'Invoice marked as paid',
        description: 'The invoice has been marked as paid successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to mark invoice as paid: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation to send an invoice via email
  const sendInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await apiRequest('POST', `/api/invoices/${invoiceId}/send`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Invoice sent',
        description: 'The invoice has been sent to the client via email.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to send invoice: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Function to add a line item
  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  // Function to remove a line item
  const removeLineItem = (index: number) => {
    const updatedLineItems = [...lineItems];
    updatedLineItems.splice(index, 1);
    setLineItems(updatedLineItems);
    
    // Calculate new total
    const newTotal = updatedLineItems.reduce((acc, item) => acc + item.amount, 0);
    form.setValue('total', newTotal.toString());
  };

  // Function to update line item and recalculate amount and total
  const updateLineItem = (index: number, field: keyof typeof lineItems[0], value: any) => {
    const updatedLineItems = [...lineItems];
    updatedLineItems[index] = {
      ...updatedLineItems[index],
      [field]: value,
    };

    // Recalculate amount if quantity or unitPrice changed
    if (field === 'quantity' || field === 'unitPrice') {
      updatedLineItems[index].amount = 
        updatedLineItems[index].quantity * updatedLineItems[index].unitPrice;
    }

    setLineItems(updatedLineItems);
    
    // Calculate new total
    const newTotal = updatedLineItems.reduce((acc, item) => acc + item.amount, 0);
    form.setValue('total', newTotal.toString());
    
    // Update form values
    form.setValue('lineItems', updatedLineItems);
  };

  // Function to handle form submission
  const onSubmit = (data: CreateInvoiceFormValues) => {
    // Set the correct line items and total
    data.lineItems = lineItems;
    data.total = lineItems.reduce((acc, item) => acc + item.amount, 0).toString();
    
    createInvoiceMutation.mutate(data);
  };

  // Function to handle payment process
  const handlePayment = (invoiceId: string) => {
    createPaymentIntentMutation.mutate(invoiceId);
  };

  // Function to download invoice PDF
  const downloadInvoice = (invoiceId: string) => {
    window.open(`/api/invoices/${invoiceId}/pdf`, '_blank');
  };

  // Function to send invoice via email
  const sendInvoice = (invoiceId: string) => {
    sendInvoiceMutation.mutate(invoiceId);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Dialog open={isCreatingInvoice} onOpenChange={setIsCreatingInvoice}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new invoice.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter client name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clientEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter client email" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="invoiceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="online">Online (Credit Card)</SelectItem>
                          <SelectItem value="mobile">Mobile Payment</SelectItem>
                          <SelectItem value="in_person">In Person</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Line Items</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <div className="grid grid-cols-12 gap-4 mb-2 font-medium">
                      <div className="col-span-5">Description</div>
                      <div className="col-span-2">Quantity</div>
                      <div className="col-span-2">Unit Price</div>
                      <div className="col-span-2">Amount</div>
                      <div className="col-span-1"></div>
                    </div>
                    
                    {lineItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-4 mb-4">
                        <div className="col-span-5">
                          <Input
                            value={item.description}
                            onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                            placeholder="Item description"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            readOnly
                            value={item.amount}
                          />
                        </div>
                        <div className="col-span-1">
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeLineItem(index)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-end mt-4">
                      <div className="w-1/3">
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>${lineItems.reduce((acc, item) => acc + item.amount, 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="submit" disabled={createInvoiceMutation.isPending}>
                    {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Invoiced</CardTitle>
            <CardDescription>Sum of all invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              $
              {isLoadingInvoices
                ? '...'
                : invoices
                  ? invoices.reduce((acc, invoice) => acc + parseFloat(invoice.total), 0).toFixed(2)
                  : '0.00'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
            <CardDescription>Unpaid invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              $
              {isLoadingInvoices
                ? '...'
                : invoices
                  ? invoices
                      .filter(invoice => !invoice.paid)
                      .reduce((acc, invoice) => acc + parseFloat(invoice.total), 0)
                      .toFixed(2)
                  : '0.00'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Received</CardTitle>
            <CardDescription>Paid invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              $
              {isLoadingInvoices
                ? '...'
                : invoices
                  ? invoices
                      .filter(invoice => invoice.paid)
                      .reduce((acc, invoice) => acc + parseFloat(invoice.total), 0)
                      .toFixed(2)
                  : '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-md shadow-sm border">
        <Table>
          <TableCaption>List of all your invoices</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingInvoices ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Loading invoices...</TableCell>
              </TableRow>
            ) : invoices && invoices.length > 0 ? (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.clientName}</TableCell>
                  <TableCell>${parseFloat(invoice.total).toFixed(2)}</TableCell>
                  <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {invoice.paid ? (
                      <Badge variant="success" className="bg-green-100 text-green-800">
                        Paid
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => downloadInvoice(invoice.id)}
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      {invoice.clientEmail && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => sendInvoice(invoice.id)}
                          title="Send via email"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {!invoice.paid && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePayment(invoice.id)}
                            title="Process payment"
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => markPaidMutation.mutate(invoice.id)}
                            title="Mark as paid"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this invoice?')) {
                            deleteInvoiceMutation.mutate(invoice.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Delete invoice"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No invoices found. Create your first invoice to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}