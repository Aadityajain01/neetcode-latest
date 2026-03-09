"use client";

import { useState, useEffect } from "react";
import { useCommunity } from "./CommunityContext";
import { communityApi, mcqApi, problemApi, CommunityTest, TestQuestion } from "@/lib/api-modules";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Plus, Trash2, Code, ListTodo, Layers, Loader2, Search } from "lucide-react";
import { messageApi } from "@/lib/api-modules";

export function TestBuilder({ onTestCreated }: { onTestCreated: () => void }) {
  const { community } = useCommunity();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [testType, setTestType] = useState<"mcq" | "programming" | "mixed">("mcq");
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    durationMinutes: 60,
    isResultVisible: false,
  });

  const [questions, setQuestions] = useState<Partial<TestQuestion>[]>([]);

  const [libraryType, setLibraryType] = useState<'mcq' | 'programming' | null>(null);
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);

  const fetchLibrary = async (type: 'mcq' | 'programming') => {
    setLibraryType(type);
    setLibraryLoading(true);
    setLibraryItems([]);
    try {
      if (type === 'mcq') {
        const res = await mcqApi.getMCQs({ limit: 50 });
        setLibraryItems(res.mcqs || []);
      } else {
        const res = await problemApi.getProblems({ limit: 50 });
        setLibraryItems(res.problems || []);
      }
    } catch (e) {
      toast.error("Failed to load library items");
    } finally {
      setLibraryLoading(false);
    }
  };

  const addMCQ = () => {
    setQuestions([...questions, {
      type: "mcq",
      question: "",
      options: ["", "", "", ""],
      correctOption: 0,
      marks: 5
    }]);
  };

  const addProgramming = () => {
    setQuestions([...questions, {
      type: "programming",
      title: "",
      description: "",
      constraints: "",
      inputFormat: "",
      outputFormat: "",
      languages: ["javascript", "python3", "cpp"],
      customTestcases: [{ input: "", output: "", isHidden: false }],
      marks: 20
    }]);
  };

  const addFromLibrary = (item: any) => {
    if (libraryType === 'mcq') {
      setQuestions([...questions, {
        type: "mcq",
        question: item.question,
        options: item.options,
        correctOption: item.correctOption || 0,
        marks: 5
      }]);
    } else {
      setQuestions([...questions, {
        type: "programming",
        problemId: item._id, // Set the problemId for backend logic
        title: item.title,
        description: item.description,
        constraints: "", // Default or parse from DB if possible
        inputFormat: "",
        outputFormat: "",
        languages: item.languages || ["javascript", "python3", "cpp"],
        customTestcases: [], // We rely on problemId for evaluation
        marks: 20
      }]);
    }
    setLibraryType(null); // Close library view
    toast.success(`Added: ${item.title || item.question}`);
  };

  const updateQuestion = (index: number, updates: any) => {
    const nextQ = [...questions];
    nextQ[index] = { ...nextQ[index], ...updates };
    setQuestions(nextQ);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!community) return;
    setLoading(true);
    try {
      if (!form.title || !form.startTime || !form.endTime) {
        throw new Error("Missing required basic details");
      }
      if (questions.length === 0) {
        throw new Error("Add at least one question");
      }

      await communityApi.createTest(community._id, {
        ...form,
        type: testType,
        questions: questions
      });

      toast.success("Test created successfully");
      setOpen(false);

      // Send announcement message in the community chat
      try {
        await messageApi.sendMessage(
          community._id,
          `📝 New test created: "${form.title}"`
        );
      } catch {
        // Don't block test creation if announcement fails
      }

      
      // Reset
      setForm({
        title: "", description: "", startTime: "", endTime: "", durationMinutes: 60, isResultVisible: false
      });
      setQuestions([]);

      onTestCreated();
    } catch (e: any) {
      toast.error(e.message || "Failed to create test");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" className="bg-emerald-600 hover:bg-emerald-700 h-10 px-4 rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Test
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mb-2 bg-zinc-900 border-zinc-800 text-zinc-200" align="start" side="top">
          <DropdownMenuItem onClick={() => { setTestType('mcq'); setOpen(true); }} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 py-3">
            <ListTodo className="w-4 h-4 mr-3 text-emerald-500" /> Multiple Choice
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { setTestType('programming'); setOpen(true); }} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 py-3">
            <Code className="w-4 h-4 mr-3 text-purple-500" /> Programming Challenge
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { setTestType('mixed'); setOpen(true); }} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 py-3">
            <Layers className="w-4 h-4 mr-3 text-blue-500" /> Mixed Format
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-4xl max-h-[90vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>Create New Classroom Test</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-8 animate-in fade-in">
          
          {/* Basic Details Section */}
          <div className="space-y-6 bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
            <h3 className="text-lg font-medium text-emerald-500 mb-4">Basic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2">
                <Label>Test Title</Label>
                <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500" />
              </div>
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="datetime-local" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className="bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500 dark:[color-scheme:dark]" />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="datetime-local" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} className="bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500 dark:[color-scheme:dark]" />
              </div>
              <div className="space-y-2">
                <Label>Duration (Minutes)</Label>
                <Input type="number" value={form.durationMinutes} onChange={e => setForm({...form, durationMinutes: parseInt(e.target.value) || 0})} className="bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500" />
              </div>
              <div className="space-y-2 flex flex-col justify-center">
                <div className="flex flex-row items-center justify-between border border-zinc-800 p-2.5 rounded-md bg-zinc-950">
                  <Label className="cursor-pointer">Show Results Immediately</Label>
                  <Switch checked={form.isResultVisible} onCheckedChange={v => setForm({...form, isResultVisible: v})} />
                </div>
              </div>
            </div>
          </div>

          {/* Add Questions Section */}
          <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Step 3: Add Questions</h3>
                <div className="flex gap-2">
                  {(testType === 'mcq' || testType === 'mixed') && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <Button variant="outline" className="border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10">
                           + Add MCQ
                         </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                         <DropdownMenuItem onClick={addMCQ} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                           Create Custom MCQ
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => fetchLibrary('mcq')} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                           Select from Library
                         </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  {(testType === 'programming' || testType === 'mixed') && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="border-purple-500/30 text-purple-500 hover:bg-purple-500/10">
                          + Add Coding
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                         <DropdownMenuItem onClick={addProgramming} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                           Create Custom Problem
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => fetchLibrary('programming')} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                           Select from Library
                         </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {libraryType && (
                 <div className="mt-4 p-4 border border-zinc-700/50 bg-zinc-900 rounded-xl relative">
                    <Button variant="ghost" size="sm" className="absolute top-2 right-2 text-zinc-400" onClick={() => setLibraryType(null)}>Close</Button>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                       <Search className="w-4 h-4" /> 
                       Select {libraryType === 'mcq' ? 'MCQ' : 'Programming Problem'} from Library 
                    </h4>
                    {libraryLoading ? (
                       <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto text-zinc-500" /></div>
                    ) : (
                       <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                          {libraryItems.length === 0 ? (
                             <div className="text-zinc-500 text-center py-4 text-sm">No items found.</div>
                          ) : (
                             libraryItems.map(item => (
                                <div key={item._id} className="flex items-center justify-between bg-zinc-950 p-3 rounded-md border border-zinc-800 hover:border-emerald-500/50 transition-colors">
                                   <div className="flex-1 min-w-0 pr-4">
                                      <p className="text-sm text-zinc-200 truncate font-medium">{item.title || item.question}</p>
                                   </div>
                                   <Button size="sm" onClick={() => addFromLibrary(item)} className="bg-emerald-600 hover:bg-emerald-700 h-8 shrink-0">
                                      Add
                                   </Button>
                                </div>
                             ))
                          )}
                       </div>
                    )}
                 </div>
              )}

              <div className="space-y-6 mt-6">
                {questions.map((q, idx) => (
                  <div key={idx} className="border border-zinc-800 rounded-xl bg-zinc-900 p-5 relative group mt-4">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeQuestion(idx)}
                      className="absolute top-2 right-2 text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <div className="mb-4 flex items-center gap-3">
                      <span className="bg-zinc-800 text-zinc-300 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                      <span className="uppercase text-xs font-bold tracking-wider text-zinc-500">{q.type === 'mcq' ? 'Multiple Choice' : 'Programming'}</span>
                    </div>

                    {q.type === 'mcq' ? (
                      <div className="space-y-4">
                        <Input placeholder="Enter question..." value={q.question} onChange={e => updateQuestion(idx, { question: e.target.value })} className="bg-zinc-950 border-zinc-800 mb-2" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options?.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                name={`correct-${idx}`} 
                                checked={q.correctOption === oIdx} 
                                onChange={() => updateQuestion(idx, { correctOption: oIdx })}
                                className="w-4 h-4 accent-emerald-500" 
                              />
                              <Input placeholder={`Option ${oIdx + 1}`} value={opt} onChange={e => {
                                const newOpts = [...(q.options || [])];
                                newOpts[oIdx] = e.target.value;
                                updateQuestion(idx, { options: newOpts });
                              }} className="bg-zinc-950 border-zinc-800 h-9" />
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-800">
                           <Label className="text-zinc-400">Marks for this question:</Label>
                           <Input type="number" className="w-20 h-8 bg-zinc-950 border-zinc-800" value={q.marks} onChange={e => updateQuestion(idx, { marks: parseInt(e.target.value) || 0 })} />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Input placeholder="Problem Title..." value={q.title} onChange={e => updateQuestion(idx, { title: e.target.value })} className="bg-zinc-950 border-zinc-800 font-semibold" />
                        <Textarea placeholder="Problem Description..." value={q.description} onChange={e => updateQuestion(idx, { description: e.target.value })} className="bg-zinc-950 border-zinc-800 min-h-[100px]" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                             <Label className="text-xs text-zinc-400 mb-1 block">Constraints</Label>
                             <Textarea placeholder="1 <= N <= 10^5" value={q.constraints} onChange={e => updateQuestion(idx, { constraints: e.target.value })} className="bg-zinc-950 border-zinc-800 h-16" />
                          </div>
                          <div className="space-y-2">
                             <div>
                               <Label className="text-xs text-zinc-400 mb-1 block">Input Format</Label>
                               <Input placeholder="First line contains N..." value={q.inputFormat} onChange={e => updateQuestion(idx, { inputFormat: e.target.value })} className="bg-zinc-950 border-zinc-800 h-8 text-sm" />
                             </div>
                             <div>
                               <Label className="text-xs text-zinc-400 mb-1 block">Output Format</Label>
                               <Input placeholder="Output the sum..." value={q.outputFormat} onChange={e => updateQuestion(idx, { outputFormat: e.target.value })} className="bg-zinc-950 border-zinc-800 h-8 text-sm" />
                             </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-zinc-800">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm">Testcases</Label>
                            <Button variant="ghost" size="sm" onClick={() => {
                              updateQuestion(idx, { customTestcases: [...(q.customTestcases || []), { input: "", output: "", isHidden: false }] })
                            }} className="h-6 text-xs text-emerald-500 hover:text-emerald-400">
                              + Add Case
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {q.customTestcases?.map((tc, tcIdx) => (
                              <div key={tcIdx} className="flex gap-2 items-start relative border-l-2 border-emerald-500/50 pl-3">
                                <div className="flex-1 space-y-2">
                                  <Textarea placeholder="Input" value={tc.input} onChange={e => {
                                    const nextTcs = [...(q.customTestcases || [])];
                                    nextTcs[tcIdx].input = e.target.value;
                                    updateQuestion(idx, { customTestcases: nextTcs });
                                  }} className="bg-zinc-950 border-zinc-800 h-10 min-h-[40px] font-mono text-xs" />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <Textarea placeholder="Expected Output" value={tc.output} onChange={e => {
                                    const nextTcs = [...(q.customTestcases || [])];
                                    nextTcs[tcIdx].output = e.target.value;
                                    updateQuestion(idx, { customTestcases: nextTcs });
                                  }} className="bg-zinc-950 border-zinc-800 h-10 min-h-[40px] font-mono text-xs" />
                                </div>
                                <div className="flex flex-col gap-2 shrink-0">
                                   <div className="flex items-center gap-2 px-2 h-10 border border-zinc-800 rounded-md bg-zinc-950">
                                      <Label className="text-xs cursor-pointer">Hidden</Label>
                                      <Switch checked={tc.isHidden} onCheckedChange={v => {
                                         const nextTcs = [...(q.customTestcases || [])];
                                         nextTcs[tcIdx].isHidden = v;
                                         updateQuestion(idx, { customTestcases: nextTcs });
                                      }} />
                                   </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => {
                                    const nextTcs = [...(q.customTestcases || [])].filter((_, i) => i !== tcIdx);
                                    updateQuestion(idx, { customTestcases: nextTcs });
                                }} className="h-10 w-10 text-zinc-500 hover:text-red-500">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-800">
                           <Label className="text-zinc-400">Marks for this problem:</Label>
                           <Input type="number" className="w-20 h-8 bg-zinc-950 border-zinc-800" value={q.marks} onChange={e => updateQuestion(idx, { marks: parseInt(e.target.value) || 0 })} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {questions.length === 0 && (
                   <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/50">
                     No questions added yet. Click the buttons above to add questions.
                   </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-8 border-t border-zinc-800 pt-6">
                <Button variant="ghost" onClick={() => setOpen(false)} className="hover:bg-zinc-800 text-zinc-300">
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={loading || !form.title || !form.startTime || !form.endTime || questions.length === 0} className="bg-emerald-600 hover:bg-emerald-700 min-w-[120px]">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {loading ? 'Creating...' : 'Publish Test'}
                </Button>
              </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
