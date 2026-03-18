const fs = require('fs');

const testBuilderFile = 'C:/startup/Neetcode/neetcode-latest/src/components/communities/TestBuilder.tsx';
let testBuilderContent = fs.readFileSync(testBuilderFile, 'utf8');

// Replace standard colors with explicit zinc ones in TestBuilder
testBuilderContent = testBuilderContent.replace(/bg-background/g, 'bg-zinc-950');
testBuilderContent = testBuilderContent.replace(/bg-white/g, 'bg-zinc-950');
testBuilderContent = testBuilderContent.replace(/text-foreground/g, 'text-zinc-200');
testBuilderContent = testBuilderContent.replace(/text-muted-foreground/g, 'text-zinc-400');
testBuilderContent = testBuilderContent.replace(/border-border/g, 'border-zinc-800');
testBuilderContent = testBuilderContent.replace(/border-gray-[0-9]+/g, 'border-zinc-800');
testBuilderContent = testBuilderContent.replace(/max-w-\[760px\]/g, 'max-w-5xl');

fs.writeFileSync(testBuilderFile, testBuilderContent);

const createFile = 'C:/startup/Neetcode/neetcode-latest/src/components/communities/test-builder/CreateMcqModal.tsx';
let createContent = fs.readFileSync(createFile, 'utf8');
createContent = createContent.replace(/max-w-\[800px\]/g, 'max-w-5xl');
createContent = createContent.replace(/bg-primary(\/[0-9]+)?/g, 'bg-emerald-600');
createContent = createContent.replace(/text-primary-foreground/g, 'text-white');
createContent = createContent.replace(/text-primary/g, 'text-emerald-500');
createContent = createContent.replace(/border-primary/g, 'border-emerald-600');
createContent = createContent.replace(/ring-primary/g, 'ring-emerald-600');
// Fix flex max-width
createContent = createContent.replace(/h-\[85vh\]/g, 'h-[90vh]');
fs.writeFileSync(createFile, createContent);

console.log("Updated fully!");
