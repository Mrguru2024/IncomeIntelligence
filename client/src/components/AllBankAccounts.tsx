import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface BankAccount {
  id: number;
  connectionId: number;
  accountName: string;
  accountType: string;
  accountSubtype: string | null;
  balanceAvailable: string | null;
  balanceCurrent: string | null;
  mask: string | null;
  institutionName: string;
}

export default function AllBankAccounts({ userId }: { userId: number }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all bank accounts for the user
  const {
    data: accounts = [] as BankAccount[],
    isLoading,
    error,
  } = useQuery<BankAccount[]>({
    queryKey: ["/api/bank-accounts/user/" + userId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/bank-accounts/user/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch bank accounts');
        }
        return await response.json();
      } catch (err) {
        console.log("Error loading bank accounts handled:", err);
        return [] as BankAccount[];
      }
    }
  });

  // Filter accounts based on search term
  const filteredAccounts = accounts.filter((account: BankAccount) =>
    account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.institutionName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format currency for display
  const formatCurrency = (amount: string | null) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount));
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-red-500">Error loading bank accounts</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Bank Accounts</CardTitle>
        <div className="mt-4">
          <Input
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredAccounts.length > 0 ? (
          <Table>
            <TableCaption>All your connected bank accounts</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Institution</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Mask</TableHead>
                <TableHead className="text-right">Available Balance</TableHead>
                <TableHead className="text-right">Current Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account: BankAccount) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">
                    {account.institutionName}
                  </TableCell>
                  <TableCell>{account.accountName}</TableCell>
                  <TableCell>
                    {account.accountType}
                    {account.accountSubtype
                      ? ` (${account.accountSubtype})`
                      : ""}
                  </TableCell>
                  <TableCell>{account.mask || "N/A"}</TableCell>
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
            <p className="text-muted-foreground">
              {searchTerm
                ? "No accounts match your search"
                : "No bank accounts found"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 