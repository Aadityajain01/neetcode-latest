"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useCommunity } from "@/components/communities/CommunityContext";
import { communityApi, CommunityTest, TestQuestion, TestResult } from "@/lib/api-modules";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, Code, ListTodo, ChevronLeft, ChevronRight, Play, Server, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { isPast, differenceInSeconds } from "date-fns";
import { BackButton } from "@/components/BackButton";
import { CodeExecutor } from "@/components/code-execution";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
type ParamsType = Promise<{ id: string; testId: string }>;

export default function TestTakingInterface(props: { params: ParamsType }) {
  const params = use(props.params);
  const communityId = params.id;
  const testId = params.testId;
  const { community } = useCommunity();
  const router = useRouter();

  const [test, setTest] = useState<CommunityTest | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [codes, setCodes] = useState<Record<string, { language: string, code: string }>>({});
  const [submitting, setSubmitting] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!communityId || !testId) return;
    const fetchTest = async () => {
      try {
        const data = await communityApi.getTestById(communityId, testId);
        setTest(data.test);
        setQuestions(data.questions);
        setHasSubmitted(data.hasSubmitted);
        setResult(data.result);

        const initialCodes: Record<string, any> = {};
        data.questions.forEach((q: TestQuestion) => {
          if (q.type === 'programming') {
             initialCodes[q._id] = { language: q.languages?.[0] || 'javascript', code: '' };
          }
        });
        setCodes(initialCodes);

        const end = new Date(data.test.endTime);
        const durationSec = data.test.durationMinutes * 60;
        const remainingUntilEnd = differenceInSeconds(end, new Date());
        setTimeLeft(Math.min(durationSec, remainingUntilEnd));

      } catch (e) {
        toast.error("Failed to load test");
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [communityId, testId]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !hasSubmitted) {
      const t = setInterval(() => setTimeLeft(l => (l && l > 0 ? l - 1 : 0)), 1000);
      return () => clearInterval(t);
    } else if (timeLeft === 0 && !hasSubmitted) {
      // Auto submit
      handleSubmit();
    }
  }, [timeLeft, hasSubmitted]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answersArr = Object.keys(answers).map(qId => ({ questionId: qId, selectedOption: answers[qId] }));
      const codesArr = Object.keys(codes).filter(qId => codes[qId].code).map(qId => ({
        questionId: qId, code: codes[qId].code, language: codes[qId].language
      }));

      await communityApi.submitTest(communityId, testId, {
        answers: answersArr,
        codeSubmissions: codesArr
      });
      toast.success("Test submitted successfully!");
      setHasSubmitted(true);
      // Refetch to get results
      const data = await communityApi.getTestById(communityId, testId);
      setResult(data.result);
    } catch {
      toast.error("Failed to submit test");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-24"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  if (!test) return <div className="p-12 text-center">Test not found</div>;

  const q = questions[activeIndex];
  const isStarted = test ? isPast(new Date(test.startTime)) : false;
  const isEnded = test ? isPast(new Date(test.endTime)) : false;

  if (!isStarted) {
     return <div className="p-12 text-center text-zinc-500">This test has not started yet.</div>;
  }

  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  if (hasSubmitted || isEnded) {
    if (!result) {
       return (
          <div className="max-w-3xl mx-auto pt-12 text-center">
             <BackButton href={`/communities/${communityId}/tests`} className="mb-6 justify-center" />
             <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 shadow-lg">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-3xl font-black text-white mb-2">Test Submitted</h2>
                <p className="text-zinc-400">Your submission has been received.</p>
                {test.isResultVisible === false && (
                   <div className="mt-6 text-amber-500 bg-amber-500/10 p-4 rounded-xl text-sm border border-amber-500/20">
                     Results are hidden by the instructor. You will be able to see your score when results are published.
                   </div>
                )}
             </div>
          </div>
       );
    }

    return (
       <div className="max-w-5xl mx-auto pt-8 pb-16 animate-in fade-in">
          <BackButton href={`/communities/${communityId}/tests`} className="mb-6" />
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-lg text-center mb-8">
             <h2 className="text-3xl font-black text-white mb-2">{test.title} - Results</h2>
             <div className="text-5xl font-black text-emerald-500 my-6">
                {result.totalScore} <span className="text-2xl text-zinc-500">/ {test.totalMarks}</span>
             </div>
             <div className="flex gap-4 justify-center text-sm font-semibold">
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2">
                   <span className="text-zinc-500 uppercase tracking-wider text-xs block mb-1">MCQ Score</span>
                   <span className="text-white text-lg">{result.mcqScore}</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2">
                   <span className="text-zinc-500 uppercase tracking-wider text-xs block mb-1">Code Score</span>
                   <span className="text-white text-lg">{result.programmingScore}</span>
                </div>
             </div>
          </div>
       </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 w-full h-full relative overflow-hidden">
      {/* Test Header */}
      <div className="h-16 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between px-6 shrink-0 relative">
        <div>
          <h1 className="font-bold text-white text-lg">{test.title}</h1>
          <p className="text-xs text-zinc-400">{questions.length} Questions • {test.totalMarks} Marks</p>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 font-mono font-bold text-xl px-4 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-emerald-400">
             <Clock className="w-5 h-5 text-zinc-500" /> 
             {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
           </div>
           <Button onClick={handleSubmit} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
             {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Submit Test"}
           </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative p-2 md:p-4 max-w-[1920px] mx-auto w-full">
        {!q ? (
          <div className="flex items-center justify-center h-full text-zinc-500">Select a question</div>
        ) : q.type === 'mcq' ? (
          <div className="h-full flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden relative">
              <ScrollArea className="flex-1 p-8 lg:p-12 mb-16">
                 <div className="max-w-4xl mx-auto w-full">
                     <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                           <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
                             Question {activeIndex + 1}
                           </span>
                           <span className="text-zinc-500 text-sm font-medium">{q.marks} Marks</span>
                        </div>
                        <h2 className="text-xl md:text-2xl text-zinc-100 font-medium leading-relaxed">{q.question}</h2>
                     </div>

                     <RadioGroup 
                       value={answers[q._id]?.toString()} 
                       onValueChange={(val) => setAnswers(prev => ({...prev, [q._id]: parseInt(val)}))}
                       className="space-y-3 mt-8"
                     >
                        {q.options?.map((opt, i) => (
                           <label 
                             key={i}
                             className={cn(
                               "flex items-center p-4 rounded-xl border cursor-pointer transition-all",
                               answers[q._id] === i 
                                 ? "border-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                 : "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-700"
                             )}
                           >
                              <RadioGroupItem value={i.toString()} id={`opt-${i}`} className="text-emerald-500 border-zinc-600" />
                              <span className="ml-4 text-zinc-300 font-medium">{opt}</span>
                           </label>
                        ))}
                     </RadioGroup>
                 </div>
              </ScrollArea>
              
              {/* Navigation Footer for MCQ */}
              <div className="absolute bottom-0 inset-x-0 h-16 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur flex items-center justify-between px-6 shrink-0">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-800 font-bold uppercase tracking-wide">
                         <ListTodo className="w-4 h-4 mr-2" /> List Questions
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent side="top" align="start" className="w-[300px] bg-zinc-900 border-zinc-800 p-2 shadow-2xl rounded-xl">
                       <ScrollArea className="h-[300px] w-full pr-4 custom-scrollbar">
                           <div className="space-y-1">
                             {questions.map((question, idx) => (
                               <button
                                 key={question._id}
                                 onClick={() => setActiveIndex(idx)}
                                 className={cn(
                                   "w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-colors",
                                   activeIndex === idx 
                                     ? "bg-zinc-800 border-zinc-700 text-white shadow-sm"
                                     : "bg-zinc-950/50 border-zinc-900 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300 hover:border-zinc-800"
                                 )}
                               >
                                 <div className="flex items-center gap-3 overflow-hidden">
                                   <span className={cn(
                                      "w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0",
                                      activeIndex === idx ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-500"
                                   )}>
                                      {idx + 1}
                                   </span>
                                   <span className="truncate text-xs font-medium">
                                      {question.type === 'mcq' ? 'Multiple Choice' : question.title}
                                   </span>
                                 </div>
                                 {(question.type === 'mcq' ? answers[question._id] !== undefined : !!codes[question._id]?.code) && (
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                 )}
                               </button>
                             ))}
                           </div>
                       </ScrollArea>
                    </PopoverContent>
                  </Popover>

                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      className="border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
                      disabled={activeIndex === 0}
                      onClick={() => setActiveIndex(a => a - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    
                    <span className="text-sm font-medium text-zinc-500 px-2">
                       {activeIndex + 1} of {questions.length}
                    </span>

                    <Button 
                      variant="outline" 
                      className="border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
                      disabled={activeIndex === questions.length - 1}
                      onClick={() => setActiveIndex(a => a + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
              </div>
          </div>
        ) : (
          <ResizablePanelGroup direction="horizontal" className="h-full rounded-xl gap-2">
            
            {/* === LEFT PANEL: Problem Description === */}
            <ResizablePanel defaultSize={40} minSize={30} className="flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden shadow-sm relative">
              <ScrollArea className="flex-1 p-6 space-y-6 mb-16 custom-scrollbar">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-purple-500/10 text-purple-500 border border-purple-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
                          Question {activeIndex + 1}
                        </span>
                        <span className="text-zinc-500 text-sm font-medium">{q.marks} Marks</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-6">{q.title}</h2>
                    <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                        {q.description}
                    </div>
                  </div>

                  <div className="space-y-4 mt-8 pb-4">
                    <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-4">
                      <h4 className="font-bold text-zinc-400 text-[10px] uppercase mb-2 tracking-widest">Input Format</h4>
                      <p className="text-sm text-zinc-300">{q.inputFormat || 'N/A'}</p>
                    </div>
                    <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-4">
                      <h4 className="font-bold text-zinc-400 text-[10px] uppercase mb-2 tracking-widest">Output Format</h4>
                      <p className="text-sm text-zinc-300">{q.outputFormat || 'N/A'}</p>
                    </div>
                    <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-4">
                      <h4 className="font-bold text-zinc-400 text-[10px] uppercase mb-2 tracking-widest">Constraints</h4>
                      <pre className="text-xs text-amber-500/90 font-mono bg-black/30 p-3 rounded-lg overflow-x-auto border border-amber-500/10">{q.constraints || 'None'}</pre>
                    </div>
                  </div>
              </ScrollArea>

              {/* Navigation Footer */}
              <div className="absolute bottom-0 inset-x-0 h-16 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur flex items-center justify-between px-6 shrink-0 z-20">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-800 font-bold uppercase tracking-wide">
                         <ListTodo className="w-4 h-4 mr-2" /> List Questions
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent side="top" align="start" className="w-[300px] bg-zinc-900 border-zinc-800 p-2 shadow-2xl rounded-xl">
                       <ScrollArea className="h-[300px] w-full pr-4 custom-scrollbar">
                           <div className="space-y-1">
                             {questions.map((question, idx) => (
                               <button
                                 key={question._id}
                                 onClick={() => setActiveIndex(idx)}
                                 className={cn(
                                   "w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-colors",
                                   activeIndex === idx 
                                     ? "bg-zinc-800 border-zinc-700 text-white shadow-sm"
                                     : "bg-zinc-950/50 border-zinc-900 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300 hover:border-zinc-800"
                                 )}
                               >
                                 <div className="flex items-center gap-3 overflow-hidden">
                                   <span className={cn(
                                      "w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0",
                                      activeIndex === idx ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-500"
                                   )}>
                                      {idx + 1}
                                   </span>
                                   <span className="truncate text-xs font-medium">
                                      {question.type === 'mcq' ? 'Multiple Choice' : question.title}
                                   </span>
                                 </div>
                                 {(question.type === 'mcq' ? answers[question._id] !== undefined : !!codes[question._id]?.code) && (
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                 )}
                               </button>
                             ))}
                           </div>
                       </ScrollArea>
                    </PopoverContent>
                  </Popover>

                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      className="border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
                      disabled={activeIndex === 0}
                      onClick={() => setActiveIndex(a => a - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    
                    <span className="text-sm font-medium text-zinc-500 px-2">
                       {activeIndex + 1} of {questions.length}
                    </span>

                    <Button 
                      variant="outline" 
                      className="border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
                      disabled={activeIndex === questions.length - 1}
                      onClick={() => setActiveIndex(a => a + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle className="bg-transparent" />

            {/* === RIGHT PANEL: Editable/Testing Layout === */}
            <ResizablePanel defaultSize={60} minSize={40} className="h-full relative overflow-hidden">
              <CodeExecutor 
                problem={{
                  _id: q.problemId || q._id,
                  title: q.title || "",
                  description: q.description || "",
                  difficulty: "Medium",
                  topicTags: [],
                  languages: q.languages || ["javascript"],
                } as any}
                problemType="practice"
                sampleTestCases={q.customTestcases?.filter(t => !t.isHidden).map(tc => ({ 
                  input: tc.input, 
                  expectedOutput: tc.output, 
                  isHidden: false,
                  _id: "fake" 
                })) as any || []}
                initialCode={codes[q._id]?.code}
                onCodeChange={(val) => setCodes(prev => ({...prev, [q._id]: { ...prev[q._id], code: val }}))}
                initialLanguage={codes[q._id]?.language}
                onLanguageChange={(val) => setCodes(prev => ({...prev, [q._id]: { ...prev[q._id], language: val }}))}
              />
            </ResizablePanel>

          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}
