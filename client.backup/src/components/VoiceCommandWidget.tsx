import React, { useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";

const VoiceCommandWidget: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [, setLocation] = useLocation();

  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition || !isMicrophoneAvailable) {
    return null; // Don't render anything if speech recognition isn't available
  }

  const toggleListening = () => {
    if (isListening) {
      SpeechRecognition.stopListening();

      // Process the command
      if (transcript) {
        const command = transcript.toLowerCase().trim();

        if (
          command.includes("show income") ||
          command.includes("income history")
        ) {
          setLocation("/income-history");
          toast({ title: "Navigating to Income History" });
        } else if (command.includes("add income")) {
          setLocation("/income-form");
          toast({ title: "Opening Income Form" });
        } else if (
          command.includes("show dashboard") ||
          command.includes("go home")
        ) {
          setLocation("/");
          toast({ title: "Navigating to Dashboard" });
        } else if (command.includes("show goals")) {
          setLocation("/goals");
          toast({ title: "Navigating to Goals" });
        } else if (command.includes("show budget")) {
          setLocation("/budget-planner");
          toast({ title: "Navigating to Budget Planner" });
        } else if (
          command.includes("show bank") ||
          command.includes("bank connections")
        ) {
          setLocation("/bank-connections");
          toast({ title: "Navigating to Bank Connections" });
        } else if (command.includes("show settings")) {
          setLocation("/settings");
          toast({ title: "Navigating to Settings" });
        } else if (
          command.includes("voice assistant") ||
          command.includes("voice commands")
        ) {
          setLocation("/voice-commands");
          toast({ title: "Opening Voice Assistant" });
        } else if (command.includes("refresh data")) {
          queryClient.invalidateQueries();
          toast({ title: "Refreshing Data" });
        } else if (command.length > 0) {
          toast({
            title: "Unknown Command",
            description: "Try saying 'Show Dashboard' or 'Show Goals'",
            variant: "destructive",
          });
        }

        resetTranscript();
      }
    } else {
      resetTranscript();
      SpeechRecognition.startListening();
    }

    setIsListening(!isListening);
  };

  return (
    <Card className="shadow-md fixed bottom-4 right-4 z-50">
      <CardContent className="p-3">
        <div className="flex items-center space-x-2">
          {isListening && (
            <div className="text-sm max-w-[200px] truncate">
              {transcript || "Listening..."}
            </div>
          )}

          <Button
            size="sm"
            variant={isListening ? "destructive" : "default"}
            className={`rounded-full ${isListening ? "animate-pulse" : ""}`}
            onClick={toggleListening}
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceCommandWidget;
