import OpenAI from "openai";
import { promises as fs } from "fs";
import { join, resolve } from "path";
import { createHash } from "crypto";

// The OpenAI client instance
let openai: OpenAI;

/**
 * Initialize the OpenAI client if not already initialized
 */
export function initializeImageGenerationService() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required for image generation');
  }

  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  console.log('Image generation service initialized successfully');
  return openai;
}

// Create cache directory for generated images if it doesn't exist
const CACHE_DIR = resolve(process.cwd(), 'public', 'generated-images');
try {
  fs.mkdir(CACHE_DIR, { recursive: true });
} catch (error) {
  console.error('Error creating cache directory:', error);
}

/**
 * Cache settings for generated images
 */
const IMAGE_GENERATION_SETTINGS = {
  CACHE_ENABLED: true,
  CACHE_EXPIRY: 1000 * 60 * 60 * 24 * 30, // 30 days
  DEFAULT_SIZE: "1024x1024" as const,
  DEFAULT_QUALITY: "standard" as const,
  DEFAULT_MODEL: "dall-e-3" as const,
  DEFAULT_STYLE: "vivid" as const,
};

/**
 * Generate a hash key from the prompt for caching purposes
 */
function generateCacheKey(prompt: string, size: string): string {
  return createHash('md5').update(`${prompt}-${size}`).digest('hex');
}

/**
 * Check if an image exists in the cache
 */
async function checkImageCache(cacheKey: string): Promise<string | null> {
  try {
    const imagePath = join(CACHE_DIR, `${cacheKey}.png`);
    await fs.access(imagePath);
    
    // Get file stats to check the creation time
    const stats = await fs.stat(imagePath);
    const now = Date.now();
    const fileAge = now - stats.birthtime.getTime();
    
    // If the file is older than the cache expiry, return null to regenerate
    if (fileAge > IMAGE_GENERATION_SETTINGS.CACHE_EXPIRY) {
      return null;
    }
    
    return `/generated-images/${cacheKey}.png`;
  } catch (error) {
    return null;
  }
}

/**
 * Save an image to the cache
 */
async function saveImageToCache(cacheKey: string, imageBuffer: Buffer): Promise<string> {
  try {
    const imagePath = join(CACHE_DIR, `${cacheKey}.png`);
    await fs.writeFile(imagePath, imageBuffer);
    return `/generated-images/${cacheKey}.png`;
  } catch (error) {
    console.error('Error saving image to cache:', error);
    throw error;
  }
}

/**
 * Generate an image for a blog post based on its title or content
 */
export async function generateBlogImage(
  prompt: string,
  options: {
    size?: "1024x1024" | "1792x1024" | "1024x1792";
    quality?: "standard" | "hd";
    style?: "vivid" | "natural";
  } = {}
): Promise<{ url: string, error?: boolean, message?: string }> {
  // Ensure OpenAI client is initialized
  if (!openai) {
    try {
      initializeImageGenerationService();
    } catch (error) {
      return { 
        url: '', 
        error: true, 
        message: error instanceof Error ? error.message : 'Failed to initialize image generation service' 
      };
    }
  }

  const size = options.size || IMAGE_GENERATION_SETTINGS.DEFAULT_SIZE;
  const quality = options.quality || IMAGE_GENERATION_SETTINGS.DEFAULT_QUALITY;
  const style = options.style || IMAGE_GENERATION_SETTINGS.DEFAULT_STYLE;
  
  // Generate a cache key based on the prompt and image size
  const cacheKey = generateCacheKey(prompt, size);

  // Check if the image is already in the cache
  if (IMAGE_GENERATION_SETTINGS.CACHE_ENABLED) {
    const cachedImagePath = await checkImageCache(cacheKey);
    if (cachedImagePath) {
      console.log('Using cached image for prompt:', prompt.substring(0, 30) + '...');
      return { url: cachedImagePath };
    }
  }

  try {
    console.log('Generating image with prompt:', prompt.substring(0, 30) + '...');
    
    // Generate the image using DALL-E 3
    const response = await openai.images.generate({
      model: IMAGE_GENERATION_SETTINGS.DEFAULT_MODEL,
      prompt,
      n: 1,
      size,
      quality,
      style,
      response_format: "url",
    });

    const imageUrl = response.data[0].url;
    
    if (!imageUrl) {
      return { url: '', error: true, message: 'No image URL returned from OpenAI' };
    }

    // Download the image
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    
    // Save the image to cache
    const savedImagePath = await saveImageToCache(cacheKey, imageBuffer);
    
    return { url: savedImagePath };
  } catch (error) {
    console.error('Error generating image:', error);
    return { 
      url: '', 
      error: true, 
      message: error instanceof Error ? error.message : 'Unknown error during image generation' 
    };
  }
}

/**
 * Format a blog post title into an appropriate image generation prompt
 */
export function formatBlogImagePrompt(title: string, topic?: string): string {
  // Default styling for financial blog post images
  const basePrompt = "Create a professional, modern illustration for a financial blog post";
  
  // If title is provided, use it to create a more specific prompt
  if (title) {
    return `${basePrompt} titled "${title}". The image should be clean, minimalist, and suitable for a financial management application. Use a blue and purple color scheme that matches the Stackr Finance brand. No text in the image.`;
  }
  
  // If only topic is provided
  if (topic) {
    return `${basePrompt} about ${topic}. The image should be clean, minimalist, and suitable for a financial management application. Use a blue and purple color scheme that matches the Stackr Finance brand. No text in the image.`;
  }
  
  // Default generic prompt
  return `${basePrompt}. The image should be clean, minimalist with abstract financial concepts. Use a blue and purple color scheme that matches the Stackr Finance brand. No text in the image.`;
}