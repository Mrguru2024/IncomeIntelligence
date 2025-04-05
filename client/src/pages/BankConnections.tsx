import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
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
  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = 1; // In a real app, this would come from authentication

  // Fetch bank connections for the user
  const { 
    data: connections,
    isLoading: isLoadingConnections,
    error: connectionsError
  } = useQuery({
    queryKey: ['/api/bank-connections/user/' + userId],
  });

  // Fetch accounts for the selected connection
  const {
    data: accounts,
    isLoading: isLoadingAccounts
  } = useQuery({
    queryKey: ['/api/bank-connections/' + selectedConnection + '/accounts'],
    enabled: !!selectedConnection
  });

  // Delete a bank connection
  const deleteMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      await fetch(`/api/bank-connections/${connectionId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "Connection removed",
        description: "The bank connection has been successfully removed."
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/bank-connections/user/' + userId],
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove the bank connection.",
        variant: "destructive"
      });
    }
  });

  // Sync transactions for a connection
  const syncMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      await fetch(`/api/bank-connections/${connectionId}/sync`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: "Sync complete",
        description: "Transactions have been successfully synced."
      });
      if (selectedConnection) {
        queryClient.invalidateQueries({
          queryKey: ['/api/bank-connections/' + selectedConnection + '/accounts'],
        });
      }
    },
    onError: () => {
      toast({
        title: "Sync failed",
        description: "Failed to sync transactions. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Import transactions as income
  const importIncomeMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      await fetch(`/api/bank-connections/${connectionId}/import-income`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: "Import complete",
        description: "Income transactions have been successfully imported."
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/incomes'],
      });
    },
    onError: () => {
      toast({
        title: "Import failed",
        description: "Failed to import income transactions. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle connection selection
  const handleSelectConnection = (connectionId: number) => {
    setSelectedConnection(connectionId);
  };

  // Format currency for display
  const formatCurrency = (amount: string | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));
  };

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bank Connections</h1>
          <p className="text-muted-foreground">
            Connect your bank accounts to automatically track your finances
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Connect Bank
        </Button>
      </div>

      {connectionsError ? (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center p-4">
              <p className="text-destructive">Failed to load bank connections</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* List of bank connections */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingConnections ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-3 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-4/5" />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                  </CardFooter>
                </Card>
              ))
            ) : connections?.length > 0 ? (
              connections.map((connection: BankConnection) => (
                <Card 
                  key={connection.id} 
                  className={`overflow-hidden cursor-pointer transition-all ${
                    selectedConnection === connection.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSelectConnection(connection.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold">
                        {connection.institutionName}
                      </CardTitle>
                      <Badge variant={connection.status === 'active' ? 'default' : 'destructive'}>
                        {connection.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      Last synced: {formatDate(connection.lastSyncTime)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm">
                      <span className="font-medium">Institution ID:</span> {connection.institutionId}
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
                      disabled={syncMutation.isPending && syncMutation.variables === connection.id}
                    >
                      {syncMutation.isPending && syncMutation.variables === connection.id ? (
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
                      disabled={importIncomeMutation.isPending && importIncomeMutation.variables === connection.id}
                    >
                      {importIncomeMutation.isPending && importIncomeMutation.variables === connection.id ? (
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
                        if (window.confirm("Are you sure you want to remove this connection?")) {
                          deleteMutation.mutate(connection.id);
                        }
                      }}
                      disabled={deleteMutation.isPending && deleteMutation.variables === connection.id}
                    >
                      {deleteMutation.isPending && deleteMutation.variables === connection.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Building className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Bank Connections</h3>
                  <p className="text-center text-muted-foreground mb-4">
                    Connect your bank accounts to automatically track your finances and import transactions.
                  </p>
                  <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Connect Bank
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Account details when a connection is selected */}
          {selectedConnection && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Accounts</CardTitle>
                <CardDescription>
                  Details of accounts from the selected bank connection
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAccounts ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : accounts?.length > 0 ? (
                  <Table>
                    <TableCaption>List of connected accounts</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Mask</TableHead>
                        <TableHead className="text-right">Available Balance</TableHead>
                        <TableHead className="text-right">Current Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts.map((account: BankAccount) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">{account.accountName}</TableCell>
                          <TableCell>
                            {account.accountType}
                            {account.accountSubtype ? ` (${account.accountSubtype})` : ''}
                          </TableCell>
                          <TableCell>{account.mask || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(account.balanceAvailable)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(account.balanceCurrent)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center p-4">
                    <p className="text-muted-foreground">No accounts found for this connection</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    syncMutation.mutate(selectedConnection);
                  }}
                  disabled={syncMutation.isPending}
                >
                  {syncMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Sync Transactions
                </Button>
                <Button
                  onClick={() => {
                    importIncomeMutation.mutate(selectedConnection);
                  }}
                  disabled={importIncomeMutation.isPending}
                >
                  {importIncomeMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Import as Income
                </Button>
              </CardFooter>
            </Card>
          )}
        </>
      )}

      {/* Bank connection modal */}
      <BankConnectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ['/api/bank-connections/user/' + userId],
          });
        }}
        userId={userId}
      />
    </div>
  );
}