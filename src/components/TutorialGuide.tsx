"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Terminal, Code2, Play, Send, LayoutDashboard, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- TUTORIAL CONTENT ---
const STEPS = [
  {
    title: "Welcome to the Arena",
    icon: <LayoutDashboard className="w-12 h-12 text-emerald-500" />,
    content: (
      <div className="space-y-3">
        <p>This platform is designed to simulate a real competitive programming environment.</p>
        <p>Unlike some platforms where you just complete a function, here you interact with the <strong>System IO</strong>.</p>
        <div className="bg-zinc-900 p-3 rounded border border-zinc-700 text-xs text-zinc-400">
          <span className="text-emerald-400 font-bold">Goal:</span> Read raw input, process it, and print the result.
        </div>
      </div>
    ),
  },
  {
    title: "Step 1: The Problem View",
    icon: <FileText className="w-12 h-12 text-blue-500" />,
    content: (
      <p>
        On the left side of the screen, you'll find the <strong>Problem Description</strong>, 
        Constraints, and Example Input/Output. Read these carefully! They tell you exactly 
        what format the input data will be in.
      </p>
    ),
  },
  {
    title: "Step 2: The Code Editor",
    icon: <Code2 className="w-12 h-12 text-yellow-500" />,
    content: (
      <p>
        On the right is your IDE. You can select your preferred language (Python, C++, Java, JS).
        <br/><br/>
        <strong>Crucial:</strong> We use the <em>Judge0</em> compiler. This means your code must be a 
        complete program, not just a function.
      </p>
    ),
  },
  {
    title: "Step 3: Handling Input (Stdin)",
    icon: <Terminal className="w-12 h-12 text-purple-500" />,
    content: (
      <div className="space-y-3">
        <p>You must read from <strong>Standard Input</strong>.</p>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="bg-zinc-900 p-2 rounded border border-zinc-700">
            <p className="text-zinc-500 mb-1">// Python Example</p>
            <span className="text-blue-400">import</span> sys<br/>
            data = sys.stdin.read().split()<br/>
            a = <span className="text-yellow-400">int</span>(data[0])
          </div>
          <div className="bg-zinc-900 p-2 rounded border border-zinc-700">
            <p className="text-zinc-500 mb-1">// C++ Example</p>
            <span className="text-blue-400">#include</span> &lt;iostream&gt;<br/>
            <span className="text-blue-400">int</span> main() &#123;<br/>
            &nbsp;&nbsp;<span className="text-blue-400">int</span> a;<br/>
            &nbsp;&nbsp;std::cin &gt;&gt; a;<br/>
            &#125;
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Step 4: Providing Output (Stdout)",
    icon: <Terminal className="w-12 h-12 text-orange-500" />,
    content: (
      <div className="space-y-3">
        <p>Do <strong>NOT</strong> return a value. You must <strong>PRINT</strong> your answer.</p>
        <div className="bg-red-500/10 border border-red-500/20 p-2 rounded text-xs text-red-300">
          ❌ return a + b; <span className="opacity-50">(Will not work)</span>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded text-xs text-emerald-300">
          ✅ print(a + b) <span className="opacity-50">(Python)</span><br/>
          ✅ std::cout &lt;&lt; a + b; <span className="opacity-50">(C++)</span>
        </div>
      </div>
    ),
  },
  {
    title: "Step 5: Run vs. Submit",
    icon: <Play className="w-12 h-12 text-zinc-200" />,
    content: (
      <ul className="list-disc list-inside space-y-2 text-sm text-left pl-4">
        <li>
          <strong className="text-zinc-200"><Play className="w-3 h-3 inline mr-1"/> Run:</strong> 
          Executes your code against the <em>Custom Input</em> or Sample Cases. Use this to debug.
        </li>
        <li>
          <strong className="text-emerald-400"><Send className="w-3 h-3 inline mr-1"/> Submit:</strong> 
          Runs your code against hidden test cases to grade your solution.
        </li>
      </ul>
    ),
  },
  {
    title: "Ready to Code?",
    icon: <Send className="w-12 h-12 text-emerald-500" />,
    content: (
      <div className="text-center space-y-4">
        <p>You are all set. Select a problem from the dashboard and start your streak!</p>
        <p className="text-xs text-zinc-500">
          (You can open this tutorial anytime from the sidebar help icon)
        </p>
      </div>
    ),
  },
];

export function TutorialGuide({ onClose }: { onClose?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Check local storage to see if user has already seen tutorial
  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenTutorial");
    if (hasSeen === "true" && !onClose) { // Only hide auto-show if triggered automatically
      setIsVisible(false);
    }
  }, [onClose]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finishTutorial();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const finishTutorial = () => {
    localStorage.setItem("hasSeenTutorial", "true");
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Progress Bar */}
        <div className="h-1 bg-zinc-900 w-full">
          <div 
            className="h-full bg-emerald-500 transition-all duration-300" 
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Close Button */}
        <button 
          onClick={finishTutorial}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-8 flex flex-col items-center text-center flex-1 min-h-[300px]">
          <div className="mb-6 p-4 bg-zinc-900/50 rounded-full border border-zinc-800">
            {STEPS[currentStep].icon}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">
            {STEPS[currentStep].title}
          </h2>
          
          <div className="text-zinc-400 text-sm leading-relaxed">
            {STEPS[currentStep].content}
          </div>
        </div>

        {/* Footer / Controls */}
        <div className="p-6 border-t border-zinc-900 bg-zinc-900/30 flex justify-between items-center">
          <div className="text-xs text-zinc-500 font-mono">
            {currentStep + 1} / {STEPS.length}
          </div>

          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button 
                variant="ghost" 
                onClick={handlePrev}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <ChevronLeft size={16} className="mr-1" /> Back
              </Button>
            )}
            
            <Button 
              onClick={handleNext}
              className="bg-emerald-600 hover:bg-emerald-500 text-white min-w-[100px]"
            >
              {currentStep === STEPS.length - 1 ? "Finish" : "Next"}
              {currentStep !== STEPS.length - 1 && <ChevronRight size={16} className="ml-1" />}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}