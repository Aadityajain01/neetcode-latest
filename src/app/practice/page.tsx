"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layouts/main-layout";
import { mcqApi, MCQ } from "@/lib/api-modules";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { LanguageCard } from "@/components/languageCard";
import { BackHeader } from "@/components/BacHeader";

type LanguageMeta = {
  name: string;
  difficulties: Set<string>;
  tags: Set<string>;
};

export default function PracticeLanguagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [languages, setLanguages] = useState<LanguageMeta[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      setLoading(true);
      const data = await mcqApi.getMCQs({ limit: 1000 });

      const map = new Map<string, LanguageMeta>();

      (data.mcqs || []).forEach((mcq: MCQ) => {
        const lang = mcq.language.toLowerCase();

        if (!map.has(lang)) {
          map.set(lang, {
            name: lang,
            difficulties: new Set(),
            tags: new Set(),
          });
        }

        map.get(lang)!.difficulties.add(mcq.difficulty);
        mcq.tags?.forEach((t) => map.get(lang)!.tags.add(t));
      });

      setLanguages(Array.from(map.values()));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredLanguages = useMemo(() => {
    return languages.filter((l) =>
      l.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [languages, search]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <BackHeader
            title="Select Language"
            subtitle="Choose a programming language to start practice"
          />
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search language..."
              className="pl-10 bg-[#0F172A] border-[#334155] text-[#E5E7EB]"
            />
          </div>

          {/* Placeholder for future category filter */}
          <Button variant="outline" className="border-[#334155] text-[#9CA3AF]">
            Filter
          </Button>
        </div>

        {/* Language Grid */}
        {filteredLanguages.length === 0 ? (
          <p className="text-[#9CA3AF] text-center mt-12">No languages found</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredLanguages.map((lang) => (
              <LanguageCard
                key={lang.name}
                language={lang.name}
                difficulties={lang.difficulties}
                onClick={() =>
                  router.push(`/practice/module?lang=${lang.name}`)
                }
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
