"use client";

import { useState } from 'react';
import { useFirestore, useCollection, useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, Eye, PlusCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

type Post = {
    id: string;
    title: string;
    content: string;
    authorName: string;
    authorPhotoURL?: string;
    createdAt: { seconds: number, nanoseconds: number };
    commentCount?: number;
    viewCount?: number;
};

function CreatePostDialog() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleCreatePost = async () => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: "You must be logged in to post." });
            return;
        }
        if (!title.trim() || !content.trim()) {
            toast({ variant: 'destructive', title: "Title and content cannot be empty." });
            return;
        }

        setIsLoading(true);
        try {
            const postsCollection = collection(firestore, 'forumPosts');
            await addDoc(postsCollection, {
                title,
                content,
                authorId: user.uid,
                authorName: user.displayName || 'Anonymous User',
                authorPhotoURL: user.photoURL || '',
                createdAt: serverTimestamp(),
                commentCount: 0,
                viewCount: 0,
            });
            toast({ title: "Post created successfully!" });
            setTitle('');
            setContent('');
            setIsOpen(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Failed to create post", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Post
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a New Post</DialogTitle>
                    <DialogDescription>Share your thoughts with the community.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Input 
                        placeholder="Post Title" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                    />
                    <Textarea 
                        placeholder="What's on your mind?" 
                        value={content} 
                        onChange={(e) => setContent(e.target.value)}
                        rows={6}
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={handleCreatePost} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Post
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function SolarityHubPage() {
  const firestore = useFirestore();
  const { data: posts, loading } = useCollection<Post>(firestore, 'forumPosts');

  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
            Solarity Hub
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Ask questions, share experiences, and learn from other solar enthusiasts.
          </p>
        </div>
        <CreatePostDialog />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
            {posts && posts.length > 0 ? (
                posts.map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={post.authorPhotoURL} alt={post.authorName} />
                                <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{post.authorName}</p>
                                <p className="text-sm text-muted-foreground">
                                    {post.createdAt ? formatDistanceToNow(new Date(post.createdAt.seconds * 1000), { addSuffix: true }) : 'Just now'}
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Link href={`/solarity-hub/${post.id}`} className="block">
                            <h2 className="font-headline text-xl font-semibold hover:text-primary transition-colors">{post.title}</h2>
                            <p className="mt-2 text-muted-foreground line-clamp-2">{post.content}</p>
                        </Link>
                    </CardContent>
                    <CardFooter className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.commentCount || 0} Replies</span>
                        </div>
                        <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>{post.viewCount || 0} Views</span>
                        </div>
                    </CardFooter>
                    </Card>
                ))
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h3 className="text-xl font-semibold">No Posts Yet</h3>
                    <p className="text-muted-foreground mt-2">Be the first to start a conversation!</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
}
