import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export type PlaidLinkSuccessMetadata = {
  institution: {
    name: string;
    institution_id: string;
  };
  accounts: Array<{
    id: string;
    name: string;
    mask: string;
    type: string;
    subtype: string;
  }>;
};

export function usePlaidLink(userId: number = 1) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Request a link token from our server
  const createLinkTokenMutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest('/api/plaid/create-link-token', {
          method: 'POST',
          body: JSON.stringify({ userId }),
        });
        return response;
      } catch (error) {
        console.error('Error creating link token:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (data) => {
      setLinkToken(data.link_token);
    },
    onError: (error) => {
      console.error('Failed to create link token:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize bank connection. Please try again later.',
        variant: 'destructive',
      });
    },
  });

  // Exchange the public token for an access token
  const exchangePublicTokenMutation = useMutation({
    mutationFn: async ({ publicToken, metadata }: { publicToken: string; metadata: PlaidLinkSuccessMetadata }) => {
      setIsLoading(true);
      try {
        const response = await apiRequest('/api/plaid/exchange-token', {
          method: 'POST',
          body: JSON.stringify({
            userId,
            publicToken,
            metadata,
          }),
        });
        return response;
      } catch (error) {
        console.error('Error exchanging public token:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Bank account connected successfully!',
      });
    },
    onError: (error) => {
      console.error('Failed to exchange token:', error);
      toast({
        title: 'Error',
        description: 'Failed to finalize bank connection. Please try again later.',
        variant: 'destructive',
      });
    },
  });

  return {
    linkToken,
    isLoading: isLoading || createLinkTokenMutation.isPending || exchangePublicTokenMutation.isPending,
    createLinkToken: createLinkTokenMutation.mutate,
    exchangePublicToken: exchangePublicTokenMutation.mutate,
  };
}