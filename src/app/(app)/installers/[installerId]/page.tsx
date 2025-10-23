"use client";

import { useState } from "react";
import Image from "next/image";
import { useFirestore, useDoc, useCollection, useUser } from "@/firebase";
import { Loader2, Send, Building, MapPin, DollarSign, Phone, Home, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { collection, serverTimestamp, doc, setDoc } from 'firebase/firestore';

type Installer = {
    id: string;
    companyName: string;
    companyDescription: string;
    serviceLocations: string;
    pricingDetails: string;
    photoURL: string;
};

type Product = {
    id: string;
    name: string;
    price: string;
    description: string;
    imageUrl: string;
};

function QueryDialog({ installer, user }: { installer: Installer; user: any }) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [message, setMessage] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [location, setLocation] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim() || !mobileNumber.trim() || !location.trim() || !firestore || !user) return;
        setIsSending(true);
        try {
            const installerQueryRef = collection(firestore, 'users', installer.id, 'queries');
            const newQueryDoc = doc(installerQueryRef); 
            await setDoc(newQueryDoc, {
                homeownerId: user.uid,
                homeownerName: user.displayName || 'Anonymous User',
                homeownerPhotoUrl: user.photoURL || '',
                message: message,
                mobileNumber: mobileNumber,
                location: location,
                status: 'new',
                createdAt: serverTimestamp()
            });

            const homeownerQueryRef = doc(firestore, 'queries', newQueryDoc.id);
            await setDoc(homeownerQueryRef, {
                homeownerId: user.uid,
                installerId: installer.id,
                installerName: installer.companyName,
                message: message,
                status: 'new',
                createdAt: serverTimestamp()
            });

            toast({
                title: "Query Sent!",
                description: `Your message has been sent to ${installer.companyName}.`
            });
            setMessage('');
            setMobileNumber('');
            setLocation('');
            setIsOpen(false);
            
        } catch (error) {
            console.error("Error sending query:", error);
            toast({
                variant: "destructive",
                title: "Failed to Send",
                description: "There was an error sending your message. Please try again."
            });
        } finally {
            setIsSending(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button size="lg">
                    <Send className="mr-2 h-4 w-4" /> Send Query
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Contact {installer.companyName}</DialogTitle>
                    <DialogDescription>
                        Fill out your details to start a conversation with the installer.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="mobileNumber">Mobile Number</Label>
                        <Input id="mobileNumber" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="Your mobile number" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="location">Your Location</Label>
                        <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Your city or full address" />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Hi, I'm interested in learning more about your solar installation services for my home..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button onClick={handleSubmit} disabled={isSending || !message.trim() || !mobileNumber.trim() || !location.trim()}>
                        {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Send Message
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function InstallerProfilePage({ params }: { params: { installerId: string } }) {
    const { installerId } = params;
    const firestore = useFirestore();
    const { user } = useUser();

    const { data: installer, loading: installerLoading } = useDoc<Installer>(firestore, 'users', installerId);
    const { data: products, loading: productsLoading } = useCollection<Product>(firestore, `users/${installerId}/products`);

    if (installerLoading) {
        return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
    }

    if (!installer) {
        return <div className="container py-12 text-center"><p>Installer not found.</p></div>
    }

    return (
        <div className="bg-muted/30">
            <div className="container py-8 md:py-12">
                <div className="grid gap-8 max-w-4xl mx-auto">
                    {/* Header */}
                    <Card>
                        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                            <Avatar className="h-28 w-28 border-4 border-primary">
                                <AvatarImage src={installer.photoURL} alt={installer.companyName} />
                                <AvatarFallback>{installer.companyName?.charAt(0) || 'I'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h1 className="font-headline text-3xl font-bold">{installer.companyName}</h1>
                                <p className="text-muted-foreground mt-1">{installer.companyDescription}</p>
                                <div className="flex items-center justify-center sm:justify-start flex-wrap gap-x-4 gap-y-2 mt-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>{installer.serviceLocations}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        <span>{installer.pricingDetails}</span>
                                    </div>
                                </div>
                            </div>
                            {user && <QueryDialog installer={installer} user={user} />}
                        </CardContent>
                    </Card>

                    {/* Products Section */}
                    <div>
                        <h2 className="font-headline text-2xl font-bold mb-6">Products & Services</h2>
                        {productsLoading ? (
                            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products && products.length > 0 ? (
                                    products.map(product => (
                                        <Card key={product.id} className="overflow-hidden">
                                            <div className="relative aspect-video">
                                                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                                            </div>
                                            <CardHeader>
                                                <CardTitle>{product.name}</CardTitle>
                                                <CardDescription className="text-primary font-bold text-lg">{product.price}</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground line-clamp-3">{product.description}</p>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <p className="col-span-full text-center text-muted-foreground py-8">This installer has not listed any products yet.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
