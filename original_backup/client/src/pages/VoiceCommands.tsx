import React from "react";
import VoiceCommandCenter from "@/components/VoiceCommandCenter";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const VoiceCommandsPage: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
        Voice Assistant
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-4 sm:space-y-6">
          <VoiceCommandCenter />

          <Card>
            <CardHeader className="p-4 sm:p-6 pb-0 sm:pb-0">
              <CardTitle className="text-base sm:text-lg md:text-xl">
                Tips for Using Voice Commands
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Get the most out of your voice assistant
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-sm sm:text-base font-medium">
                  Speak Clearly
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Speak at a normal pace and volume in a quiet environment.
                </p>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-medium">
                  Use Simple Commands
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Commands work best when they're concise and direct.
                </p>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-medium">
                  Try Again if Needed
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  If a command isn't recognized, try rephrasing it slightly.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Tabs defaultValue="commands">
            <div className="overflow-x-auto horizontal-scroll w-full -mx-2 xxs:-mx-3 px-2 xxs:px-3 pb-1 xxs:pb-2">
              <TabsList className="horizontal-scroll scrollbar-none flex pb-1 min-w-[280px] xxs:min-w-[360px] sm:min-w-0 inline-flex w-full">
                <TabsTrigger
                  value="commands"
                  className="text-xs sm:text-sm py-1.5 sm:py-2"
                >
                  Commands
                </TabsTrigger>
                <TabsTrigger
                  value="examples"
                  className="text-xs sm:text-sm py-1.5 sm:py-2"
                >
                  Example Phrases
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent
              value="commands"
              className="space-y-3 sm:space-y-4 mt-3 sm:mt-4"
            >
              <Card>
                <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
                  <CardTitle className="text-sm sm:text-base md:text-lg">
                    Navigation Commands
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  <ul className="space-y-1.5 sm:space-y-2">
                    <li className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-xs sm:text-sm font-medium">
                        "Show dashboard"
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        Go to Dashboard
                      </span>
                    </li>
                    <li className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-xs sm:text-sm font-medium">
                        "Show income"
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        Go to Income History
                      </span>
                    </li>
                    <li className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-xs sm:text-sm font-medium">
                        "Show goals"
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        Go to Goals
                      </span>
                    </li>
                    <li className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-xs sm:text-sm font-medium">
                        "Show budget"
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        Go to Budget Planner
                      </span>
                    </li>
                    <li className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-xs sm:text-sm font-medium">
                        "Show bank connections"
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        Go to Bank Connections
                      </span>
                    </li>
                    <li className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-xs sm:text-sm font-medium">
                        "Show settings"
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        Go to Settings
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
                  <CardTitle className="text-sm sm:text-base md:text-lg">
                    Action Commands
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  <ul className="space-y-1.5 sm:space-y-2">
                    <li className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-xs sm:text-sm font-medium">
                        "Add income"
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        Open income form
                      </span>
                    </li>
                    <li className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-xs sm:text-sm font-medium">
                        "Refresh data"
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        Refresh all data
                      </span>
                    </li>
                    <li className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-xs sm:text-sm font-medium">
                        "Help"
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        Show available commands
                      </span>
                    </li>
                    <li className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-xs sm:text-sm font-medium">
                        "Hide help"
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        Hide commands list
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              value="examples"
              className="space-y-3 sm:space-y-4 mt-3 sm:mt-4"
            >
              <Card>
                <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
                  <CardTitle className="text-sm sm:text-base md:text-lg">
                    Example Voice Interactions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="border-l-4 border-primary p-2 sm:p-3 bg-muted/50 rounded-r">
                      <p className="text-xs sm:text-sm font-medium">
                        You: "Show my income history"
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                        Assistant will navigate to the Income History page
                      </p>
                    </div>

                    <div className="border-l-4 border-primary p-2 sm:p-3 bg-muted/50 rounded-r">
                      <p className="text-xs sm:text-sm font-medium">
                        You: "I need to add my new income"
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                        Assistant will open the income form
                      </p>
                    </div>

                    <div className="border-l-4 border-primary p-2 sm:p-3 bg-muted/50 rounded-r">
                      <p className="text-xs sm:text-sm font-medium">
                        You: "Help"
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                        Assistant will show a list of available commands
                      </p>
                    </div>

                    <div className="border-l-4 border-primary p-2 sm:p-3 bg-muted/50 rounded-r">
                      <p className="text-xs sm:text-sm font-medium">
                        You: "Refresh my dashboard data"
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
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
