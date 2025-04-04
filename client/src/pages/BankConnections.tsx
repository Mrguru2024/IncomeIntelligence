import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BankConnectionModal from '@/components/BankConnectionModal';

interface BankConnection {
  id: number;
  name: string;
  connectedDate: string;
  lastSynced: string;
  status: string;
}

export default function BankConnections() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // This would be populated from real bank connections in a production app
  const connections: BankConnection[] = [];

  return (
    <main className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 md:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Bank Connections</h2>
          <p className="text-sm sm:text-base text-gray-500 mt-0.5 sm:mt-1">Connect your bank accounts to automatically track income</p>
        </div>
        <div className="mt-3 sm:mt-0">
          <Button 
            className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-primary text-white hover:bg-blue-600 transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="fas fa-plus mr-1.5 sm:mr-2"></i>
            Connect Bank
          </Button>
        </div>
      </div>

      {connections.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {connections.map((connection) => (
            <Card key={connection.id}>
              <CardHeader className="p-3 sm:p-5 pb-0 sm:pb-0">
                <CardTitle className="text-base sm:text-lg">{connection.name}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Connected on {connection.connectedDate}</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-5 pt-2 sm:pt-3">
                <div className="mb-1.5 sm:mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-500">Status:</span>
                  <span className="ml-1.5 sm:ml-2 text-xs sm:text-sm bg-green-100 text-green-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">Active</span>
                </div>
                <div className="mb-1.5 sm:mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-500">Last synced:</span>
                  <span className="ml-1.5 sm:ml-2 text-xs sm:text-sm text-gray-700">{connection.lastSynced}</span>
                </div>
                <div className="mt-3 sm:mt-4 flex space-x-1.5 sm:space-x-2">
                  <Button variant="outline" size="sm" className="h-7 sm:h-8 text-xs sm:text-sm">
                    <i className="fas fa-sync-alt mr-1 sm:mr-2"></i>
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 sm:h-8 text-xs sm:text-sm text-destructive hover:text-destructive">
                    <i className="fas fa-unlink mr-1 sm:mr-2"></i>
                    Disconnect
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 sm:p-8 flex flex-col items-center justify-center text-center">
            <div className="text-gray-400 mb-2 sm:mb-3">
              <i className="fas fa-university text-3xl sm:text-5xl"></i>
            </div>
            <h4 className="text-base sm:text-lg font-medium text-gray-800 mb-1 sm:mb-2">No accounts connected yet</h4>
            <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 max-w-md">Connect your bank accounts to automatically track income and apply the 40/30/30 rule.</p>
            <Button 
              className="bg-primary text-white text-xs sm:text-sm py-1.5 sm:py-2 px-4 sm:px-6 hover:bg-blue-600 transition-colors"
              onClick={() => setIsModalOpen(true)}
            >
              Connect Your Bank
            </Button>
          </CardContent>
        </Card>
      )}

      <BankConnectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
