import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Eye, FileText, MoreHorizontal, Send, Trash2, Copy, FileCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { QuoteData } from "./quoteUtils";

interface QuoteListProps {
  limit?: number;
  showCreate?: boolean;
}

export default function QuoteList({ limit, showCreate = true }: QuoteListProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: quotes, isLoading } = useQuery({
    queryKey: ["/api/quotes"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/quotes");
      return await res.json();
    }
  });

  // Delete quote mutation
  const deleteQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const res = await apiRequest("DELETE", `/api/quotes/${quoteId}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Quote deleted",
        description: "Your quote has been deleted successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting quote",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send quote mutation
  const sendQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const res = await apiRequest("POST", `/api/quotes/${quoteId}/send`, {});
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

  // Duplicate quote mutation
  const duplicateQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const res = await apiRequest("POST", `/api/quotes/${quoteId}/duplicate`, {});
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Quote duplicated",
        description: "A copy of the quote has been created.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      navigate(`/quotes/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error duplicating quote",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Convert quote to invoice mutation
  const convertToInvoiceMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const res = await apiRequest("POST", `/api/quotes/${quoteId}/convert-to-invoice`, {});
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Quote converted to invoice",
        description: "The quote has been converted to an invoice.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      navigate(`/invoices/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error converting quote",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle quote actions
  const handleDelete = (quoteId: string) => {
    if (confirm("Are you sure you want to delete this quote? This action cannot be undone.")) {
      deleteQuoteMutation.mutate(quoteId);
    }
  };

  const handleSend = (quoteId: string) => {
    sendQuoteMutation.mutate(quoteId);
  };

  const handleDuplicate = (quoteId: string) => {
    duplicateQuoteMutation.mutate(quoteId);
  };

  const handleConvertToInvoice = (quoteId: string) => {
    convertToInvoiceMutation.mutate(quoteId);
  };

  const getStatusBadge = (status: string) => {
    const statusColor: Record<string, string> = {
      draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      sent: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      accepted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      declined: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      expired: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const displayQuotes = limit ? quotes?.slice(0, limit) : quotes;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Quotes</CardTitle>
          <CardDescription>
            Manage your client quotes and proposals
          </CardDescription>
        </div>
        {showCreate && (
          <Button asChild>
            <Link to="/quotes/new">
              <FileText className="h-4 w-4 mr-2" />
              Create Quote
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {displayQuotes?.length === 0 ? (
          <div className="text-center p-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No quotes yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first quote to get started
            </p>
            <Button asChild>
              <Link to="/quotes/new">
                Create Quote
              </Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayQuotes?.map((quote: QuoteData) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">
                      <Link 
                        to={`/quotes/${quote.id}`} 
                        className="hover:underline text-primary"
                      >
                        Q-{quote.id?.substring(0, 8)}
                      </Link>
                    </TableCell>
                    <TableCell>{quote.clientName}</TableCell>
                    <TableCell>{formatDate(quote.createdAt.toString())}</TableCell>
                    <TableCell>
                      ${quote.selectedTier 
                        ? quote.tieredPricing[quote.selectedTier].toFixed(2)
                        : quote.tieredPricing.standard.toFixed(2)
                      }
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(quote.status)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link to={`/quotes/${quote.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/quotes/${quote.id}/preview`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleSend(quote.id || "")}
                            disabled={quote.status !== "draft"}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDuplicate(quote.id || "")}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleConvertToInvoice(quote.id || "")}
                            disabled={quote.status !== "accepted"}
                          >
                            <FileCheck className="h-4 w-4 mr-2" />
                            Convert to Invoice
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(quote.id || "")}
                            className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      {(limit && quotes?.length > limit) && (
        <CardFooter className="flex justify-center">
          <Button asChild variant="outline">
            <Link to="/quotes">
              View All Quotes
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}