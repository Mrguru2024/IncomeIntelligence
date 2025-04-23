import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, ImageIcon, BookOpenCheck } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import BlogImageGenerator from './BlogImageGenerator';

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

interface BlogEditorProps {
  initialBlog?: BlogPost;
  onSave: (blog: BlogPost) => Promise<void>;
  isEdit?: boolean;
}

const defaultBlog: BlogPost = {
  title: '',
  content: '',
  category: 'general',
  tags: [],
  isDraft: true,
};

const BlogEditor: React.FC<BlogEditorProps> = ({
  initialBlog = defaultBlog,
  onSave,
  isEdit = false
}) => {
  const [blog, setBlog] = useState<BlogPost>(initialBlog);
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBlog(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setBlog(prev => ({ ...prev, category: value as BlogCategoryType }));
  };

  const handleIsDraftChange = (checked: boolean) => {
    setBlog(prev => ({ ...prev, isDraft: checked }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !blog.tags?.includes(tagInput.trim())) {
      setBlog(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setBlog(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag)
    }));
  };

  const handleImageGenerated = useCallback((imageUrl: string) => {
    setBlog(prev => ({ ...prev, imageUrl }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!blog.title) {
      toast({
        title: "Title Required",
        description: "Please add a title to your blog post.",
        variant: "destructive",
      });
      return;
    }
    
    if (!blog.content || blog.content.length < 100) {
      toast({
        title: "Content Required",
        description: "Please add more content to your blog post (minimum 100 characters).",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onSave(blog);
      toast({
        title: `Blog ${isEdit ? 'Updated' : 'Created'}`,
        description: `Your blog post has been ${isEdit ? 'updated' : 'created'} successfully.`,
      });
    } catch (error) {
      console.error('Error saving blog:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? 'update' : 'create'} blog post. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 md:grid-cols-5">
        <div className="space-y-4 md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>{isEdit ? 'Edit' : 'Create'} Blog Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={blog.title}
                  onChange={handleChange}
                  placeholder="Enter a catchy title"
                  className="w-full"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={blog.content}
                  onChange={handleChange}
                  placeholder="Write your blog post content here"
                  className="min-h-[300px] w-full"
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6 md:col-span-2">
          <BlogImageGenerator 
            blogTitle={blog.title}
            blogContent={blog.content}
            onImageGenerated={handleImageGenerated}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Blog Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={blog.category} 
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saving">Saving</SelectItem>
                    <SelectItem value="investing">Investing</SelectItem>
                    <SelectItem value="budgeting">Budgeting</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                
                {blog.tags && blog.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {blog.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 bg-muted text-xs rounded"
                      >
                        {tag}
                        <button
                          type="button"
                          className="ml-1 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="isDraft">Save as Draft</Label>
                <Switch
                  id="isDraft"
                  checked={blog.isDraft}
                  onCheckedChange={handleIsDraftChange}
                />
              </div>
              
              {blog.imageUrl && (
                <div className="space-y-2">
                  <Label>Selected Image</Label>
                  <div className="aspect-video overflow-hidden rounded border">
                    <img
                      src={blog.imageUrl}
                      alt="Blog post featured image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {blog.isDraft ? "Save Draft" : "Publish"}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center">
                  <BookOpenCheck className="mr-2 h-4 w-4" />
                  Publishing Checklist
                </h4>
                <ul className="space-y-1 text-sm">
                  <li className={`flex items-center ${blog.title ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <span className="mr-2">{blog.title ? '✓' : '○'}</span>
                    Title added
                  </li>
                  <li className={`flex items-center ${blog.content.length >= 100 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <span className="mr-2">{blog.content.length >= 100 ? '✓' : '○'}</span>
                    Content has at least 100 characters
                  </li>
                  <li className={`flex items-center ${blog.imageUrl ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <span className="mr-2">{blog.imageUrl ? '✓' : '○'}</span>
                    Featured image added
                  </li>
                  <li className={`flex items-center ${blog.category !== 'general' ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <span className="mr-2">{blog.category !== 'general' ? '✓' : '○'}</span>
                    Specific category selected
                  </li>
                  <li className={`flex items-center ${blog.tags && blog.tags.length > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <span className="mr-2">{blog.tags && blog.tags.length > 0 ? '✓' : '○'}</span>
                    At least one tag added
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
};

export default BlogEditor;