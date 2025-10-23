import { subsidies, SubsidyCategory } from "@/lib/subsidies-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { ArrowRight, Banknote, Building, Landmark, ListChecks, CheckCircle } from 'lucide-react';
import SubsidyChatAssistant from "@/components/chat/SubsidyChatAssistant";

const categoryIcons: { [key: string]: React.ReactNode } = {
  'Central Government Schemes': <Landmark className="h-8 w-8 text-primary" />,
  'Tamil Nadu State Schemes': <Building className="h-8 w-8 text-primary" />,
  'Banks & Financial Institutions': <Banknote className="h-8 w-8 text-primary" />,
  'How to Apply & Checklists': <ListChecks className="h-8 w-8 text-primary" />
};

export default function SubsidiesPage() {
  const groupedSubsidies = subsidies.reduce((acc, subsidy) => {
    const category = subsidy.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(subsidy);
    return acc;
  }, {} as Record<string, SubsidyCategory[]>);

  return (
    <>
      <div className="container py-8 md:py-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
            Solar Subsidies & Financing
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore the financial incentives, government schemes, and bank loans available to make your transition to solar energy more affordable.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-12">
          {Object.entries(groupedSubsidies).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center gap-4 mb-8">
                {categoryIcons[category] || <Landmark className="h-8 w-8 text-primary" />}
                <h2 className="font-headline text-2xl font-bold">{category}</h2>
              </div>
              <div className="space-y-6">
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <CardTitle>{item.name}</CardTitle>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {item.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{item.description}</p>
                      
                       {(item.details.length > 0 || item.checklist) && (
                        <Accordion type="single" collapsible className="w-full mt-4">
                            <AccordionItem value="details">
                            <AccordionTrigger>View Details</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4 text-sm">
                                    {item.details.map(detail => (
                                    <div key={detail.title} className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-1">
                                        <p className="font-semibold text-muted-foreground">{detail.title}:</p>
                                        <p>{detail.content}</p>
                                    </div>
                                    ))}
                                </div>
                                {item.checklist && (
                                <div className="mt-4">
                                    <h4 className="font-semibold mb-2">Checklist:</h4>
                                    <ul className="space-y-2">
                                        {item.checklist.map((check, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                                            <span>{check}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                )}
                            </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                       )}

                    </CardContent>
                    {item.link && (
                      <CardFooter>
                         <Button asChild variant="outline">
                            <Link href={item.link} target="_blank" rel="noopener noreferrer">
                                Official Link <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <SubsidyChatAssistant />
    </>
  );
}
