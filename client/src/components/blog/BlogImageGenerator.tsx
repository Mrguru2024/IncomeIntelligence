import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ImagePlus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface BlogImageGeneratorProps {
  blogTitle: string;
  blogContent: string;
  onImageGenerated: (imageUrl: string) => void;
}

const BlogImageGenerator: React.FC<BlogImageGeneratorProps> = ({
  blogTitle,
  blogContent,
  onImageGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateImage = async () => {
    if (!blogTitle || !blogContent) {
      toast({
        title: "Missing content",
        description: "Please add a title and some content before generating an image.",
        variant: "destructive",
      });
      return;
    }

    if (blogContent.length < 20) {
      toast({
        title: "Content too short",
        description: "Please add more content to help generate a relevant image.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await apiRequest('POST', '/api/blog/generate-image', {
        blogTitle,
        blogContent,
        style: "modern financial illustration",
        financialTopic: detectFinancialTopic(blogContent)
      });

      const data = await response.json();

      if (data.error) {
        setGenerationError(data.message || "Failed to generate image");
        toast({
          title: "Image Generation Failed",
          description: data.message || "There was a problem creating your image. Please try again.",
          variant: "destructive",
        });
      } else {
        setPreviewImage(data.imageUrl);
        onImageGenerated(data.imageUrl);
        toast({
          title: "Image Generated",
          description: "Your blog image has been created successfully.",
        });
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setGenerationError("Connection error. Please try again later.");
      toast({
        title: "Connection Error",
        description: "Failed to connect to the image generation service. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Simple function to detect financial topic from content
  const detectFinancialTopic = (content: string): string | undefined => {
    const topics = [
      "investing", "saving", "budgeting", "retirement", "stocks", "bonds",
      "mutual funds", "etf", "real estate", "taxes", "insurance", "debt",
      "credit", "mortgage", "loan", "income", "expense", "financial planning"
    ];

    const contentLower = content.toLowerCase();
    
    for (const topic of topics) {
      if (contentLower.includes(topic)) {
        return topic;
      }
    }
    
    return undefined;
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Blog Image</h3>
            <Button
              onClick={generateImage}
              disabled={isGenerating || !blogTitle || blogContent.length < 20}
              className="flex items-center gap-2"
              variant={previewImage ? "outline" : "default"}
              size="sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : previewImage ? (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span>Regenerate</span>
                </>
              ) : (
                <>
                  <ImagePlus className="h-4 w-4" />
                  <span>Generate Image</span>
                </>
              )}
            </Button>
          </div>

          {generationError && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {generationError}
            </div>
          )}

          <div className="border border-dashed rounded-md flex items-center justify-center overflow-hidden bg-muted/20">
            {previewImage ? (
              <div className="relative w-full h-48 md:h-64">
                <img
                  src={previewImage}
                  alt="Generated blog illustration"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2">
                  <Button
                    onClick={generateImage}
                    variant="secondary"
                    size="sm"
                    className="bg-background/80 backdrop-blur-sm"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-48 md:h-64 w-full flex flex-col gap-2 items-center justify-center text-muted-foreground">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-10 w-10 animate-spin" />
                    <p className="text-sm">Creating your custom blog image...</p>
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-10 w-10" />
                    <p className="text-sm text-center max-w-xs">
                      {!blogTitle || blogContent.length < 20
                        ? "Add a title and content to generate an image"
                        : "Generate an AI image for your blog post"}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Powered by AI. Images are generated based on your blog content.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogImageGenerator;