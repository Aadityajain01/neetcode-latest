const fs = require('fs');
let f = 'C:/startup/Neetcode/neetcode-latest/src/components/communities/test-builder/CreateMcqModal.tsx';
let c = fs.readFileSync(f, 'utf8');

if (!c.includes('mcqApi')) {
  c = c.replace('import { toast } from "sonner";', 'import { toast } from "sonner";\nimport { mcqApi } from "@/lib/api-modules";');
}

if (!c.includes('setMeta')) {
  c = c.replace(
    'const [draft, setDraft] = useState<DraftMCQ>(',
    'const [meta, setMeta] = useState<{languages: string[], difficulties: string[]}>({languages: [], difficulties: []});\n  useEffect(() => {\n    mcqApi.getMeta().then(res => setMeta(res)).catch(() => {});\n  }, []);\n\n  const [draft, setDraft] = useState<DraftMCQ>('
  );
}

c = c.replace(/DIFFICULTIES\.map/g, 'meta.difficulties.map');
c = c.replace(/PROGRAMMING_LANGUAGES\.map/g, 'meta.languages.map');

fs.writeFileSync(f, c);
