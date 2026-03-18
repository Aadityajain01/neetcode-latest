const fs = require('fs');

function replaceClass(file) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/bg-background/g, 'bg-zinc-950');
  c = c.replace(/bg-white/g, 'bg-zinc-950');
  c = c.replace(/bg-muted\/30/g, 'bg-zinc-900/50');
  c = c.replace(/bg-muted\/50/g, 'bg-zinc-900/50');
  c = c.replace(/bg-muted/g, 'bg-zinc-900');
  c = c.replace(/bg-card/g, 'bg-zinc-950');
  c = c.replace(/text-foreground/g, 'text-zinc-200');
  c = c.replace(/text-muted-foreground/g, 'text-zinc-400');
  c = c.replace(/border-border/g, 'border-zinc-800');
  
  if (file.includes('CreateMcqModal.tsx')) {
    // There are some hardcoded styles from previous code that might be light
    c = c.replace(/bg-white/g, 'bg-zinc-950');
    c = c.replace(/bg-gray-50/g, 'bg-zinc-900');
    c = c.replace(/bg-gray-100/g, 'bg-zinc-800');
    c = c.replace(/border-gray-200/g, 'border-zinc-800');
    c = c.replace(/text-gray-500/g, 'text-zinc-400');
    c = c.replace(/text-gray-700/g, 'text-zinc-300');
    c = c.replace(/text-gray-900/g, 'text-zinc-100');
  }

  fs.writeFileSync(file, c);
}

replaceClass('C:/startup/Neetcode/neetcode-latest/src/components/communities/TestBuilder.tsx');
replaceClass('C:/startup/Neetcode/neetcode-latest/src/components/communities/test-builder/CreateMcqModal.tsx');
replaceClass('C:/startup/Neetcode/neetcode-latest/src/components/communities/test-builder/LibraryMcqModal.tsx');
console.log('done');
