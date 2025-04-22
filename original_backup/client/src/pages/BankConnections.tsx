import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Building, RefreshCw, Plus, Trash2, Loader2 } from "lucide-react";
import BankConnectionModal from "@/components/BankConnectionModal";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AllBankAccounts from "@/components/AllBankAccounts";

// Types for bank connection data
interface BankConnection {
  id: number;
  userId: number;
  institutionId: string;
  institutionName: string;
  status: string;
  lastSyncTime?: string;
}

interface BankAccount {
  id: number;
  connectionId: number;
  accountName: string;
  accountType: string;
  accountSubtype: string | null;
  balanceAvailable: string | null;
  balanceCurrent: string | null;
  mask: string | null;
}

interface Transaction {
  id: number;
  accountId: number;
  date: string;
  name: string;
  amount: string;
  category: string | null;
  pending: boolean;
}

export default function BankConnections() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<number | null>(
    null,
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = 1; // In a real app, this would come from authentication

  // Fetch bank connections for the user
  const {
    data: connections = [] as BankConnection[],
    isLoading: isLoadingConnections,
    error: connectionsError,
  } = useQuery<BankConnection[]>({
    queryKey: ["/api/bank-connections/user/" + userId],
  });

  // Fetch accounts for the selected connection
  const { data: accounts = [] as BankAccount[], isLoading: isLoadingAccounts } =
    useQuery<BankAccount[]>({
      queryKey: ["/api/bank-connections/" + selectedConnection + "/accounts"],
      enabled: !!selectedConnection,
    });

  // Delete a bank connection
  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: async (connectionId: number) => {
      await fetch(`/api/bank-connections/${connectionId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Connection removed",
        description: "The bank connection has been successfully removed.",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/bank-connections/user/" + userId],
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove the bank connection.",
        variant: "destructive",
      });
    },
  });

  // Sync transactions for a connection
  const syncMutation = useMutation<void, Error, number>({
    mutationFn: async (connectionId: number) => {
      await fetch(`/api/bank-connections/${connectionId}/sync`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Sync complete",
        description: "Transactions have been successfully synced.",
      });
      if (selectedConnection) {
        queryClient.invalidateQueries({
          queryKey: [
            "/api/bank-connections/" + selectedConnection + "/accounts",
          ],
        });
      }
    },
    onError: () => {
      toast({
        title: "Sync failed",
        description: "Failed to sync transactions. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Import transactions as income
  const importIncomeMutation = useMutation<void, Error, number>({
    mutationFn: async (connectionId: number) => {
      await fetch(`/api/bank-connections/${connectionId}/import-income`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Import complete",
        description: "Income transactions have been successfully imported.",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/incomes"],
      });
    },
    onError: () => {
      toast({
        title: "Import failed",
        description: "Failed to import income transactions. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle connection selection
  const handleSelectConnection = (connectionId: number) => {
    setSelectedConnection(connectionId);
  };

  // Format currency for display
  const formatCurrency = (amount: string | null) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount));
  };

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bank Connections</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <i className="fas fa-plus mr-2"></i> Add Bank
        </Button>
      </div>

      {/* All Bank Accounts View */}
      <AllBankAccounts userId={userId} />

      {/* Existing Bank Connections List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Bank Connections</h2>
        {isLoadingConnections ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : connections?.length > 0 ? (
          <div className="grid gap-4">
            {connections.map((connection) => (
              <Card
                key={connection.id}
                className={`overflow-hidden cursor-pointer transition-all ${
                  selectedConnection === connection.id
                    ? "ring-2 ring-primary"
                    : ""
                }`}
                onClick={() => handleSelectConnection(connection.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold">
                      {connection.institutionName}
                    </CardTitle>
                    <Badge
                      variant={
                        connection.status === "active"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {connection.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Last synced: {formatDate(connection.lastSyncTime)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm">
                    <span className="font-medium">Institution ID:</span>{" "}
                    {connection.institutionId}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      syncMutation.mutate(connection.id);
                    }}
                    disabled={
                      syncMutation.isPending &&
                      syncMutation.variables === connection.id
                    }
                  >
                    {syncMutation.isPending &&
                    syncMutation.variables === connection.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Sync
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      importIncomeMutation.mutate(connection.id);
                    }}
                    disabled={
                      importIncomeMutation.isPending &&
                      importIncomeMutation.variables === connection.id
                    }
                  >
                    {importIncomeMutation.isPending &&
                    importIncomeMutation.variables === connection.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Import Income
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        window.confirm(
                          "Are you sure you want to remove this connection?",
                        )
                      ) {
                        deleteMutation.mutate(connection.id);
                      }
                    }}
                    disabled={
                      deleteMutation.isPending &&
                      deleteMutation.variables === connection.id
                    }
                  >
                    {deleteMutation.isPending &&
                    deleteMutation.variables === connection.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                No bank connections found. Add your first bank account to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Existing Bank Connection Modal */}
      <BankConnectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
      />
    </div>
  );
}
