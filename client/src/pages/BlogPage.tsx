import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PenLine, Calendar, Tags, Clock, ArrowRight, BookOpen, PlusCircle, LockIcon } from 'lucide-react';
import { Link } from 'wouter';

// Mock data for blog posts - in a real implementation this would come from an API
const mockBlogPosts = [
  {
    id: 1,
    title: 'The 40/30/30 Rule: A Simple Guide to Financial Freedom',
    excerpt: 'Discover how allocating your income with the 40/30/30 rule can transform your financial future as a service provider.',
    category: 'budgeting',
    tags: ['budget', 'income allocation', 'financial freedom'],
    // Using placeholder since we don't have these assets yet
    imageUrl: 'https://placehold.co/600x400/3182ce/FFFFFF?text=40/30/30+Rule',
    date: '2025-04-10',
    readTime: '5 min read'
  },
  {
    id: 2,
    title: 'Smart Investments for Freelancers in 2025',
    excerpt: 'Learn the best investment strategies tailored specifically for freelancers and service providers in the current market.',
    category: 'investing',
    tags: ['investing', 'freelancers', 'portfolio'],
    imageUrl: 'https://placehold.co/600x400/4c51bf/FFFFFF?text=Freelancer+Investments',
    date: '2025-03-28',
    readTime: '7 min read'
  },
  {
    id: 3,
    title: 'Maximizing Tax Deductions for Service Providers',
    excerpt: 'Don\'t miss out on these often-overlooked tax deductions that could save you thousands this tax season.',
    category: 'taxes',
    tags: ['taxes', 'deductions', 'self-employed'],
    imageUrl: 'https://placehold.co/600x400/10b981/FFFFFF?text=Tax+Deductions',
    date: '2025-03-15',
    readTime: '6 min read'
  }
];

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  date: string;
  readTime: string;
}

// Helper function to format date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const BlogPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  // In a real implementation, this would fetch data from an API
  const { data: blogPosts, isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ['/api/blogs'],
    // For now, we're using mock data
    initialData: mockBlogPosts
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (error) {
    toast({
      title: "Error loading blog posts",
      description: "Failed to load blog posts. Please try again later.",
      variant: "destructive",
    });
    
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Unable to load blog posts</h2>
        <p className="text-muted-foreground">Please try refreshing the page</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Financial Insights Blog
        </h1>
        {isAuthenticated ? (
          <Link href="/blog/editor">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Post
            </Button>
          </Link>
        ) : (
          <Link href="/auth">
            <Button variant="outline" className="border-blue-500 text-blue-600">
              <LockIcon className="mr-2 h-4 w-4" />
              Sign in to Write
            </Button>
          </Link>
        )}
      </div>
      
      <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
        Expert financial advice and strategies tailored for service providers and freelancers. Discover how to manage, grow, and optimize your income.
      </p>
      
      <Separator className="my-8" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
            {post.imageUrl && (
              <div className="aspect-video overflow-hidden">
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-center mb-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {post.category}
                </span>
                <span className="mx-2 text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {post.readTime}
                </span>
              </div>
              <CardTitle className="text-xl line-clamp-2 hover:text-primary transition-colors">
                {post.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-3 mb-4">
                {post.excerpt}
              </p>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(post.date)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t pt-4">
              <div className="flex flex-wrap gap-1">
                {post.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                    #{tag}
                  </span>
                ))}
                {post.tags.length > 2 && (
                  <span className="text-xs text-muted-foreground">
                    +{post.tags.length - 2} more
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" className="text-primary">
                Read More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="my-12 p-8 bg-primary/5 rounded-xl flex flex-col md:flex-row items-center justify-between">
        <div className="mb-6 md:mb-0 md:mr-8">
          <h2 className="text-2xl font-bold mb-2">Want to share your financial wisdom?</h2>
          <p className="text-muted-foreground">
            Create your own blog posts and help others learn from your financial experiences.
          </p>
        </div>
        {isAuthenticated ? (
          <Link href="/blog/editor">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <PenLine className="mr-2 h-5 w-5" />
              Start Writing
            </Button>
          </Link>
        ) : (
          <Link href="/auth">
            <Button size="lg" variant="outline" className="border-blue-500 text-blue-600">
              <LockIcon className="mr-2 h-5 w-5" />
              Sign in to Write
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default BlogPage;