
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { SectionWrapper } from '@/components/shared/SectionWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { searchableData, type SearchableItem } from '@/lib/search-data';
import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, ExternalLink } from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get('query') || '';
  
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [results, setResults] = useState<SearchableItem[]>([]);
  const [currentQuery, setCurrentQuery] = useState(queryParam);

  useEffect(() => {
    setSearchTerm(queryParam); // Sync input field if URL query changes
    setCurrentQuery(queryParam); // Keep track of the query that fetched current results
    if (queryParam) {
      const lowerCaseQuery = queryParam.toLowerCase();
      const filteredResults = searchableData.filter(item =>
        item.title.toLowerCase().includes(lowerCaseQuery) ||
        (item.description && item.description.toLowerCase().includes(lowerCaseQuery)) ||
        (item.content && item.content.toLowerCase().includes(lowerCaseQuery)) ||
        (item.keywords && item.keywords.some(kw => kw.toLowerCase().includes(lowerCaseQuery)))
      );
      setResults(filteredResults);
    } else {
      setResults([]);
    }
  }, [queryParam]);

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-grow">
        <SectionWrapper
          title="Hasil Pencarian"
          subtitle={currentQuery ? `Untuk: "${currentQuery}"` : ""}
          className="pt-8 md:pt-12"
          hasAnimation={false}
        >
          <form onSubmit={handleSearchSubmit} className="mb-10 flex max-w-xl mx-auto">
            <Input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari informasi di KUAKU..."
              className="flex-grow rounded-r-none focus:ring-primary"
              aria-label="Kata kunci pencarian"
            />
            <Button type="submit" className="rounded-l-none">
              <SearchIcon className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Cari</span>
            </Button>
          </form>

          {!currentQuery && (
             <p className="text-center text-muted-foreground text-lg">
              Silakan masukkan kata kunci untuk memulai pencarian.
            </p>
          )}

          {currentQuery && results.length === 0 && (
            <Card className="max-w-lg mx-auto">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Tidak ada hasil yang ditemukan untuk &quot;{currentQuery}&quot;.
                  <br />
                  Coba gunakan kata kunci lain.
                </p>
              </CardContent>
            </Card>
          )}

          {results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map(item => (
                <Card key={item.id} className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl font-headline text-primary">
                      <Link 
                        href={item.link}
                        className="hover:underline"
                      >
                        {item.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-sm text-accent">{item.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow text-sm text-foreground/80">
                    <p className="line-clamp-4">
                      {item.description || item.content?.substring(0, 200) + (item.content && item.content.length > 200 ? '...' : '')}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href={item.link}>
                        Lihat Selengkapnya <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </SectionWrapper>
      </main>
      <AppFooter />
    </div>
  );
}
