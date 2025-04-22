import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Redirect, useLocation } from 'wouter';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Check, PieChart, Target, DollarSign } from 'lucide-react';

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Register form schema
const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>('login');
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Set up login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  
  // Set up register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  // Handle login form submission
  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        toast({
          title: 'Login successful',
          description: 'Welcome back to Stackr Finance!',
        });
      },
    });
  };
  
  // Handle register form submission
  const onRegisterSubmit = (values: RegisterFormValues) => {
    // Omit confirmPassword when sending to API
    const { confirmPassword, ...registerData } = values;
    
    registerMutation.mutate(registerData, {
      onSuccess: () => {
        toast({
          title: 'Registration successful',
          description: 'Welcome to Stackr Finance!',
        });
        // Redirect new users to onboarding flow
        setTimeout(() => {
          setLocation('/onboarding');
        }, 1000);
      },
    });
  };
  
  // Navigation to the GREEN version
  const goToGreenVersion = () => {
    window.location.href = '/green';
  };

  // If the user is already logged in, redirect to home page
  if (user) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Firebase Error Notification Banner */}
      <div className="bg-green-600 text-white p-4 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center">
          <div className="mb-3 sm:mb-0 sm:mr-4">
            <h3 className="text-lg font-bold">⚠️ Having trouble with login?</h3>
            <p className="text-sm">We're fixing some Firebase dependencies. Try our Firebase-free version:</p>
          </div>
          <button 
            onClick={goToGreenVersion}
            className="bg-white text-green-600 px-4 py-2 rounded-md font-bold hover:bg-green-50 transition-colors"
          >
            Launch GREEN Version
          </button>
        </div>
      </div>
    
      <div className="flex flex-1">
        {/* Left Column - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
              Stackr Finance
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your personal finance tracker designed for service providers
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          'Login'
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button 
                    variant="link" 
                    onClick={() => setActiveTab('register')}
                  >
                    Don't have an account? Register
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Register Form */}
            <TabsContent value="register" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Register</CardTitle>
                  <CardDescription>
                    Create a new account to get started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Choose a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Confirm your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          'Register'
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button 
                    variant="link" 
                    onClick={() => setActiveTab('login')}
                  >
                    Already have an account? Login
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Right Column - Hero */}
      <div className="hidden md:flex flex-1 bg-gradient-to-b from-primary/90 to-indigo-600 text-white">
        <div className="flex flex-col justify-center p-12 max-w-lg mx-auto">
          <h2 className="text-4xl font-bold mb-6">Manage Your Finances with Confidence</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Income Splitting</h3>
                <p className="text-white/80">Track your income with our customizable 40/30/30 split system for Needs, Investments, and Savings.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <PieChart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">AI-Powered Insights</h3>
                <p className="text-white/80">Get personalized financial advice and forecasting based on your spending patterns.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Goal Setting</h3>
                <p className="text-white/80">Define and track your financial goals with visual progress indicators.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Bank Integration</h3>
                <p className="text-white/80">Connect your bank accounts for automatic transaction tracking and real-time balance updates.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-sm text-white/60 italic">
            "I've been using Stackr for 3 months and it's completely transformed how I manage my locksmith business finances." — John D.
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}