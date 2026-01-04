"use client";

import { useSearchParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layouts/main-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { BookOpen, Code2 } from "lucide-react";
import { BackHeader } from "@/components/BacHeader";
export default function PracticeModulePage() {
  const params = useSearchParams();
  const router = useRouter();
  const lang = params.get("lang");

  if (!lang) return null;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <BackHeader
            title={`${lang.toUpperCase()} Practice`}
            subtitle="Choose how you want to practice"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            onClick={() => router.push(`/practice/mcq/difficulty?lang=${lang}`)}
            className="bg-[#1E293B] border-[#334155] hover:border-[#22C55E] cursor-pointer transition"
          >
            <CardHeader>
              <BookOpen className="h-8 w-8 text-[#22C55E] mb-3" />
              <CardTitle className="text-[#E5E7EB]">MCQ Practice</CardTitle>
              <CardDescription className="text-[#9CA3AF]">
                Difficulty-based MCQ chaining
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            onClick={() => router.push(`/practice/code/filter?lang=${lang}`)}
            className="bg-[#1E293B] border-[#334155] hover:border-[#38BDF8] cursor-pointer transition"
          >
            <CardHeader>
              <Code2 className="h-8 w-8 text-[#38BDF8] mb-3" />
              <CardTitle className="text-[#E5E7EB]">
                Programming Practice
              </CardTitle>
              <CardDescription className="text-[#9CA3AF]">
                Solve coding problems without pressure
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
