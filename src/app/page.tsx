import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Camera, Bot, Users, BarChart, MapPin, FileText } from 'lucide-react';
import Header from '@/components/common/Header';

const features = [
  {
    icon: <Camera className="h-10 w-10 text-primary" />,
    title: 'AI-Powered Roof Analysis',
    description: 'Analyze rooftop photos to detect usable solar surface area and get panel layout sketches.',
  },
  {
    icon: <BarChart className="h-10 w-10 text-primary" />,
    title: 'Solar Recommendation Engine',
    description: 'Get system size, type, cost, ROI, and savings calculated based on your data.',
  },
  {
    icon: <MapPin className="h-10 w-10 text-primary" />,
    title: 'Installer & Dealer Connection',
    description: 'Find verified nearby solar installers and dealers on a map with ratings and pricing.',
  },
  {
    icon: <FileText className="h-10 w-10 text-primary" />,
    title: 'Feasibility Reports',
    description: 'Generate a comprehensive, human-readable feasibility report for your project.',
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: 'Community Forum',
    description: 'Ask questions, share photos, and rate installations in our moderated community.',
  },
  {
    icon: <Bot className="h-10 w-10 text-primary" />,
    title: 'AI Chat Assistant',
    description: 'Our chatbot is here to answer your questions about solar, ROI, and subsidies.',
  },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center text-center">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 container px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <h1 className="font-headline text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Unlock the Power of the Sun with AI
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-200">
                LumenAI provides instant solar feasibility analysis, connects you with trusted installers, and helps you make informed decisions for a sustainable future.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/dashboard">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="link" className="text-white">
                  <Link href="#features">Learn More &rarr;</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 sm:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-base font-semibold leading-7 text-primary">Everything you need</h2>
              <p className="mt-2 font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                A smarter way to go solar
              </p>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                LumenAI combines cutting-edge AI with a comprehensive toolkit to simplify your transition to solar energy.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center gap-4">
                    {feature.icon}
                    <CardTitle className="font-headline text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} LumenAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
