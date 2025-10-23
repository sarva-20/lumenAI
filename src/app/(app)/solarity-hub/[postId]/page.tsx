"use client";

import { useState } from 'react';
import { useFirestore, useDoc, useCollection, useUser } from '@/firebase';
import { Loader2, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

type Post = {
    id: string;
    title: string;
    content: string;
    authorName: string;
    authorPhotoURL?: string;
    createdAt: { seconds: number, nanoseconds: number };
};

type Comment = {
    id: string;
    content: string;
    authorName: string;
    authorPhotoURL?: string;
    createdAt: { seconds: number, nanoseconds: number };
};

export default function PostPage({ params }: { params: { postId: string } }) {
    const { postId } = params;
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();

    const { data: post, loading: postLoading } = useDoc<Post>(firestore, 'forumPosts', postId);
    const { data: comments, loading: commentsLoading } = useCollection<Comment>(firestore, `forumPosts/${postId}/comments`);

    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddComment = async () => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: "You must be logged in to comment." });
            return;
        }
        if (!newComment.trim()) {
            toast({ variant: 'destructive', title: "Comment cannot be empty." });
            return;
        }

        setIsSubmitting(true);
        try {
            const commentsCollection = collection(firestore, 'forumPosts', postId, 'comments');
            await addDoc(commentsCollection, {
                content: newComment,
                authorId: user.uid,
                authorName: user.displayName || 'Anonymous User',
                authorPhotoURL: user.photoURL || '',
                createdAt: serverTimestamp(),
            });

            // Increment comment count
            const postRef = doc(firestore, 'forumPosts', postId);
            await updateDoc(postRef, { commentCount: increment(1) });
            
            setNewComment('');
            toast({ title: "Comment added!" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Failed to add comment", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (postLoading) {
        return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
    }

    if (!post) {
        return <div className="container py-12 text-center"><p>Post not found.</p></div>;
    }

    return (
        <div className="container py-8 md:py-12 max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">{post.title}</CardTitle>
                    <div className="flex items-center gap-4 pt-4">
                        <Avatar>
                            <AvatarImage src={post.authorPhotoURL} alt={post.authorName} />
                            <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{post.authorName}</p>
                            <p className="text-sm text-muted-foreground">
                                Posted {post.createdAt ? formatDistanceToNow(new Date(post.createdAt.seconds * 1000), { addSuffix: true }) : 'just now'}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-lg whitespace-pre-wrap">{post.content}</p>
                </CardContent>
            </Card>

            <div className="my-8">
                <h2 className="font-headline text-2xl font-bold mb-4">Comments</h2>
                
                {/* Add Comment Form */}
                {user && (
                    <Card className="mb-6 bg-muted/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Leave a Comment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid w-full gap-2">
                                <Textarea 
                                    placeholder="Share your thoughts..." 
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <Button onClick={handleAddComment} disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Submit Comment
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Comments List */}
                <div className="space-y-6">
                    {commentsLoading && <div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                    
                    {!commentsLoading && comments && comments.length > 0 ? (
                        comments.map(comment => (
                            <Card key={comment.id} className="p-4">
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={comment.authorPhotoURL} alt={comment.authorName} />
                                        <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold">{comment.authorName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt.seconds * 1000), { addSuffix: true }) : 'Just now'}
                                            </p>
                                        </div>
                                        <p className="mt-1 text-sm">{comment.content}</p>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        !commentsLoading && <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to reply!</p>
                    )}
                </div>
            </div>
        </div>
    );
}
