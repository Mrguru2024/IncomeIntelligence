import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Define the response type for clarity
interface LinkTokenResponse {
  linkToken: string;
}

export interface PlaidLinkSuccessMetadata {
  institution: {
    institution_id: string;
    name: string;
  };
  accounts: Array<{
    id: string;
    name: string;
    mask: string;
    type: string;
    subtype: string;
  }>;
  link_session_id: string;
}

export interface ExchangeTokenParams {
  publicToken: string;
  metadata: PlaidLinkSuccessMetadata;
}

export interface UsePlaidLinkResult {
  linkToken: string | null;
  isLoading: boolean;
  error: Error | null;
  createLinkToken: () => Promise<void>;
  exchangePublicToken: (params: ExchangeTokenParams) => Promise<void>;
}

export function usePlaidLink(userId: number): UsePlaidLinkResult {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Create a link token
  const createLinkToken = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Request link token from our server
      const response = await apiRequest("/api/plaid/create-link-token", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });

      setLinkToken(response.linkToken);
    } catch (err) {
      console.error("Error creating link token:", err);
      setError(err as Error);
      toast({
        title: "Error",
        description: "Failed to initialize bank connection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  // Exchange the public token for an access token
  const exchangePublicToken = useCallback(
    async ({ publicToken, metadata }: ExchangeTokenParams) => {
      setIsLoading(true);
      setError(null);

      try {
        // Send to our backend to exchange token and save connection
        await apiRequest("/api/plaid/exchange-token", {
          method: "POST",
          body: JSON.stringify({
            userId,
            publicToken,
            metadata,
          }),
        });

        toast({
          title: "Success",
          description: `Successfully connected to ${metadata.institution.name}`,
        });

        // Reset link token state after successful connection
        setLinkToken(null);
      } catch (err) {
        console.error("Error exchanging public token:", err);
        setError(err as Error);
        toast({
          title: "Connection Failed",
          description:
            "There was an issue finalizing your bank connection. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [userId, toast],
  );

  return {
    linkToken,
    isLoading,
    error,
    createLinkToken,
    exchangePublicToken,
  };
}
