import React from 'react';
import VoiceCommandCenter from '@/components/VoiceCommandCenter';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const VoiceCommandsPage: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Voice Assistant</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <VoiceCommandCenter />
          
          <Card>
            <CardHeader>
              <CardTitle>Tips for Using Voice Commands</CardTitle>
              <CardDescription>
                Get the most out of your voice assistant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Speak Clearly</h3>
                <p className="text-sm text-muted-foreground">
                  Speak at a normal pace and volume in a quiet environment.
                </p>
              </div>
              <div>
                <h3 className="font-medium">Use Simple Commands</h3>
                <p className="text-sm text-muted-foreground">
                  Commands work best when they're concise and direct.
                </p>
              </div>
              <div>
                <h3 className="font-medium">Try Again if Needed</h3>
                <p className="text-sm text-muted-foreground">
                  If a command isn't recognized, try rephrasing it slightly.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className={isMobile ? "mt-6" : ""}>
          <Tabs defaultValue="commands">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="commands">Commands</TabsTrigger>
              <TabsTrigger value="examples">Example Phrases</TabsTrigger>
            </TabsList>
            <TabsContent value="commands" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Navigation Commands</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="font-medium">"Show dashboard"</span>
                      <span className="text-muted-foreground">Go to Dashboard</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium">"Show income"</span>
                      <span className="text-muted-foreground">Go to Income History</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium">"Show goals"</span>
                      <span className="text-muted-foreground">Go to Goals</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium">"Show budget"</span>
                      <span className="text-muted-foreground">Go to Budget Planner</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium">"Show bank connections"</span>
                      <span className="text-muted-foreground">Go to Bank Connections</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium">"Show settings"</span>
                      <span className="text-muted-foreground">Go to Settings</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Action Commands</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="font-medium">"Add income"</span>
                      <span className="text-muted-foreground">Open income form</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium">"Refresh data"</span>
                      <span className="text-muted-foreground">Refresh all data</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium">"Help"</span>
                      <span className="text-muted-foreground">Show available commands</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium">"Hide help"</span>
                      <span className="text-muted-foreground">Hide commands list</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="examples" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Example Voice Interactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-4 border-primary p-3 bg-muted/50 rounded-r">
                      <p className="font-medium">You: "Show my income history"</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Assistant will navigate to the Income History page
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-primary p-3 bg-muted/50 rounded-r">
                      <p className="font-medium">You: "I need to add my new income"</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Assistant will open the income form
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-primary p-3 bg-muted/50 rounded-r">
                      <p className="font-medium">You: "Help"</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Assistant will show a list of available commands
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-primary p-3 bg-muted/50 rounded-r">
                      <p className="font-medium">You: "Refresh my dashboard data"</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Assistant will refresh all data from the server
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default VoiceCommandsPage;