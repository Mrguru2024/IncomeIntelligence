import React, { useState, useEffect, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Mic, MicOff, Play, StopCircle } from "lucide-react";
import { useLocation } from 'wouter';
import { queryClient } from '@/lib/queryClient';

type CommandHandlers = {
  [key: string]: () => void;
};

// List of available commands for the help dialogue
const availableCommands = [
  { command: "Show income", description: "Navigate to income history page" },
  { command: "Add income", description: "Open income form" },
  { command: "Add expense", description: "Open expense form" },
  { command: "Record expense", description: "Use voice to record expense" },
  { command: "Show dashboard", description: "Navigate to dashboard" },
  { command: "Show goals", description: "Navigate to goals page" },
  { command: "Show expenses", description: "Navigate to expenses page" },
  { command: "Show budget", description: "Navigate to budget planner" },
  { command: "Show bank connections", description: "Navigate to bank connections page" },
  { command: "Show settings", description: "Navigate to settings page" },
  { command: "Refresh data", description: "Refresh all data" },
];

const VoiceCommandCenter: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isShowingCommands, setIsShowingCommands] = useState(false);
  const [, setLocation] = useLocation();

  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();

  // Define commands based on transcript
  const commandHandlers: CommandHandlers = {
    'show income': () => setLocation('/income-history'),
    'add income': () => setLocation('/income-form'),
    'add expense': () => setLocation('/expenses?openExpenseForm=true'),
    'record expense': () => setLocation('/expenses?openVoiceExpense=true'),
    'show dashboard': () => setLocation('/'),
    'show goals': () => setLocation('/goals'),
    'show expenses': () => setLocation('/expenses'),
    'show budget': () => setLocation('/budget-planner'),
    'show bank connections': () => setLocation('/bank-connections'),
    'show settings': () => setLocation('/settings'),
    'refresh data': () => {
      queryClient.invalidateQueries();
      toast({
        title: "Data Refreshed",
        description: "All data has been refreshed",
        variant: "default",
      });
    },
    'help': () => setIsShowingCommands(true),
    'hide help': () => setIsShowingCommands(false),
  };

  // Process the transcript to check for commands
  const processCommand = useCallback(() => {
    if (!transcript) return;
    
    const lowerTranscript = transcript.toLowerCase().trim();
    
    // Check if the transcript matches any of our commands
    for (const [command, handler] of Object.entries(commandHandlers)) {
      if (lowerTranscript.includes(command)) {
        handler();
        toast({
          title: "Command Recognized",
          description: `Executing: "${command}"`,
          variant: "default",
        });
        resetTranscript();
        return;
      }
    }
    
    // If we reach here, no command was recognized
    if (lowerTranscript.length > 0) {
      toast({
        title: "Unknown Command",
        description: `Sorry, I didn't understand "${lowerTranscript}". Try saying "help" for available commands.`,
        variant: "destructive",
      });
      resetTranscript();
    }
  }, [transcript, commandHandlers, resetTranscript]);

  // Toggle listening state
  const toggleListening = useCallback(() => {
    if (isListening) {
      SpeechRecognition.stopListening();
      processCommand(); // Process any final command before stopping
    } else {
      SpeechRecognition.startListening({ continuous: true });
    }
    setIsListening(!isListening);
  }, [isListening, processCommand]);

  // Process commands after a short delay to allow for complete phrases
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isListening && transcript) {
        processCommand();
      }
    }, 1500); // Wait 1.5 seconds after speech stops before processing

    return () => clearTimeout(timer);
  }, [transcript, isListening, processCommand]);

  // Check for browser support
  if (!browserSupportsSpeechRecognition) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Voice Commands Unavailable</CardTitle>
          <CardDescription>
            Your browser doesn't support speech recognition.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please try using a modern browser like Chrome, Edge, or Safari.</p>
        </CardContent>
      </Card>
    );
  }

  // Check microphone access
  if (!isMicrophoneAvailable) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Microphone Access Required</CardTitle>
          <CardDescription>
            Please allow microphone access to use voice commands.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full relative">
      <CardHeader className="p-4 sm:p-6 pb-0 sm:pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base sm:text-lg">Voice Command Center</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Speak commands to navigate and control the app
            </CardDescription>
          </div>
          <Badge 
            variant={isListening ? "default" : "outline"} 
            className="self-start sm:self-auto sm:ml-2 text-xs sm:text-sm py-0.5 px-1.5 sm:px-2"
          >
            {isListening ? "Listening" : "Paused"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-3 sm:pt-4">
        <div className="flex flex-col space-y-3 sm:space-y-4">
          <div className="p-2 sm:p-3 bg-muted rounded-md min-h-[50px] sm:min-h-[60px] flex items-center">
            {transcript ? (
              <p className="text-sm sm:text-base">{transcript}</p>
            ) : (
              <p className="text-sm sm:text-base text-muted-foreground">
                {isListening 
                  ? "Listening... Say 'help' for available commands." 
                  : "Click the microphone to start listening."}
              </p>
            )}
          </div>

          {isShowingCommands && (
            <div className="border rounded-md p-2 sm:p-3 mt-1 sm:mt-2">
              <h3 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">Available Commands:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                {availableCommands.map((cmd, index) => (
                  <div key={index} className="flex items-start space-x-1.5 sm:space-x-2">
                    <span className="text-[10px] sm:text-xs font-semibold bg-primary/10 p-0.5 sm:p-1 rounded">
                      {cmd.command}
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                      {cmd.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 sm:p-6 pt-2 sm:pt-3 flex flex-wrap sm:flex-nowrap justify-between gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 sm:h-9 sm:w-9"
          onClick={() => setIsShowingCommands(!isShowingCommands)}
        >
          {isShowingCommands ? 
            <StopCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : 
            <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          }
        </Button>
        <Button
          onClick={toggleListening}
          variant={isListening ? "destructive" : "default"}
          className={`text-xs sm:text-sm h-7 sm:h-9 ${isListening ? "animate-pulse" : ""}`}
        >
          {isListening ? (
            <>
              <MicOff className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /> 
              <span className="hidden xs:inline">Stop</span> Listening
            </>
          ) : (
            <>
              <Mic className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /> 
              <span className="hidden xs:inline">Start</span> Listening
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VoiceCommandCenter;