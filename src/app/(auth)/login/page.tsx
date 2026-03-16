"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Github, Loader2, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<string>("signin");

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "oauth_error") {
      setErrorMsg("Failed to authenticate with the chosen provider. Please try again.");
    } else if (error === "unauthorized") {
      setErrorMsg("Please sign in to access the AI summarizer.");
    } else if (error) {
      // Allow specific Supabase error messages while sanitizing others
      const safeErrors = ["Invalid login credentials", "Email not confirmed", "User already registered"];
      if (safeErrors.some(se => error.toLowerCase().includes(se.toLowerCase()))) {
        setErrorMsg(error);
      } else {
        setErrorMsg("An error occurred during authentication.");
      }
    }
  }, [searchParams]);

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to sign in with ${provider}`;
      setErrorMsg(message);
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      if (activeTab === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
      } else {
        const name = formData.get("name") as string;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });
        if (error) throw error;
        // On success, either redirect or show verification message
        router.push("/dashboard"); 
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full animate-in zoom-in-95 duration-500">
      <Card className="glass-card border-border/50 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Authentication Portal</CardDescription>
        </CardHeader>
        
        <CardContent className="pt-4">
          {errorMsg && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-sm animate-in fade-in zoom-in-95">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          <Tabs defaultValue="signin" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50 h-10 border border-border/50">
              <TabsTrigger value="signin" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all">Create Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4 pt-2 mt-0 focus-visible:outline-none focus-visible:ring-0">
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2 max-w-[320px] mx-auto">
                  <Label htmlFor="email-signin" className="block text-center mb-2">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="email-signin" 
                      name="email"
                      type="email" 
                      placeholder="name@example.com" 
                      className="pl-10 h-12 text-center text-base bg-secondary/30 border-border/50 focus-visible:ring-primary/50 transition-all font-mono"
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2 max-w-[320px] mx-auto mt-6">
                  <div className="text-center mb-2">
                    <Label htmlFor="password-signin">Password</Label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="password-signin" 
                      name="password"
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10 h-12 text-center text-base bg-secondary/30 border-border/50 focus-visible:ring-primary/50 transition-all font-mono tracking-widest"
                      required 
                    />
                  </div>
                  <div className="text-center mt-2">
                    <a href="#" className="text-xs text-primary hover:underline underline-offset-4">Forgot password?</a>
                  </div>
                </div>
                <div className="max-w-[320px] mx-auto mt-6">
                  <Button type="submit" className="w-full h-12 text-base shadow-lg shadow-primary/20 transition-all" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <>Sign in <ArrowRight className="ml-2 h-5 w-5" /></>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 pt-2 mt-0 focus-visible:outline-none focus-visible:ring-0">
              <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2 max-w-[320px] mx-auto">
                  <Label htmlFor="name-signup" className="block text-center mb-2">Full Name</Label>
                  <div className="relative">
                    <Input 
                      id="name-signup" 
                      name="name"
                      type="text" 
                      placeholder="John Doe" 
                      className="h-12 text-center text-base bg-secondary/30 border-border/50 focus-visible:ring-primary/50 transition-all font-mono"
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2 max-w-[320px] mx-auto mt-4">
                  <Label htmlFor="email-signup" className="block text-center mb-2">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="email-signup" 
                      name="email"
                      type="email" 
                      placeholder="name@example.com" 
                      className="pl-10 h-12 text-center text-base bg-secondary/30 border-border/50 focus-visible:ring-primary/50 transition-all font-mono"
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2 max-w-[320px] mx-auto mt-4">
                  <Label htmlFor="password-signup" className="block text-center mb-2">Create Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="password-signup" 
                      name="password"
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10 h-12 text-center text-base bg-secondary/30 border-border/50 focus-visible:ring-primary/50 transition-all font-mono tracking-widest"
                      required 
                    />
                  </div>
                </div>
                <div className="max-w-[320px] mx-auto mt-6">
                  <Button type="submit" className="w-full h-12 text-base shadow-lg shadow-primary/20 transition-all" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-6 text-center text-sm">
            <span className="absolute left-0 top-1/2 w-full -translate-y-1/2 border-t border-border/50"></span>
            <span className="relative bg-background px-2 text-muted-foreground text-xs uppercase tracking-wider">
              Or continue with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="w-full bg-secondary/30 border-border/50 hover:bg-secondary/80 gap-2"
              disabled={isLoading}
              onClick={() => handleOAuthSignIn("github")}
            >
              <Github className="h-4 w-4" /> Github
            </Button>
            <Button
              variant="outline"
              className="w-full bg-secondary/30 border-border/50 hover:bg-secondary/80 gap-2"
              disabled={isLoading}
              onClick={() => handleOAuthSignIn("google")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/50 bg-secondary/20 pt-4 pb-4 px-6 text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </CardFooter>
      </Card>
    </div>
  );
}
