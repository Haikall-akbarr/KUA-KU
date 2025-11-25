
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { services } from '@/lib/services-data';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { SectionWrapper } from '@/components/shared/SectionWrapper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// Mapping of all lucide-react icons
const icons = LucideIcons as unknown as { [key: string]: LucideIcons.LucideIcon };

export async function generateStaticParams() {
  return services.map((service) => ({
    slug: service.slug,
  }));
}
//disni akanberika edkit defbih
function getServiceFromSlug(slug: string) {
  return services.find((service) => service.slug === slug);
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  // Handle params as either Promise (Next.js 15) or synchronous object
  const resolvedParams = params instanceof Promise ? await params : params;
  const service = getServiceFromSlug(resolvedParams.slug);

  if (!service || !service.details) {
    notFound();  
  }

  const { title, details, iconName } = service;
  const Icon = icons[iconName] || LucideIcons.File;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-grow">
        <SectionWrapper 
            className="pt-8 md:pt-12"
            hasAnimation={false}
        >
          <div className="max-w-4xl mx-auto">
            <Button asChild variant="outline" size="sm" className="mb-6">
              <Link href="/#services">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Semua Layanan
              </Link>
            </Button>
            
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-10 w-10" />
                </div>
                <CardTitle className="font-headline text-3xl text-primary">{title}</CardTitle>
                {details.subtitle && (
                  <CardDescription className="text-lg text-muted-foreground mt-2 px-4">
                    {details.subtitle}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="px-6 md:px-8 py-6">
                {details.sections.map((section, index) => (
                  <div key={index} className="mb-8">
                    <h3 className="font-headline text-xl font-semibold text-foreground mb-4 border-b-2 border-primary/20 pb-2">
                      {section.title}
                    </h3>
                    {section.type === 'list' ? (
                      <ul className="space-y-3">
                        {section.content.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="space-y-4 text-foreground/80">
                        {section.content.map((p, pIndex) => <p key={pIndex}>{p}</p>)}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </SectionWrapper>
      </main>
      <AppFooter />
    </div>
  );
}
