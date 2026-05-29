import { useState, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { DailyCard, User } from "../App";
import { X, Sparkles, RefreshCw, Mic, MicOff, Keyboard, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PulseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (card: DailyCard) => void;
  currentUser: User;
}

const MOODS = [
  "Exhausted",
  "Creative",
  "Accomplished",
  "Reflective",
  "Energized",
  "Overwhelmed",
  "Peaceful",
  "Anxious",
];

type ModalState = "input" | "loading" | "refinement";
type InputMode = "text" | "voice";

export function PulseModal({ isOpen, onClose, onSubmit, currentUser }: PulseModalProps) {
  const [modalState, setModalState] = useState<ModalState>("input");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [rawInput, setRawInput] = useState("");
  const [selectedMood, setSelectedMood] = useState("Exhausted");
  const [refinedSentence, setRefinedSentence] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleGenerate = () => {
    if (!rawInput.trim()) return;

    setModalState("loading");

    setTimeout(() => {
      const generated = generateAISuggestion(rawInput);
      setSelectedMood(generated.mood);
      setRefinedSentence(generated.sentence);
      setModalState("refinement");
    }, 1500);
  };

  const handleRegenerate = () => {
    setModalState("loading");
    setTimeout(() => {
      const generated = generateAISuggestion(rawInput);
      setSelectedMood(generated.mood);
      setRefinedSentence(generated.sentence);
      setModalState("refinement");
    }, 1000);
  };

  const handleApprove = () => {
    const card: DailyCard = {
      id: "1",
      userId: currentUser.id,
      userName: currentUser.name,
      mood: selectedMood,
      sentence: refinedSentence,
      rawInput: rawInput,
      timestamp: new Date(),
    };
    onSubmit(card);
    resetModal();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });

        // Simulate speech-to-text (in a real app, you'd use a service like Whisper)
        const mockTranscription = simulateSpeechToText();
        setRawInput(mockTranscription);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const resetModal = () => {
    setModalState("input");
    setInputMode("text");
    setRawInput("");
    setSelectedMood("Exhausted");
    setRefinedSentence("");
    setIsRecording(false);
  };

  const handleClose = () => {
    if (isRecording) {
      stopRecording();
    }
    resetModal();
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-hidden">
          
          {/* Ambient Aura Background Layer */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-zinc-950 rounded-[2.5rem] border border-white/10 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col p-1"
          >
            {/* Global Ambient Glow Nodes */}
            <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-purple-600/15 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-pink-600/15 blur-[80px] pointer-events-none" />

            {/* Inner Content Layer */}
            <div className="relative flex flex-col bg-zinc-950/60 backdrop-blur-xl rounded-[2.3rem] overflow-hidden max-h-[calc(90vh-8px)]">
              
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-2">
                  <div>
                    <Dialog.Title className="text-base font-semibold text-white tracking-tight">Drop today's brain dump</Dialog.Title>
                  </div>
                </div>
                <Dialog.Close asChild>
                  <button className="p-2 hover:bg-white/5 rounded-full transition-all text-zinc-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </Dialog.Close>
              </div>

              {/* View Controller (States) */}
              <div className="p-6 overflow-y-auto">
                <AnimatePresence mode="wait">
                  
                  {/* STATE 1: INPUT STATE */}
                  {modalState === "input" && (
                    <motion.div
                      key="input"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-5"
                    >
                      {/* Interactive Card Container with Inner Aura Glow */}
                      <div className="group relative">
                        {/* Dynamic Input Glow (Highlights on Focus / Active Record) */}
                        <div 
                          className={`absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl transition-all duration-500 opacity-0 min-h-[220px] pointer-events-none
                            ${isRecording ? "opacity-100 scale-[1.02] animate-pulse" : "group-focus-within:opacity-100"}
                          `} 
                        />

                        {/* Textured Layer Container */}
                        <div className="relative rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-md overflow-hidden min-h-[220px] flex flex-col">
                          
                          {/* Sleek Mode Switcher */}
                          <div className="flex gap-2 p-1.5 bg-zinc-950/60 border-b border-white/5">
                            <button
                              onClick={() => {
                                setInputMode("text");
                                if (isRecording) stopRecording();
                              }}
                              className={`flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                                inputMode === "text"
                                  ? "bg-white/10 text-white shadow-sm font-medium"
                                  : "text-zinc-500 hover:text-zinc-300"
                              }`}
                            >
                              <Keyboard className="w-4 h-4" />
                              <span className="text-sm">Type</span>
                            </button>
                            <button
                              onClick={() => setInputMode("voice")}
                              className={`flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                                inputMode === "voice"
                                  ? "bg-white/10 text-white shadow-sm font-medium"
                                  : "text-zinc-500 hover:text-zinc-300"
                              }`}
                            >
                              <Mic className="w-4 h-4" />
                              <span className="text-sm">Voice</span>
                            </button>
                          </div>

                          {/* Interactive Area Body */}
                          <div className="flex-1 flex flex-col p-4">
                            {inputMode === "text" && (
                              <textarea
                                value={rawInput}
                                onChange={(e) => setRawInput(e.target.value)}
                                placeholder="Type a messy paragraph about your day..."
                                className="w-full flex-1 min-h-[140px] bg-transparent text-sm resize-none focus:outline-none placeholder:text-zinc-600 text-white leading-relaxed"
                                autoFocus
                              />
                            )}

                            {inputMode === "voice" && (
                              <div className="flex-1 flex flex-col items-center justify-center gap-4 py-2 min-h-[140px]">
                                {!isRecording && !rawInput && (
                                  <>
                                    <div className="text-center">
                                      <p className="text-sm text-zinc-400 mb-1">Tap the mic to start recording</p>
                                      <p className="text-xs text-zinc-600">Speak naturally about your day</p>
                                    </div>
                                    <button
                                      onClick={startRecording}
                                      className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 flex items-center justify-center hover:from-purple-500/20 hover:to-pink-500/20 transition-all group/mic"
                                    >
                                      <Mic className="w-6 h-6 text-purple-400 group-hover/mic:scale-110 transition-transform" />
                                    </button>
                                  </>
                                )}

                                {isRecording && (
                                  <>
                                    <div className="text-center">
                                      <p className="text-sm text-white mb-1 font-medium">Recording...</p>
                                      <p className="text-xs text-zinc-500">Tap to stop when you're done</p>
                                    </div>
                                    <button
                                      onClick={stopRecording}
                                      className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2 text-xs font-medium"
                                    >
                                      <MicOff className="w-3.5 h-3.5" />
                                      Stop Recording
                                    </button>
                                  </>
                                )}

                                {!isRecording && rawInput && (
                                  <div className="w-full space-y-3">
                                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                      Audio processed successfully
                                    </div>
                                    <div className="bg-zinc-950/40 rounded-xl p-3 border border-white/5">
                                      <p className="text-sm text-zinc-300 italic">"{rawInput}"</p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        setRawInput("");
                                        startRecording();
                                      }}
                                      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-4"
                                    >
                                      Re-record memo
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Main Call to Action Button */}
                      <button
                        onClick={handleGenerate}
                        disabled={!rawInput.trim()}
                        className="group relative w-full overflow-hidden rounded-2xl bg-zinc-200 p-4 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none shadow-xl"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 transition-opacity group-hover:opacity-100" />
                        <span className="relative flex items-center justify-center gap-2 font-bold text-black group-hover:text-white transition-colors text-sm tracking-tight">
                          <Sparkles className="w-4 h-4" />
                          AI Refine
                        </span>
                      </button>
                    </motion.div>
                  )}

                  {/* STATE 2: LOADING STATE */}
                  {modalState === "loading" && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-20 relative overflow-hidden"
                    >
                      {/* Concentric Aura Rings */}
                      <div className="relative flex items-center justify-center h-32 w-32 blur-2xl">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/20 to-pink-500/20 border border-white/5"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ 
                              scale: [0.8, 1.5], 
                              opacity: [0, 0.5, 0],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 1,
                              ease: "easeInOut",
                            }}
                          />
                        ))}
                        
                        {/* Central "Core" */}
                        <motion.div
                          animate={{ 
                            scale: [1, 1.1, 1],
                            opacity: [0.8, 1, 0.8] 
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="relative z-10 w-4 h-4 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                        />
                      </div>

                      <div className="mt-10 text-center space-y-1">
                        <motion.p
                          animate={{ opacity: [0.3, 0.7, 0.3] }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                          className="text-sm font-light tracking-[0.2em] text-white uppercase"
                        >
                          Distilling
                        </motion.p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
                          Finding the essence of your day
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* STATE 3: REFINEMENT STATE */}
                  {modalState === "refinement" && (
                    <motion.div
                      key="refinement"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {/* Vibe Selection Tags */}
                      <div className="space-y-2.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Current Vibe</label>
                        <div className="flex flex-wrap gap-1.5">
                          {MOODS.map((mood) => (
                            <button
                              key={mood}
                              onClick={() => setSelectedMood(mood)}
                              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                                selectedMood === mood 
                                  ? "bg-zinc-500 text-white shadow-lg shadow-zinc-500/20" 
                                  : "bg-white/5 text-zinc-400 hover:bg-white/10"
                              }`}
                            >
                              {mood}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Interactive Output Summary Field */}
                      <div className="relative rounded-2xl bg-gradient-to-b from-white/10 to-transparent p-[1px]">
                        <div className="rounded-[15px] bg-zinc-900/80 p-4">
                          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                            One-Sentence Summary
                          </label>
                          <textarea
                            value={refinedSentence}
                            onChange={(e) => setRefinedSentence(e.target.value)}
                            className="w-full min-h-[90px] bg-transparent text-white text-base leading-relaxed focus:outline-none resize-none"
                          />
                        </div>
                      </div>

                      {/* Control Form Actions */}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handleRegenerate}
                          className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors shrink-0"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleApprove}
                          disabled={!refinedSentence.trim()}
                          className="flex-1 rounded-2xl bg-zinc-200 h-14 font-bold text-black hover:bg-zinc-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-40"
                        >
                          <Check className="w-4 h-4" />
                          Approve & Post
                        </button>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Mock speech-to-text simulation
function simulateSpeechToText(): string {
  const examples = [
    "today was absolutely wild, started with back to back meetings that went way over time, then had to rush to finish that presentation for the client, barely had time for lunch but got it done and they loved it so feeling pretty good right now",
    "honestly just feeling super drained today, been working nonstop on this project and it feels like there's no end in sight, need to remember to take breaks but it's hard when there's so much to do",
    "what a great day! finally shipped that feature I've been working on for weeks, the team celebrated with coffee and just feeling really accomplished and energized",
  ];
  return examples[Math.floor(Math.random() * examples.length)];
}

// Mock AI suggestion generator
function generateAISuggestion(input: string): { mood: string; sentence: string } {
  const lowercaseInput = input.toLowerCase();

  let mood = "Reflective";
  if (
    lowercaseInput.includes("exhausted") ||
    lowercaseInput.includes("tired") ||
    lowercaseInput.includes("fried") ||
    lowercaseInput.includes("drained")
  ) {
    mood = "Exhausted";
  } else if (lowercaseInput.includes("creative") || lowercaseInput.includes("design")) {
    mood = "Creative";
  } else if (
    lowercaseInput.includes("accomplished") ||
    lowercaseInput.includes("finished") ||
    lowercaseInput.includes("shipped")
  ) {
    mood = "Accomplished";
  } else if (lowercaseInput.includes("energized") || lowercaseInput.includes("excited")) {
    mood = "Energized";
  } else if (lowercaseInput.includes("overwhelmed") || lowercaseInput.includes("stressed")) {
    mood = "Overwhelmed";
  } else if (lowercaseInput.includes("peaceful") || lowercaseInput.includes("calm")) {
    mood = "Peaceful";
  } else if (lowercaseInput.includes("anxious") || lowercaseInput.includes("worried")) {
    mood = "Anxious";
  }

  const sentences = input.split(/[.!?]+/).filter((s) => s.trim());
  const mainSentence = sentences[0]?.trim() || input.slice(0, 120);

  let sentence = mainSentence.replace(/^(ugh|so|well|basically|like)\s+/i, "").trim();

  sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
  if (!sentence.endsWith(".")) {
    sentence += ".";
  }

  if (sentence.length > 120) {
    sentence = sentence.slice(0, 117) + "...";
  }

  return { mood, sentence };
}
