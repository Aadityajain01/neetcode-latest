const fs = require('fs');
let f = 'C:/startup/Neetcode/neetcode-latest/src/components/communities/test-builder/LibraryMcqModal.tsx';
let c = fs.readFileSync(f, 'utf8');
c = c.replace('.then(res => setMeta(res))', '.then(res => setMeta(res.data))');
fs.writeFileSync(f, c);

let f2 = 'C:/startup/Neetcode/neetcode-latest/src/components/communities/test-builder/CreateMcqModal.tsx';
let c2 = fs.readFileSync(f2, 'utf8');
c2 = c2.replace('.then(res => setMeta(res))', '.then(res => setMeta(res.data))');
fs.writeFileSync(f2, c2);
