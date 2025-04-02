import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface BankConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BankConnectionModal({ isOpen, onClose }: BankConnectionModalProps) {
  const { toast } = useToast();

  const handleBankSelection = (bankName: string) => {
    // In a real implementation, this would open the Plaid Link
    // and handle the authentication flow
    toast({
      title: "Bank Connection",
      description: `This would connect to ${bankName} in a production app with Plaid API.`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">Connect Your Bank</DialogTitle>
          <DialogDescription className="text-gray-600">
            Select your bank to securely connect your accounts and automatically track your income.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mb-6">
          <Button
            variant="outline"
            className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            onClick={() => handleBankSelection("Chase")}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 flex items-center justify-center rounded-lg mr-3">
                <i className="fas fa-university text-blue-600"></i>
              </div>
              <span className="font-medium">Chase</span>
            </div>
            <i className="fas fa-chevron-right text-gray-400"></i>
          </Button>
          
          <Button
            variant="outline"
            className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            onClick={() => handleBankSelection("Bank of America")}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 flex items-center justify-center rounded-lg mr-3">
                <i className="fas fa-university text-blue-600"></i>
              </div>
              <span className="font-medium">Bank of America</span>
            </div>
            <i className="fas fa-chevron-right text-gray-400"></i>
          </Button>
          
          <Button
            variant="outline"
            className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            onClick={() => handleBankSelection("Wells Fargo")}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 flex items-center justify-center rounded-lg mr-3">
                <i className="fas fa-university text-blue-600"></i>
              </div>
              <span className="font-medium">Wells Fargo</span>
            </div>
            <i className="fas fa-chevron-right text-gray-400"></i>
          </Button>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>We use Plaid to securely connect your accounts.</p>
          <p>Your credentials are never shared with us.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
