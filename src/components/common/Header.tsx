"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/common/Logo";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Menu, LogOut } from "lucide-react";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { signOut } from "@/lib/firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const allNavLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analysis", label: "Analysis" },
  { href: "/installers", label: "Installers" },
  { href: "/solarity-hub", label: "Solarity Hub" },
  { href: "/subsidies", label: "Subsidies" },
];

export default function Header() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { data: userData } = useDoc<{role: string}>(firestore, 'users', user?.uid);

  const navLinks = useMemo(() => {
    if (userData?.role === 'installer') {
      return allNavLinks.filter(link => link.href === '/dashboard' || link.href === '/subsidies');
    }
    return allNavLinks;
  }, [userData]);


  const handleSignOut = async () => {
    await signOut();
  };
  
  const userInitial = user?.displayName?.charAt(0) || user?.email?.charAt(0) || "?";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Logo />
        </div>
        <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <SheetHeader>
                        <SheetTitle>
                          <VisuallyHidden>Navigation</VisuallyHidden>
                        </SheetTitle>
                    </SheetHeader>
                    <div className="px-2 pt-6">
                        <Logo />
                        <nav className="mt-8 flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                key={link.href}
                                href={link.href}
                                className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {user && navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
             {user ? (
              <>
                <Avatar>
                  <AvatarImage src={user.photoURL ?? ''} />
                  <AvatarFallback>{userInitial.toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button onClick={handleSignOut} variant="ghost" size="icon" aria-label="Sign out">
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
