import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, CircleDollarSign } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";


// Login validation schema
const loginSchema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

// Registration validation schema
const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Get user data from our auth hook
  const { user, isLoading: userLoading } = useAuth();

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (user && !userLoading) {
      setLocation("/");
    }
  }, [user, userLoading, setLocation]);

  // Login form hook
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onChange"
  });

  // Register form hook
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Get auth mutations from the useAuth hook
  const { loginMutation, registerMutation } = useAuth();

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync({
        identifier: data.username,
        password: data.password
      });
    } catch (error) {
      console.error('Login error:', error);
      // Toast is handled in the mutation itself
    }
  };

  const onRegisterSubmit = (values: RegisterFormValues) => {
    // Only pass the needed fields
    registerMutation.mutate({
      username: values.username,
      email: values.email,
      password: values.password
    });
    
    // Handle post-registration actions
    if (registerMutation.isSuccess) {
      setActiveTab("login");
      registerForm.reset();
      // Pre-fill login form with registered username
      loginForm.setValue("username", registerForm.getValues("username"));
    }
  };

  // Empty useEffect, we don't need to test Sanity right now
  useEffect(() => {
    console.log("Auth page mounted");
  }, []);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (user) {
    // We shouldn't see this as useEffect will redirect
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-background">
      {/* Auth Form Section */}
      <div className="flex flex-col justify-center items-center p-6 lg:p-12 lg:w-1/2">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <CircleDollarSign className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground">
              Stackr
            </h1>
            <p className="text-muted-foreground">
              Take control of your finances
            </p>
          </div>

          <Tabs
            defaultValue="login"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-2 w-80">
                <TabsTrigger
                  value="login"
                  className="text-sm py-2 px-4 whitespace-nowrap"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="text-sm py-2 px-4 whitespace-nowrap"
                >
                  Create Account
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="login" className="space-y-4 pt-2">
              <Card className="border-border/40 shadow-md">
                <CardHeader className="space-y-1 pt-6">
                  <CardTitle className="text-2xl font-semibold">
                    Welcome back
                  </CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                      className="space-y-5"
                    >
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">
                              Username or Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="h-11"
                                placeholder="Enter your username or email"
                                {...field}
                                disabled={loginMutation.isPending}
                                autoComplete="username"
                              />
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
                            <FormLabel className="text-base">
                              Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="h-11"
                                type="password"
                                placeholder="Enter your password"
                                {...field}
                                disabled={loginMutation.isPending}
                                autoComplete="current-password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full h-11 text-base font-medium mt-2"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-6 pb-6">
                  <div className="text-sm text-center text-muted-foreground">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        toast({
                          title: "Coming soon",
                          description:
                            "Password reset functionality will be available soon",
                        });
                      }}
                      className="hover:text-primary underline underline-offset-4 transition-colors"
                    >
                      Forgot your password?
                    </a>
                  </div>

                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  {/* Removed Social Login Buttons */}
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 pt-2">
              <Card className="border-border/40 shadow-md">
                <CardHeader className="space-y-1 pt-6">
                  <CardTitle className="text-2xl font-semibold">
                    Create an account
                  </CardTitle>
                  <CardDescription>
                    Enter your details to get started with Stackr
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                      className="space-y-5"
                    >
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">
                              Username
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="h-11"
                                placeholder="Choose a username"
                                {...field}
                                disabled={registerMutation.isPending}
                                autoComplete="username"
                              />
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
                            <FormLabel className="text-base">Email</FormLabel>
                            <FormControl>
                              <Input
                                className="h-11"
                                type="email"
                                placeholder="Enter your email"
                                {...field}
                                disabled={registerMutation.isPending}
                                autoComplete="email"
                              />
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
                            <FormLabel className="text-base">
                              Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="h-11"
                                type="password"
                                placeholder="Create a password"
                                {...field}
                                disabled={registerMutation.isPending}
                                autoComplete="new-password"
                              />
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
                            <FormLabel className="text-base">
                              Confirm Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="h-11"
                                type="password"
                                placeholder="Confirm your password"
                                {...field}
                                disabled={registerMutation.isPending}
                                autoComplete="new-password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full h-11 text-base font-medium mt-2"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-6 pt-2 pb-6">
                  <div className="text-sm text-center text-muted-foreground">
                    By registering, you agree to our
                    <a
                      href="#"
                      className="ml-1 hover:text-primary underline underline-offset-4 transition-colors"
                    >
                      Terms of Service
                    </a>{" "}
                    and
                    <a
                      href="#"
                      className="ml-1 hover:text-primary underline underline-offset-4 transition-colors"
                    >
                      Privacy Policy
                    </a>
                  </div>

                  {/* Removed Social Login Buttons */}
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-primary/20 via-primary/10 to-background p-12 lg:w-1/2">
        <div className="max-w-md mx-auto space-y-8">
          <div>
            <h2 className="text-4xl font-bold mb-4 tracking-tight">
              Manage your income the{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                smart way
              </span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Stackr helps service providers manage income with our innovative
              40/30/30 rule, allocating funds for needs, investments, and
              savings automatically.
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">
                  Automated Income Allocation
                </h3>
                <p className="text-muted-foreground">
                  Automatically split your income using our 40/30/30 rule or
                  customize your own formula.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">
                  AI-Powered Financial Advice
                </h3>
                <p className="text-muted-foreground">
                  Get personalized financial advice based on your income
                  patterns and spending habits.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Visual Goal Tracking</h3>
                <p className="text-muted-foreground">
                  Set financial goals and track your progress with intuitive
                  dashboards and visualizations.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">
                  Bank Account Integration
                </h3>
                <p className="text-muted-foreground">
                  Connect your bank accounts for automated income tracking and
                  seamless financial management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sanity connection test removed as it's not needed