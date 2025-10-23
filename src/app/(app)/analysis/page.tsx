"use client";

import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, BarChart, FileText, Loader2, Sparkles, Home, Map, CircleDollarSign, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { APIProvider } from '@vis.gl/react-google-maps';
import RoofMap from '@/components/analysis/RoofMap';
import { analyzeRooftopPhoto, AnalyzeRooftopPhotoOutput } from '@/ai/flows/analyze-rooftop-photos';
import { generateSolarRecommendations, GenerateSolarRecommendationsOutput } from '@/ai/flows/generate-solar-recommendations';
import { suggestSubsidies, SuggestSubsidiesOutput } from '@/ai/flows/suggest-subsidies';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function AnalysisPage() {
  const { toast } = useToast();
  
  // State for accordion control
  const [activeAccordion, setActiveAccordion] = useState("item-1");

  // State for AI analysis and recommendations
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [isLoadingSubsidies, setIsLoadingSubsidies] = useState(false);

  const [analysisResult, setAnalysisResult] = useState<AnalyzeRooftopPhotoOutput | null>(null);
  const [recommendationResult, setRecommendationResult] = useState<GenerateSolarRecommendationsOutput | null>(null);
  const [subsidyResult, setSubsidyResult] = useState<SuggestSubsidiesOutput | null>(null);

  // State for user inputs in Step 3
  const [propertyType, setPropertyType] = useState<'home' | 'land' | ''>('');
  const [roofType, setRoofType] = useState('');
  const [installationType, setInstallationType] = useState('');
  const [panelPreference, setPanelPreference] = useState('');
  const [userLocation, setUserLocation] = useState('Tamil Nadu'); // Default for now

  const handleAnalyze = async (screenshotDataUrl: string, polygon: google.maps.LatLngLiteral[]) => {
    setIsLoadingAnalysis(true);
    setAnalysisResult(null);

    try {
      const result = await analyzeRooftopPhoto({
        photoDataUri: screenshotDataUrl,
        polygon: polygon.map(p => `${p.lat},${p.lng}`).join(' ')
      });
      setAnalysisResult(result);
      setActiveAccordion("item-2"); // Move to next step
      toast({
        title: "Analysis Complete",
        description: "Your AI roof analysis is ready.",
      });
    } catch (error) {
      console.error("Error analyzing rooftop photo:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not analyze the roof image. Please try again.",
      });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleGetRecommendations = async () => {
    if (!analysisResult) {
       toast({ variant: "destructive", title: "Please complete roof analysis first." });
       return;
    }
     if (!propertyType || !panelPreference || (propertyType === 'home' && (!roofType || !installationType))) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please fill out all fields to get your recommendation." });
      return;
    }
    
    setIsLoadingRecs(true);
    setRecommendationResult(null);
    setSubsidyResult(null);

    try {
      const recResult = await generateSolarRecommendations({
          roofAnalysis: JSON.stringify(analysisResult),
          energyConsumption: "450 kWh/month (average)", // Placeholder value
          location: userLocation,
          propertyType: propertyType,
          roofType: propertyType === 'home' ? roofType : 'n/a',
          installationType: propertyType === 'land' ? 'ground-mounted' : installationType,
          panelPreference: panelPreference,
      });
      setRecommendationResult(recResult);
      setActiveAccordion("item-4"); // Move to subsidies
      toast({
        title: "Recommendation Ready",
        description: "Your personalized solar recommendation has been generated.",
      });

      // Now, fetch subsidies
      setIsLoadingSubsidies(true);
      
      // Extract the first number from the system size range (e.g., "1.5 kW - 2.0 kW" -> 1.5)
      const systemSizeKW = parseFloat(recResult.systemSize.split(' ')[0]) || 0;

      const subResult = await suggestSubsidies({
          location: userLocation,
          propertyType: propertyType,
          systemSizeKW: systemSizeKW,
      });
      setSubsidyResult(subResult);

    } catch (error) {
       console.error("Error generating recommendations or subsidies:", error);
       toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate recommendations or subsidies. Please try again.",
      });
    } finally {
        setIsLoadingRecs(false);
        setIsLoadingSubsidies(false);
    }
  }
  
  const handleRecommendationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (recommendationResult) {
      setRecommendationResult({ ...recommendationResult, [name]: value });
    }
  };

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
            <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                Solar Feasibility Analysis
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
                Follow these steps to get a complete AI-powered analysis of your home's solar potential.
            </p>
        </div>

        <Accordion type="single" value={activeAccordion} onValueChange={setActiveAccordion} collapsible className="w-full mt-12">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-lg font-headline">
                <div className="flex items-center gap-3">
                    <Camera className="h-6 w-6 text-primary" />
                    Step 1: AI Roof Analysis
                </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle>Select Your Property Area</CardTitle>
                  <CardDescription>Use the map to find your address. Use the drawing tool to outline the area for panel installation, then capture the image for analysis.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[450px] rounded-lg overflow-hidden border">
                    {MAPS_API_KEY ? (
                      <APIProvider apiKey={MAPS_API_KEY}>
                        <RoofMap onScreenshot={handleAnalyze} />
                      </APIProvider>
                    ) : (
                      <div className="w-full h-full bg-muted flex flex-col items-center justify-center text-center p-8">
                          <h3 className="font-headline text-xl font-semibold">Map Unavailable</h3>
                          <p className="text-muted-foreground mt-2">
                              Please provide a Google Maps API key in your environment variables (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) to display the interactive map.
                          </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-lg font-headline" disabled={!analysisResult}>
                <div className="flex items-center gap-3">
                    <BarChart className="h-6 w-6 text-primary" />
                    Step 2: View Area Analysis
                </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle>AI-Powered Area Analysis</CardTitle>
                  <CardDescription>Here is what our AI found about your selected area.</CardDescription>
                </CardHeader>
                <CardContent>
                  {(isLoadingAnalysis) && (
                     <div className="p-8 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        <p className="text-muted-foreground mt-4">Analyzing... this may take a moment.</p>
                    </div>
                  )}
                  {analysisResult && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader><CardTitle>Usable Surface Area</CardTitle></CardHeader>
                        <CardContent><p className="text-2xl font-bold">{analysisResult.usableSurfaceArea}</p></CardContent>
                      </Card>
                       <Card>
                        <CardHeader><CardTitle>Potential Obstructions</CardTitle></CardHeader>
                        <CardContent><p>{analysisResult.potentialObstructions}</p></CardContent>
                      </Card>
                       <Card className="md:col-span-2">
                        <CardHeader><CardTitle>Suggested Panel Layout Sketch</CardTitle></CardHeader>
                        <CardContent><p className="text-muted-foreground">{analysisResult.panelLayoutSketch}</p></CardContent>
                      </Card>
                    </div>
                  )}
                   {!isLoadingAnalysis && !analysisResult && (
                     <div className="p-8 text-center">
                        <p className="text-muted-foreground">Complete Step 1 to see your analysis here.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
          
           <AccordionItem value="item-3">
            <AccordionTrigger className="text-lg font-headline" disabled={!analysisResult}>
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-primary" />
                Step 3: Energy & Cost Estimation
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle>Personalize Your Recommendation</CardTitle>
                  <CardDescription>Provide a few more details to help us tailor your solar estimate. Then, you can edit the results.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div>
                     <Label className="text-base font-medium">What type of property is this for?</Label>
                      <RadioGroup value={propertyType} onValueChange={(value: 'home' | 'land' | '') => setPropertyType(value)} className="mt-2 grid grid-cols-2 gap-4">
                        <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                           <RadioGroupItem value="home" id="home" className="sr-only" />
                           <Home className="mb-3 h-6 w-6" />
                           Home
                        </Label>
                        <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <RadioGroupItem value="land" id="land" className="sr-only" />
                            <Map className="mb-3 h-6 w-6" />
                            Land
                        </Label>
                      </RadioGroup>
                   </div>
                  
                  {propertyType && (
                    <div className="space-y-6 animate-in fade-in-50">
                      <div className="grid sm:grid-cols-2 gap-4">
                         {propertyType === 'home' && (
                           <>
                            <div className="grid gap-2">
                              <Label htmlFor="roof-type">Roof Type</Label>
                               <Select onValueChange={setRoofType} value={roofType}>
                                  <SelectTrigger id="roof-type"><SelectValue placeholder="Select roof type" /></SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="sloped-asphalt">Sloped (Asphalt)</SelectItem>
                                      <SelectItem value="sloped-tile">Sloped (Tile)</SelectItem>
                                      <SelectItem value="flat">Flat Roof</SelectItem>
                                      <SelectItem value="metal">Metal</SelectItem>
                                  </SelectContent>
                              </Select>
                            </div>
                             <div className="grid gap-2">
                              <Label htmlFor="install-type">Installation Type</Label>
                               <Select onValueChange={setInstallationType} value={installationType}>
                                  <SelectTrigger id="install-type"><SelectValue placeholder="Select install type" /></SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="rooftop">Rooftop</SelectItem>
                                      <SelectItem value="ground-mounted">Ground-Mounted</SelectItem>
                                  </SelectContent>
                              </Select>
                            </div>
                          </>
                         )}
                        
                         <div className="grid gap-2">
                           <Label htmlFor="panel-pref">Panel Preference</Label>
                           <Select onValueChange={setPanelPreference} value={panelPreference}>
                              <SelectTrigger id="panel-pref"><SelectValue placeholder="Select panels" /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="budget">Budget-Friendly</SelectItem>
                                  <SelectItem value="standard">Standard (Best Value)</SelectItem>
                                  <SelectItem value="premium">Premium (High-Efficiency)</SelectItem>
                              </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button onClick={handleGetRecommendations} disabled={isLoadingRecs || !analysisResult}>
                        {isLoadingRecs ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Generate My Estimation
                      </Button>
                    </div>
                  )}

                  
                  {recommendationResult && (
                     <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-semibold text-lg">Your Editable Recommendation</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="systemSize">System Size (kW)</Label>
                                <Input id="systemSize" name="systemSize" value={recommendationResult.systemSize} onChange={handleRecommendationChange} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="systemType">System Type</Label>
                                <Input id="systemType" name="systemType" value={recommendationResult.systemType} onChange={handleRecommendationChange} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="estimatedCost">Estimated Cost</Label>
                                <Input id="estimatedCost" name="estimatedCost" value={recommendationResult.estimatedCost} onChange={handleRecommendationChange} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="estimatedSavings">Est. Monthly Savings</Label>
                                <Input id="estimatedSavings" name="estimatedSavings" value={recommendationResult.estimatedSavings} onChange={handleRecommendationChange} />
                            </div>
                             <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="roi">Return on Investment (ROI)</Label>
                                <Input id="roi" name="roi" value={recommendationResult.roi} onChange={handleRecommendationChange} />
                            </div>
                        </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

           <AccordionItem value="item-4">
            <AccordionTrigger className="text-lg font-headline" disabled={!recommendationResult}>
                <div className="flex items-center gap-3">
                    <CircleDollarSign className="h-6 w-6 text-primary" />
                    Step 4: View Applicable Subsidies
                </div>
            </AccordionTrigger>
            <AccordionContent>
               <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle>AI-Powered Subsidy Suggestions</CardTitle>
                  <CardDescription>Based on your analysis, here are some financial incentives you might be eligible for.</CardDescription>
                </CardHeader>
                <CardContent>
                    {(isLoadingRecs || isLoadingSubsidies) && (
                         <div className="p-8 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                            <p className="text-muted-foreground mt-4">Finding relevant subsidies...</p>
                        </div>
                    )}
                    {subsidyResult && subsidyResult.subsidies.length > 0 && (
                        <div className="space-y-4">
                            {subsidyResult.subsidies.map((subsidy, index) => (
                                <Card key={index} className={subsidy.isRecommended ? 'border-green-500 border-2' : ''}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle>{subsidy.name}</CardTitle>
                                             {subsidy.isRecommended && (
                                                <div className="flex items-center gap-2 text-sm font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Recommended for you
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground mb-4">{subsidy.description}</p>
                                        <Button asChild variant="outline">
                                            <Link href={subsidy.link} target="_blank" rel="noopener noreferrer">
                                                Learn More <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                    {!isLoadingSubsidies && (!subsidyResult || subsidyResult.subsidies.length === 0) && (
                         <div className="p-8 text-center">
                            <p className="text-muted-foreground">Complete Step 3 to see subsidy suggestions here.</p>
                        </div>
                    )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
