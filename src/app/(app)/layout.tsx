"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from "@/components/common/Header";
import ChatAssistant from "@/components/chat/ChatAssistant";
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>{children}</main>
      <ChatAssistant />
    </div>
  );
}
