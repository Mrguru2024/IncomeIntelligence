
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Camera, Upload, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

export default function ReceiptScanner() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { mutate: processReceipt, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest("/api/receipts/process", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Receipt processed successfully",
        description: "The receipt details have been extracted and saved.",
      });
      // Clear preview
      setPreviewUrl(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to process receipt",
        description: "There was an error processing the receipt. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Process receipt
      const formData = new FormData();
      formData.append('receipt', file);
      processReceipt(formData);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Implementation for camera capture would go here
      // You would need to create a video element and capture a frame
    } catch (error) {
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to scan receipts.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Receipt Scanner</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-4">
          {previewUrl && (
            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden">
              <img 
                src={previewUrl} 
                alt="Receipt preview" 
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
          )}
          
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Receipt
            </Button>
            
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleCameraCapture}
              disabled={isPending}
            >
              <Camera className="w-4 h-4 mr-2" />
              Scan Receipt
            </Button>
          </div>
          
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isPending}
          />
          
          {isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing receipt...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
