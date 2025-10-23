"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Logo from "@/components/common/Logo";
import { useToast } from "@/hooks/use-toast";
import { signUpWithEmail, signInWithGoogle } from "@/lib/firebase/auth";
import { Loader2 } from "lucide-react";

type UserRole = "homeowner" | "installer";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setGoogleLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast({ variant: "destructive", title: "Please select a role." });
      return;
    }
    setIsLoading(true);
    try {
      await signUpWithEmail(email, password, { fullName, role });
      toast({ title: "Account Created", description: "Welcome to LumenAI!" });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign-up Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Note: With Google Sign-In, we don't have a separate role selection step on this page.
      // You might handle this post-login, or set a default role.
      // Firestore user creation is handled within signInWithGoogle.
      toast({ title: "Account Created", description: "Welcome to LumenAI!" });
      router.push("/dashboard");
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Google Sign-up Failed",
        description: error.message,
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-sm">
             <div className="flex justify-center mb-6">
                <Logo />
            </div>
            <Card>
                <CardHeader className="text-center">
                <CardTitle className="font-headline text-2xl">Create an Account</CardTitle>
                <CardDescription>Join LumenAI to start your solar journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="full-name">Full Name</Label>
                            <Input id="full-name" placeholder="Max Power" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role">I am a...</Label>
                            <Select onValueChange={(value) => setRole(value as UserRole)} value={role}>
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="homeowner">Homeowner</SelectItem>
                                    <SelectItem value="installer">Installer / Dealer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading || isGoogleLoading}>
                          {isLoading && <Loader2 className="animate-spin" />}
                          {!isLoading && "Create account"}
                        </Button>
                    </div>
                  </form>
                   <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                      </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={handleGoogleSignUp} disabled={isLoading || isGoogleLoading}>
                      {isGoogleLoading ? <Loader2 className="animate-spin" /> : <svg className="w-4 h-4 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-79.9 61.9C304.7 100.8 277.4 88 248 88c-77.4 0-140.2 62.8-140.2 140s62.8 140 140.2 140c83.8 0 128.3-64.2 133.6-96.9H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>}
                      Sign up with Google
                  </Button>
                  <div className="mt-4 text-center text-sm">
                      Already have an account?{" "}
                      <Link href="/login" className="underline">
                      Log in
                      </Link>
                  </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
