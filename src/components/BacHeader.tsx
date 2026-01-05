'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

type Props = {
  title: string;
  subtitle?: string;
};

export function BackHeader({ title, subtitle }: Props) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="text-[#9CA3AF] hover:text-black p-0 h-auto"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div>
        <h1 className="text-3xl font-bold text-[#E5E7EB]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[#9CA3AF] mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
