import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Save, Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  createEmptyQuote, 
  calculateQuoteTotals, 
  QuoteData,
  LineItem,
  QuoteTier
} from "./quoteUtils";

// Define the form schema using Zod
const lineItemSchema = z.object({
  description: z.string().min(1, { message: "Description is required" }),
  quantity: z.number().min(0.01, { message: "Quantity must be greater than 0" }),
  unitPrice: z.number().min(0.01, { message: "Unit price must be greater than 0" }),
  total: z.number(),
  category: z.string(),
});

const quoteFormSchema = z.object({
  clientName: z.string().min(1, { message: "Client name is required" }),
  clientEmail: z.string().email().min(1, { message: "Valid email is required" }),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  industry: z.string().min(1, { message: "Industry is required" }),
  serviceType: z.string().min(1, { message: "Service type is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  experienceYears: z.number().min(0),
  profitMargin: z.number().min(0.1).max(0.9),
  lineItems: z.array(lineItemSchema).min(1, { message: "At least one line item is required" }),
  notes: z.string().optional(),
  selectedTier: z.enum(["basic", "standard", "premium"]).optional(),
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

const industries = [
  { value: "automotive", label: "Automotive" },
  { value: "beauty", label: "Beauty" },
  { value: "cleaning", label: "Cleaning" },
  { value: "construction", label: "Construction" },
  { value: "electrical", label: "Electrical" },
  { value: "electronics", label: "Electronics Repair" },
  { value: "flooring", label: "Flooring" },
  { value: "graphicDesign", label: "Graphic Design" },
  { value: "hvac", label: "HVAC" },
  { value: "landscaping", label: "Landscaping" },
  { value: "locksmith", label: "Locksmith" },
  { value: "painting", label: "Painting" },
  { value: "plumbing", label: "Plumbing" },
  { value: "roofing", label: "Roofing" },
  { value: "security", label: "Security" },
];

interface QuoteFormProps {
  quoteId?: string;
  onQuoteCreated?: (quoteId: string) => void;
}

export default function QuoteForm({ quoteId, onQuoteCreated }: QuoteFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("details");
  
  // Create a query to fetch quote data if quoteId is provided
  const { data: quoteData, isLoading: isLoadingQuote } = useQuery({
    queryKey: ["/api/quotes", quoteId],
    queryFn: async () => {
      if (!quoteId) return createEmptyQuote(user?.id || "");
      const res = await apiRequest("GET", `/api/quotes/${quoteId}`);
      return await res.json();
    },
    enabled: !!user && (!!quoteId || true),
  });

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      clientAddress: "",
      industry: "automotive",
      serviceType: "",
      description: "",
      experienceYears: 5,
      profitMargin: 0.35,
      lineItems: [],
      notes: "",
      selectedTier: "standard",
    },
  });

  // When quoteData is loaded, update the form
  useEffect(() => {
    if (quoteData) {
      form.reset({
        clientName: quoteData.clientName,
        clientEmail: quoteData.clientEmail,
        clientPhone: quoteData.clientPhone || "",
        clientAddress: quoteData.clientAddress || "",
        industry: quoteData.industry,
        serviceType: quoteData.serviceType,
        description: quoteData.description,
        experienceYears: quoteData.experienceYears,
        profitMargin: quoteData.profitMargin,
        lineItems: quoteData.lineItems,
        notes: quoteData.notes || "",
        selectedTier: quoteData.selectedTier || "standard",
      });
    }
  }, [quoteData, form]);

  // Save quote mutation
  const saveQuoteMutation = useMutation({
    mutationFn: async (quote: QuoteData) => {
      const method = quote.id ? "PUT" : "POST";
      const url = quote.id ? `/api/quotes/${quote.id}` : "/api/quotes";
      const res = await apiRequest(method, url, quote);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Quote saved",
        description: "Your quote has been saved successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      
      if (onQuoteCreated && data.id) {
        onQuoteCreated(data.id);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving quote",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send quote mutation
  const sendQuoteMutation = useMutation({
    mutationFn: async (quote: QuoteData) => {
      const res = await apiRequest("POST", `/api/quotes/${quote.id}/send`, {});
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Quote sent",
        description: "Your quote has been sent to the client.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error sending quote",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addLineItem = () => {
    const currentItems = form.getValues("lineItems") || [];
    form.setValue("lineItems", [
      ...currentItems,
      { description: "", quantity: 1, unitPrice: 0, total: 0, category: "materials" }
    ]);
  };

  const removeLineItem = (index: number) => {
    const currentItems = form.getValues("lineItems");
    form.setValue("lineItems", currentItems.filter((_, i) => i !== index));
  };

  const updateLineItemTotal = (index: number) => {
    const items = form.getValues("lineItems");
    const item = items[index];
    const total = item.quantity * item.unitPrice;
    form.setValue(`lineItems.${index}.total`, total);
  };

  const calculateTotals = (data: QuoteFormValues): QuoteData => {
    // Create a quote object from form data
    const quote: QuoteData = {
      id: quoteId,
      userId: user?.id || "",
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      clientAddress: data.clientAddress,
      industry: data.industry,
      serviceType: data.serviceType,
      description: data.description,
      experienceYears: data.experienceYears,
      profitMargin: data.profitMargin,
      createdAt: quoteData?.createdAt || new Date(),
      expiresAt: quoteData?.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: quoteData?.status || "draft",
      lineItems: data.lineItems,
      subtotal: 0,
      tax: 0,
      total: 0,
      notes: data.notes,
      tieredPricing: { basic: 0, standard: 0, premium: 0 },
      selectedTier: data.selectedTier,
    };
    
    // Calculate the totals
    return calculateQuoteTotals(quote);
  };

  const onSubmit = (data: QuoteFormValues) => {
    // Calculate totals and save the quote
    const quoteWithTotals = calculateTotals(data);
    saveQuoteMutation.mutate(quoteWithTotals);
  };

  const handleSendQuote = () => {
    if (!quoteId) {
      toast({
        title: "Unable to send quote",
        description: "Please save the quote before sending.",
        variant: "destructive",
      });
      return;
    }
    
    const data = form.getValues();
    const quoteWithTotals = calculateTotals(data);
    
    // First save, then send
    saveQuoteMutation.mutate(quoteWithTotals, {
      onSuccess: (savedQuote) => {
        sendQuoteMutation.mutate(savedQuote);
      }
    });
  };

  if (isLoadingQuote) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Professional Quote</CardTitle>
        <CardDescription>
          Generate detailed quotes with multiple pricing tiers for your clients
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="details">Client Details</TabsTrigger>
            <TabsTrigger value="services">Service Details</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <Input placeholder="client@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="clientPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="clientAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St, City, State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button type="button" onClick={() => setActiveTab("services")}>
                    Next: Service Details
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="services">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {industries.map((industry) => (
                              <SelectItem key={industry.value} value={industry.value}>
                                {industry.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="serviceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Oil Change, Haircut, Home Repair" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="experienceYears"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          This affects your pricing recommendations
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="profitMargin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Profit Margin (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="10"
                            max="90"
                            step="1"
                            {...field}
                            value={field.value * 100}
                            onChange={(e) => field.onChange(parseInt(e.target.value) / 100 || 0.35)}
                          />
                        </FormControl>
                        <FormDescription>
                          Industry recommended: {Math.round(quoteData?.profitMargin * 100 || 35)}%
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Service Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the service to be provided"
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("details")}>
                    Previous: Client Details
                  </Button>
                  <Button type="button" onClick={() => setActiveTab("pricing")}>
                    Next: Pricing
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="pricing">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Line Items</h3>
                      <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                    
                    {form.getValues("lineItems")?.length === 0 && (
                      <div className="text-center p-6 border border-dashed rounded-md bg-muted">
                        <p className="text-sm text-muted-foreground">
                          No line items yet. Click "Add Item" to add materials, labor, or other costs.
                        </p>
                      </div>
                    )}
                    
                    {form.getValues("lineItems")?.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end mb-3">
                        <div className="col-span-5">
                          <FormField
                            control={form.control}
                            name={`lineItems.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                                  Description
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="Item description" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name={`lineItems.${index}.category`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                                  Category
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="materials">Materials</SelectItem>
                                    <SelectItem value="labor">Labor</SelectItem>
                                    <SelectItem value="equipment">Equipment</SelectItem>
                                    <SelectItem value="subcontractor">Subcontractor</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="col-span-1">
                          <FormField
                            control={form.control}
                            name={`lineItems.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                                  Qty
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    step="1"
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(parseFloat(e.target.value) || 0);
                                      updateLineItemTotal(index);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name={`lineItems.${index}.unitPrice`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                                  Unit Price
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(parseFloat(e.target.value) || 0);
                                      updateLineItemTotal(index);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="col-span-1">
                          <FormField
                            control={form.control}
                            name={`lineItems.${index}.total`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                                  Total
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    readOnly 
                                    value={
                                      (form.getValues(`lineItems.${index}.quantity`) || 0) * 
                                      (form.getValues(`lineItems.${index}.unitPrice`) || 0)
                                    } 
                                    className="bg-muted"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLineItem(index)}
                            className="h-10 w-10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Additional notes or terms and conditions"
                              className="min-h-20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button type="button" variant="outline" onClick={() => setActiveTab("services")}>
                      Previous: Service Details
                    </Button>
                    <Button type="button" onClick={() => setActiveTab("preview")}>
                      Next: Preview
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="preview">
                <div className="space-y-8">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-xl font-bold">Quote Preview</h3>
                      <p className="text-sm text-muted-foreground">
                        This is how your client will see the quote
                      </p>
                    </div>
                    <FormField
                      control={form.control}
                      name="selectedTier"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select tier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="basic">Basic Tier</SelectItem>
                              <SelectItem value="standard">Standard Tier</SelectItem>
                              <SelectItem value="premium">Premium Tier (Recommended)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-center text-2xl">Professional Quote</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <h4 className="font-semibold mb-2">From:</h4>
                          <p>{user?.name || "Your Company"}</p>
                          <p>{user?.email || "your.email@example.com"}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">To:</h4>
                          <p>{form.getValues("clientName")}</p>
                          <p>{form.getValues("clientEmail")}</p>
                          <p>{form.getValues("clientPhone")}</p>
                          <p>{form.getValues("clientAddress")}</p>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h4 className="font-semibold mb-2">Description:</h4>
                        <p>{form.getValues("description")}</p>
                      </div>
                      
                      <div className="mb-6">
                        <h4 className="font-semibold mb-2">Line Items:</h4>
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Description</th>
                              <th className="text-left py-2">Category</th>
                              <th className="text-right py-2">Qty</th>
                              <th className="text-right py-2">Unit Price</th>
                              <th className="text-right py-2">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {form.getValues("lineItems")?.map((item, i) => (
                              <tr key={i} className="border-b">
                                <td className="py-2">{item.description}</td>
                                <td className="py-2 capitalize">{item.category}</td>
                                <td className="py-2 text-right">{item.quantity}</td>
                                <td className="py-2 text-right">${item.unitPrice.toFixed(2)}</td>
                                <td className="py-2 text-right">${item.total.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* We'll calculate these on the fly for preview */}
                      {(() => {
                        const data = form.getValues();
                        const quote = calculateTotals(data);
                        const selectedTier = form.getValues("selectedTier") || "standard";
                        
                        return (
                          <div className="flex flex-col items-end space-y-2">
                            <div className="flex justify-between w-64">
                              <span>Subtotal:</span>
                              <span>${quote.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between w-64">
                              <span>Tax (7%):</span>
                              <span>${quote.tax.toFixed(2)}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between w-64 font-bold">
                              <span>Total ({selectedTier}):</span>
                              <span>${quote.tieredPricing[selectedTier as QuoteTier].toFixed(2)}</span>
                            </div>
                          </div>
                        );
                      })()}
                      
                      {form.getValues("notes") && (
                        <div className="mt-8">
                          <h4 className="font-semibold mb-2">Notes:</h4>
                          <p className="text-sm text-muted-foreground">{form.getValues("notes")}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <div className="flex justify-between mt-6">
                    <Button type="button" variant="outline" onClick={() => setActiveTab("pricing")}>
                      Previous: Pricing
                    </Button>
                    <div className="space-x-2">
                      <Button 
                        type="submit" 
                        variant="default"
                        disabled={saveQuoteMutation.isPending}
                      >
                        {saveQuoteMutation.isPending && (
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        )}
                        <Save className="h-4 w-4 mr-2" />
                        Save Quote
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="default"
                        disabled={!quoteId || sendQuoteMutation.isPending}
                        onClick={handleSendQuote}
                      >
                        {sendQuoteMutation.isPending && (
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        )}
                        <Send className="h-4 w-4 mr-2" />
                        Send to Client
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          * Quotes are valid for 30 days from creation date
        </p>
      </CardFooter>
    </Card>
  );
}