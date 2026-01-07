'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { cn } from '../../skills/frontend-design/examples/typescript/utils';


interface BackButtonProps {
  label?: string;
  href?: string; // Optional: Force a specific destination
  className?: string;
}

export function BackButton({ label = "Back", href, className }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleBack}
      className={
        "group flex items-center gap-1 pl-0 text-zinc-500 hover:text-zinc-100 hover:bg-transparent transition-colors mb-4" 
        
      }
    >
      <div className="p-1 rounded-full bg-zinc-900 border border-zinc-800 group-hover:border-emerald-500/50 group-hover:bg-zinc-800 transition-all">
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      </div>
      <span className="font-medium text-xs uppercase tracking-wider">{label}</span>
    </Button>
  );
}