const fs = require('fs');
const files = [
    'C:/startup/Neetcode/neetcode-latest/src/components/communities/test-builder/CreateMcqModal.tsx',
    'C:/startup/Neetcode/neetcode-latest/src/components/communities/test-builder/DateTimePopoverField.tsx'
];

for (let file of files) {
    let c = fs.readFileSync(file, 'utf8');
    c = c.replace(/className="focus:bg-zinc-900 focus:text-zinc-100"\s+className="focus:bg-zinc-900 focus:text-zinc-100"/g, 'className="focus:bg-zinc-900 focus:text-zinc-100"');
    fs.writeFileSync(file, c);
}
console.log("deduped");
