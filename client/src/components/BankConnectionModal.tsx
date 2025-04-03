import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePlaidLink as useReactPlaidLink, PlaidLinkOnSuccessMetadata } from "react-plaid-link";
import { usePlaidLink, type PlaidLinkSuccessMetadata } from "@/hooks/usePlaidLink";
import { BuildingIcon, Loader2Icon } from "lucide-react";

interface BankConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userId?: number;
}

export default function BankConnectionModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  userId = 1
}: BankConnectionModalProps) {
  const { toast } = useToast();
  const { 
    linkToken, 
    isLoading, 
    createLinkToken, 
    exchangePublicToken 
  } = usePlaidLink(userId);

  // Initialize by requesting a link token when modal opens
  useEffect(() => {
    if (isOpen && !linkToken && !isLoading) {
      createLinkToken();
    }
  }, [isOpen, linkToken, isLoading, createLinkToken]);

  // Setup Plaid Link configuration
  const { open, ready } = useReactPlaidLink({
    token: linkToken || "",
    onSuccess: (publicToken, metadata) => {
      // Handle successful connection
      console.log("Successfully connected account");
      
      // Exchange public token for access token on our server
      exchangePublicToken({
        publicToken,
        metadata: metadata as unknown as PlaidLinkSuccessMetadata
      });
      
      // Close modal and notify parent component
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    },
    onExit: (err, metadata) => {
      // Handle exit (including user exit or error)
      if (err) {
        console.error("Plaid Link error:", err);
        toast({
          title: "Connection Failed",
          description: "There was an issue connecting to your bank. Please try again.",
          variant: "destructive"
        });
      }
    }
  });

  // Handle connect button click
  const handleConnect = () => {
    if (ready && linkToken) {
      open();
    } else {
      toast({
        title: "Not Ready",
        description: "Please wait for the connection to initialize.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">Connect Your Bank</DialogTitle>
          <DialogDescription className="text-gray-600">
            Connect your bank accounts to automatically track your income.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2Icon className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-gray-600">Initializing connection...</p>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 mx-auto flex items-center justify-center">
                <BuildingIcon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Securely Connect Your Bank</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">
                  We use Plaid to securely connect to over 10,000 financial institutions.
                </p>
              </div>
              <Button 
                className="w-full" 
                onClick={handleConnect} 
                disabled={!ready || !linkToken || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  "Connect Bank Account"
                )}
              </Button>
            </div>
          )}
        </div>
        
        <div className="text-center text-sm text-gray-500 border-t pt-4">
          <p>We use Plaid to securely connect your accounts.</p>
          <p>Your credentials are never shared with us.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
