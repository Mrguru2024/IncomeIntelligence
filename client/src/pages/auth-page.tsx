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
  CardFooter,
  CardHeader,
  CardTitle,
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
// Using mock Firebase implementation
import { auth, googleProvider, getRedirectResult, signInWithPopup } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { testSanityConnection } from "@/lib/sanityTest"; // Added import


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
  const [isSocialLoginPending, setIsSocialLoginPending] = useState(false);
  const { loginMutation } = useAuth();

  // Removed redirect result check as it's not needed

  // Google Sign In function - temporarily disabled
  const handleGoogleSignIn = async () => {
    try {
      toast({
        title: "Social login disabled",
        description: "Please use direct login with username and password. Try admin/password123",
      });
    } catch (error: any) {
      console.error("Google sign-in error:", error);
    }
  };

  // Check if user is logged in
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0], {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (res.ok) return res.json();
        return null;
      } catch (error) {
        console.error("Error fetching user:", error);
        return null;
      }
    },
  });

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

  // Login mutation

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterFormValues) => {
      const res = await apiRequest("POST", "/api/auth/register", {
        username: userData.username,
        email: userData.email,
        password: userData.password,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Registration failed. Please try again.",
        );
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Registration successful",
        description: "Your account has been created! You can now log in.",
      });
      setActiveTab("login");
      registerForm.reset();

      // Pre-fill login form with registered username
      loginForm.setValue("username", registerForm.getValues("username"));
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description:
          error.message ||
          "There was an error creating your account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync({
        identifier: data.username,
        password: data.password
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    }
  };

  const onRegisterSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate(values);
  };

  // If user is already logged in, redirect to home page
  useEffect(() => {
    testSanityConnection().then(success => {
      console.log("Sanity connection test:", success ? "Success" : "Failed");
    });
  }, []); // Added Sanity connection test

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

                  <div className="grid grid-cols-2 gap-3 w-full">
                    <Button
                      variant="outline"
                      className="h-11"
                      onClick={handleGoogleSignIn}
                      disabled={isSocialLoginPending || loginMutation.isPending}
                    >
                      {isSocialLoginPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          <span className="text-sm">Signing in...</span>
                        </>
                      ) : (
                        <>
                          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </svg>
                          <span className="text-sm">Google</span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-11"
                      onClick={() => {
                        toast({
                          title: "Coming soon",
                          description:
                            "GitHub authentication will be available soon",
                        });
                      }}
                    >
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                        />
                      </svg>
                      <span className="text-sm">GitHub</span>
                    </Button>
                  </div>
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

                  <div className="grid grid-cols-2 gap-3 w-full">
                    <Button
                      variant="outline"
                      className="h-11"
                      onClick={handleGoogleSignIn}
                      disabled={
                        isSocialLoginPending || registerMutation.isPending
                      }
                    >
                      {isSocialLoginPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          <span className="text-sm">Signing in...</span>
                        </>
                      ) : (
                        <>
                          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </svg>
                          <span className="text-sm">Google</span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-11"
                      onClick={() => {
                        toast({
                          title: "Coming soon",
                          description:
                            "GitHub authentication will be available soon",
                        });
                      }}
                    >
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                        />
                      </svg>
                      <span className="text-sm">GitHub</span>
                    </Button>
                  </div>
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