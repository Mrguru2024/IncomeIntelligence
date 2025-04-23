import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import BlogEditor from '@/components/blog/BlogEditor';
import { apiRequest } from '@/lib/queryClient';

type BlogCategoryType = 'saving' | 'investing' | 'budgeting' | 'income' | 'expense' | 'general';

interface BlogPost {
  id?: number;
  title: string;
  content: string;
  category: BlogCategoryType;
  tags?: string[];
  imageUrl?: string;
  isDraft: boolean;
  datePublished?: string;
  authorId?: number;
}

const BlogEditorPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSaveBlog = async (blog: BlogPost) => {
    try {
      // For demo purposes, we're just logging the blog data
      console.log('Saving blog:', blog);
      
      // In a real implementation, you would send this to your backend
      // const response = await apiRequest('POST', '/api/blogs', blog);
      // const savedBlog = await response.json();
      
      // Simulate a delay for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Invalidate queries for blogs to trigger a refresh elsewhere
      queryClient.invalidateQueries({ queryKey: ['/api/blogs'] });
      
      return;
    } catch (error) {
      console.error('Error saving blog:', error);
      toast({
        title: 'Error',
        description: 'Failed to save the blog post. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Create New Blog Post
      </h1>
      <BlogEditor onSave={handleSaveBlog} />
    </div>
  );
};

export default BlogEditorPage;