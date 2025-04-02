import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BankConnectionModal from '@/components/BankConnectionModal';

export default function BankConnections() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // This would be populated from real bank connections in a production app
  const connections = [];

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Bank Connections</h2>
          <p className="text-gray-500 mt-1">Connect your bank accounts to automatically track income</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            className="flex items-center px-4 py-2 bg-primary text-white hover:bg-blue-600 transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="fas fa-plus mr-2"></i>
            Connect Bank
          </Button>
        </div>
      </div>

      {connections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((connection) => (
            <Card key={connection.id}>
              <CardHeader>
                <CardTitle>{connection.name}</CardTitle>
                <CardDescription>Connected on {connection.connectedDate}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                </div>
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-500">Last synced:</span>
                  <span className="ml-2 text-sm text-gray-700">{connection.lastSynced}</span>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button variant="outline" size="sm">
                    <i className="fas fa-sync-alt mr-2"></i>
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <i className="fas fa-unlink mr-2"></i>
                    Disconnect
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <div className="text-gray-400 mb-3">
              <i className="fas fa-university text-5xl"></i>
            </div>
            <h4 className="text-lg font-medium text-gray-800 mb-2">No accounts connected yet</h4>
            <p className="text-gray-500 mb-4 max-w-md">Connect your bank accounts to automatically track income and apply the 40/30/30 rule.</p>
            <Button 
              className="bg-primary text-white py-2 px-6 hover:bg-blue-600 transition-colors"
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
