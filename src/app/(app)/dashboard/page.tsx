"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Camera, Users, MapPin, Building, Inbox, Phone, Home, CheckCircle, PlusCircle } from 'lucide-react';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';


const quickLinks = [
  {
    title: 'Analyze Your Roof',
    description: 'Upload a photo and let our AI do the rest.',
    href: '/analysis',
    icon: <Camera className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Find Installers',
    description: 'Browse verified professionals in your area.',
    href: '/installers',
    icon: <MapPin className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Solarity Hub',
    description: 'Ask questions and share your solar journey.',
    href: '/solarity-hub',
    icon: <Users className="h-8 w-8 text-primary" />,
  },
];

type Query = {
    id: string;
    installerId: string;
    installerName: string;
    homeownerName: string;
    homeownerPhotoUrl?: string;
    message: string;
    mobileNumber: string;
    location: string;
    status: 'new' | 'read' | 'completed';
    createdAt: { seconds: number; nanoseconds: number };
}

type Product = {
    id: string;
    name: string;
    price: string;
    description: string;
    imageUrl: string;
};

const productSchema = z.object({
    name: z.string().min(3, "Product name is required"),
    price: z.string().min(1, "Price is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    imageUrl: z.string().min(1, "Product image is required."),
});

type ProductFormValues = z.infer<typeof productSchema>;

function AddProductDialog({ userId }: { userId: string }) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: { name: "", price: "", description: "", imageUrl: "" },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                form.setValue('imageUrl', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: ProductFormValues) => {
        if (!firestore) return;
        try {
            const productsCollection = collection(firestore, 'users', userId, 'products');
            await addDoc(productsCollection, data);
            toast({ title: "Product Added" });
            form.reset();
            setIsOpen(false);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed to add product", description: error.message });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button>
                    <PlusCircle className="mr-2" /> Add Product
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add a New Product</DialogTitle>
                    <DialogDescription>
                        Enter the details of the solar product you want to list.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} placeholder="e.g., Premium 550W Solar Panel" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="price" render={({ field }) => (
                            <FormItem><FormLabel>Price (INR)</FormLabel><FormControl><Input {...field} placeholder="e.g., ₹15,000" /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="imageUrl" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Image</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="file" 
                                        accept="image/png, image/jpeg, image/gif"
                                        onChange={handleFileChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} placeholder="Describe the product..." /></FormControl><FormMessage /></FormItem>
                        )} />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="animate-spin mr-2" />}
                                Add Product
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { data: userData, loading: userLoading } = useDoc<{role: string, companyName?: string}>(firestore, 'users', user?.uid);

  // Queries for installer
  const { data: incomingQueries, loading: incomingQueriesLoading } = useCollection<Query>(firestore, `users/${user?.uid}/queries`);

  // Products for installer
  const { data: products, loading: productsLoading } = useCollection<Product>(firestore, `users/${user?.uid}/products`);

  // Queries for homeowner
  const { data: sentQueries, loading: sentQueriesLoading } = useCollection<Query>(
      firestore,
      'queries',
      ['where', 'homeownerId', '==', user?.uid]
  );

  if (userLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }
  
  // Installer-specific view
  if (userData?.role === 'installer') {
     if (!userData.companyName) { // Assuming companyName is a good indicator of a completed profile
        return (
             <div className="container py-8 md:py-12">
                <div className="max-w-2xl mx-auto text-center">
                    <Building className="h-16 w-16 mx-auto text-primary" />
                    <h1 className="font-headline mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                        Complete Your Installer Profile
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Add your company details to appear in our installer listings and connect with homeowners.
                    </p>
                    <Button asChild size="lg" className="mt-8">
                        <Link href="/installer-profile">
                            Get Started <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        )
     }

     const handleMarkAsComplete = async (queryId: string) => {
        if (!firestore || !user?.uid) return;
        const queryRef = doc(firestore, 'users', user.uid, 'queries', queryId);
        try {
            await updateDoc(queryRef, { status: 'completed' });
             const homeownerQueryRef = doc(firestore, 'queries', queryId);
            await updateDoc(homeownerQueryRef, { status: 'completed' });
            toast({ title: "Query marked as complete." });
        } catch (error) {
            console.error("Error updating query status:", error);
            toast({ variant: "destructive", title: "Update failed." });
        }
    };


     return (
        <div className="container py-8 md:py-12 space-y-8">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                        Installer Dashboard
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Welcome, {user?.displayName}. Here are your incoming project leads and products.
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/installer-profile">Edit Profile</Link>
                </Button>
            </div>
            
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Inbox className="h-6 w-6" />
                    <CardTitle>Incoming Queries</CardTitle>
                </CardHeader>
                <CardContent>
                    {incomingQueriesLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {incomingQueries && incomingQueries.length > 0 ? (
                                incomingQueries.map(query => (
                                    <div key={query.id} className="flex gap-4 p-4 border rounded-lg">
                                         <Avatar>
                                            <AvatarImage src={query.homeownerPhotoUrl} />
                                            <AvatarFallback>{query.homeownerName?.charAt(0) || 'H'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">{query.homeownerName || 'Homeowner'}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatDistanceToNow(new Date(query.createdAt.seconds * 1000), { addSuffix: true })}
                                                    </p>
                                                </div>
                                                {query.status === 'new' && <Badge>New</Badge>}
                                                {query.status === 'completed' && <Badge variant="secondary">Completed</Badge>}
                                            </div>
                                            <div className="mt-3 space-y-2 text-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Phone className="h-4 w-4"/>
                                                    <span>{query.mobileNumber}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Home className="h-4 w-4"/>
                                                    <span>{query.location}</span>
                                                </div>
                                            </div>
                                            <p className="mt-3 text-sm bg-muted/50 p-3 rounded-md">{query.message}</p>
                                            
                                            {query.status !== 'completed' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="mt-3"
                                                    onClick={() => handleMarkAsComplete(query.id)}
                                                >
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Mark as Complete
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground p-8">You have no new queries yet.</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

             <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle className="font-headline text-2xl">Your Products</CardTitle>
                        <CardDescription>
                            Manage the products that appear on your public profile.
                        </CardDescription>
                    </div>
                    {user && <AddProductDialog userId={user.uid} />}
                </CardHeader>
                <CardContent>
                    {productsLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : (
                        <div className="space-y-4">
                            {products && products.length > 0 ? (
                                products.map(product => (
                                    <div key={product.id} className="flex gap-4 p-4 border rounded-lg">
                                        <Image src={product.imageUrl} alt={product.name} width={100} height={100} className="rounded-md object-cover" />
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{product.name}</h4>
                                            <p className="text-sm text-primary font-bold">{product.price}</p>
                                            <p className="text-sm mt-1 text-muted-foreground">{product.description}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-8">You haven't added any products yet.</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
     )
  }

  // Default homeowner view
  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
         <div className="mb-12">
            <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome to your Dashboard
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to start your solar journey is right here.
            </p>
        </div>

        <div className="grid gap-8">
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
              {quickLinks.map((link) => (
                <Card key={link.href} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center gap-4 pb-4">
                    {link.icon}
                    <div className="grid gap-1">
                      <CardTitle className="font-headline text-lg">{link.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <CardDescription>{link.description}</CardDescription>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button asChild variant="outline" className="w-full">
                      <Link href={link.href}>
                        Go to {link.title.split(' ')[0]} <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>My Queries</CardTitle>
                    <CardDescription>Track your conversations with solar installers.</CardDescription>
                </CardHeader>
                <CardContent>
                    {sentQueriesLoading ? (
                         <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sentQueries && sentQueries.length > 0 ? (
                                sentQueries.map(query => (
                                    <div key={query.id} className="p-4 border rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">Query to {query.installerName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                 {formatDistanceToNow(new Date(query.createdAt.seconds * 1000), { addSuffix: true })}
                                            </p>
                                            <p className="text-sm mt-2">{query.message}</p>
                                        </div>
                                        <div>
                                            <Badge variant={query.status === 'new' ? 'default' : 'secondary'}>
                                                {query.status.charAt(0).toUpperCase() + query.status.slice(1)}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                 <p className="text-center text-muted-foreground p-8">You haven't sent any queries yet.</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

    