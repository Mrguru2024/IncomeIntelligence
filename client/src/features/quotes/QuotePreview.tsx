import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { QuoteData, QuoteTier } from "./quoteUtils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle, Download, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuotePreviewProps {
  isClient?: boolean;
}

export default function QuotePreview({ isClient = false }: QuotePreviewProps) {
  const { quoteId } = useParams<{ quoteId: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<QuoteTier>("standard");

  // Create a query to fetch quote data
  const { data: quote, isLoading } = useQuery<QuoteData>({
    queryKey: ["/api/quotes", quoteId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/quotes/${quoteId}`);
      return await res.json();
    },
    enabled: !!quoteId,
  });

  // Set the active tab based on the selected tier in the quote
  useEffect(() => {
    if (quote?.selectedTier) {
      setActiveTab(quote.selectedTier);
    }
  }, [quote]);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Handle accept/decline quote
  const handleAcceptQuote = async () => {
    try {
      await apiRequest("POST", `/api/quotes/${quoteId}/accept`, {});
      toast({
        title: "Quote accepted",
        description: "You have accepted this quote. The service provider will be notified.",
      });
      // Refresh the quote data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error accepting quote",
        description: "There was an error accepting this quote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeclineQuote = async () => {
    try {
      await apiRequest("POST", `/api/quotes/${quoteId}/decline`, {});
      toast({
        title: "Quote declined",
        description: "You have declined this quote. The service provider will be notified.",
      });
      // Refresh the quote data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error declining quote",
        description: "There was an error declining this quote. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle download PDF
  const handleDownloadPDF = async () => {
    try {
      const res = await apiRequest("GET", `/api/quotes/${quoteId}/pdf`, {}, { responseType: "blob" });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Quote-${quoteId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Error downloading PDF",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-semibold mb-2">Quote not found</h3>
        <p className="text-sm text-muted-foreground mb-4">
          The quote you are looking for does not exist or you don't have permission to view it.
        </p>
        <Button asChild>
          <Link to="/quotes">
            Back to Quotes
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {!isClient && (
        <div className="mb-6">
          <Button 
            variant="outline" 
            className="mb-4"
            onClick={() => navigate("/quotes")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quotes
          </Button>
        </div>
      )}
      
      <Card className="w-full shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {/* Company logo would go here */}
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
              {user?.name?.charAt(0) || "S"}
            </div>
          </div>
          <CardTitle className="text-3xl">Professional Quote</CardTitle>
          <CardDescription>
            Quote #{quoteId?.substring(0, 8)} • Created {formatDate(quote.createdAt.toString())}
          </CardDescription>
          
          {quote.status === "accepted" && (
            <div className="mt-4 flex items-center justify-center text-green-600 dark:text-green-500">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>This quote has been accepted on {formatDate(quote.updatedAt?.toString() || "")}</span>
            </div>
          )}
          
          {quote.status === "declined" && (
            <div className="mt-4 flex items-center justify-center text-red-600 dark:text-red-500">
              <XCircle className="h-5 w-5 mr-2" />
              <span>This quote has been declined on {formatDate(quote.updatedAt?.toString() || "")}</span>
            </div>
          )}
          
          {quote.status === "expired" && (
            <div className="mt-4 flex items-center justify-center text-yellow-600 dark:text-yellow-500">
              <XCircle className="h-5 w-5 mr-2" />
              <span>This quote has expired on {formatDate(quote.expiresAt.toString())}</span>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-lg mb-2">From:</h4>
              <p className="font-medium">{user?.name || "Your Company"}</p>
              <p>{user?.email || "your.email@example.com"}</p>
              <p>{user?.phone || ""}</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">To:</h4>
              <p className="font-medium">{quote.clientName}</p>
              <p>{quote.clientEmail}</p>
              <p>{quote.clientPhone || ""}</p>
              <p>{quote.clientAddress || ""}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-2">Project Description:</h4>
            <p className="text-muted-foreground">{quote.description}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-2">Service Type:</h4>
            <p>{quote.serviceType} - {industries[quote.industry] || quote.industry}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Select Your Package:</h4>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as QuoteTier)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="standard">Standard</TabsTrigger>
                <TabsTrigger value="premium">Premium</TabsTrigger>
              </TabsList>
              
              <div className="mt-6">
                <TabsContent value="basic">
                  <PackageDetails tier="basic" quote={quote} />
                </TabsContent>
                <TabsContent value="standard">
                  <PackageDetails tier="standard" quote={quote} />
                </TabsContent>
                <TabsContent value="premium">
                  <PackageDetails tier="premium" quote={quote} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-2">Line Items:</h4>
            <table className="w-full mt-2">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-medium">Description</th>
                  <th className="text-left py-2 font-medium">Category</th>
                  <th className="text-right py-2 font-medium">Qty</th>
                  <th className="text-right py-2 font-medium">Unit Price</th>
                  <th className="text-right py-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.lineItems.map((item, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="py-3">{item.description}</td>
                    <td className="py-3 capitalize">{item.category}</td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 text-right">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3}></td>
                  <td className="py-3 text-right font-medium">Subtotal:</td>
                  <td className="py-3 text-right">{formatCurrency(quote.subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={3}></td>
                  <td className="py-3 text-right font-medium">Tax (7%):</td>
                  <td className="py-3 text-right">{formatCurrency(quote.tax)}</td>
                </tr>
                <tr className="border-t border-border">
                  <td colSpan={3}></td>
                  <td className="py-3 text-right font-bold">Total ({activeTab}):</td>
                  <td className="py-3 text-right font-bold">
                    {formatCurrency(quote.tieredPricing[activeTab])}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {quote.notes && (
            <div>
              <h4 className="font-semibold text-lg mb-2">Notes:</h4>
              <p className="text-sm text-muted-foreground">{quote.notes}</p>
            </div>
          )}
          
          <div>
            <h4 className="font-semibold text-lg mb-2">Terms:</h4>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>This quote is valid until {formatDate(quote.expiresAt.toString())}</li>
              <li>Payment terms: 50% deposit required for projects under $2,000. 25% deposit for projects over $2,000.</li>
              <li>Final payment due upon completion of work.</li>
              <li>Changes to scope may result in additional charges.</li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="text-center md:text-left text-sm text-muted-foreground">
            <p>Thank you for your consideration!</p>
            <p>Questions? Contact us at {user?.email || "support@example.com"}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            
            {isClient && quote.status === "sent" && (
              <>
                <Button 
                  variant="destructive" 
                  onClick={handleDeclineQuote}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline
                </Button>
                <Button 
                  onClick={handleAcceptQuote}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept Quote
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

// Map industry values to display names
const industries: Record<string, string> = {
  automotive: "Automotive",
  beauty: "Beauty & Salon",
  cleaning: "Cleaning Services",
  construction: "Construction",
  electrical: "Electrical",
  electronics: "Electronics Repair",
  flooring: "Flooring",
  graphicDesign: "Graphic Design",
  hvac: "HVAC",
  landscaping: "Landscaping",
  locksmith: "Locksmith",
  painting: "Painting",
  plumbing: "Plumbing",
  roofing: "Roofing",
  security: "Security",
};

// Package details component
interface PackageDetailsProps {
  tier: QuoteTier;
  quote: QuoteData;
}

function PackageDetails({ tier, quote }: PackageDetailsProps) {
  // Define features for each tier
  const tierFeatures: Record<QuoteTier, { features: string[]; bestValue: boolean; highlight: string }> = {
    basic: {
      features: [
        "Essential service coverage",
        "Standard materials",
        "30-day workmanship guarantee",
        "Email support"
      ],
      bestValue: false,
      highlight: "Budget-friendly option with essential coverage"
    },
    standard: {
      features: [
        "Comprehensive service coverage",
        "Quality materials",
        "90-day workmanship guarantee",
        "Phone and email support",
        "Progress updates"
      ],
      bestValue: true,
      highlight: "Our most popular package with the best balance of quality and value"
    },
    premium: {
      features: [
        "Premium service coverage",
        "Top-quality materials",
        "1-year workmanship guarantee",
        "Priority support",
        "Detailed documentation",
        "Post-service follow-up",
        "Expedited service"
      ],
      bestValue: false,
      highlight: "Premium service with extended guarantees and priority support"
    }
  };

  const tierInfo = tierFeatures[tier];
  
  return (
    <Card className={`w-full ${tier === "premium" ? "border-primary" : ""}`}>
      <CardHeader className={`pb-4 ${tier === "standard" ? "bg-primary/10" : tier === "premium" ? "bg-primary/20" : ""}`}>
        <CardTitle className="flex justify-between items-center">
          <span className="capitalize">{tier} Package</span>
          <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(quote.tieredPricing[tier])}</span>
        </CardTitle>
        <CardDescription>{tierInfo.highlight}</CardDescription>
        {tierInfo.bestValue && (
          <div className="mt-2">
            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
              Most Popular
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="space-y-2">
          {tierInfo.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}