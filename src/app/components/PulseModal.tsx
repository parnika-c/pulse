import { useState, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { DailyCard, User } from "../App";
import { X, Sparkles, RefreshCw, Mic, MicOff, Keyboard } from "lucide-react";
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
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 px-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <Dialog.Title className="text-lg text-white">Drop today's brain dump</Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto">
              <AnimatePresence mode="wait">
                {modalState === "input" && (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Mode Toggle */}
                    <div className="flex gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                      <button
                        onClick={() => {
                          setInputMode("text");
                          if (isRecording) stopRecording();
                        }}
                        className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                          inputMode === "text"
                            ? "bg-zinc-800 text-white"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        <Keyboard className="w-4 h-4" />
                        <span className="text-sm">Type</span>
                      </button>
                      <button
                        onClick={() => setInputMode("voice")}
                        className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                          inputMode === "voice"
                            ? "bg-zinc-800 text-white"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        <Mic className="w-4 h-4" />
                        <span className="text-sm">Voice</span>
                      </button>
                    </div>

                    {/* Text Input */}
                    {inputMode === "text" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                      >
                        <textarea
                          value={rawInput}
                          onChange={(e) => setRawInput(e.target.value)}
                          placeholder="Type a messy paragraph about your day...&#10;&#10;Example: 'ugh today was insane, had a 4 hour sprint planning that felt like it would never end, my brain is fried but at least I finally wrapped up the book layout I've been putting off for weeks, feeling accomplished but also completely dead'"
                          className="w-full min-h-[200px] bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-zinc-600 text-white"
                          autoFocus
                        />
                      </motion.div>
                    )}

                    {/* Voice Input */}
                    {inputMode === "voice" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                      >
                        <div className="min-h-[200px] bg-zinc-950 border border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center gap-6">
                          {!isRecording && !rawInput && (
                            <>
                              <div className="text-center">
                                <p className="text-sm text-zinc-400 mb-2">
                                  Tap the mic to start recording
                                </p>
                                <p className="text-xs text-zinc-600">
                                  Speak naturally about your day
                                </p>
                              </div>
                              <button
                                onClick={startRecording}
                                className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 flex items-center justify-center hover:from-purple-500/30 hover:to-pink-500/30 transition-all group"
                              >
                                <Mic className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
                              </button>
                            </>
                          )}

                          {isRecording && (
                            <>
                              <motion.div
                                animate={{
                                  scale: [1, 1.2, 1],
                                  opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                                className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center"
                              >
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/40 to-pink-500/40 flex items-center justify-center">
                                  <Mic className="w-10 h-10 text-red-400" />
                                </div>
                              </motion.div>
                              <div className="text-center">
                                <p className="text-sm text-white mb-1">Recording...</p>
                                <p className="text-xs text-zinc-500">
                                  Tap to stop when you're done
                                </p>
                              </div>
                              <button
                                onClick={stopRecording}
                                className="px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-2"
                              >
                                <MicOff className="w-4 h-4" />
                                Stop Recording
                              </button>
                            </>
                          )}

                          {!isRecording && rawInput && (
                            <div className="w-full space-y-4">
                              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                Recording complete
                              </div>
                              <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                                <p className="text-sm text-zinc-300 italic">"{rawInput}"</p>
                              </div>
                              <button
                                onClick={() => {
                                  setRawInput("");
                                  startRecording();
                                }}
                                className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                              >
                                Re-record
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Generate Button */}
                    <button
                      onClick={handleGenerate}
                      disabled={!rawInput.trim()}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-xl flex items-center justify-center gap-2 hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-500 disabled:hover:to-pink-500 shadow-lg shadow-purple-500/20"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span className="font-medium">AI Ghostwrite</span>
                    </button>
                  </motion.div>
                )}

                {modalState === "loading" && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-20"
                  >
                    <motion.div
                      animate={{
                        rotate: 360,
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                        scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                      }}
                    >
                      <Sparkles className="w-16 h-16 text-purple-400" />
                    </motion.div>
                    <motion.p
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="mt-6 text-sm text-zinc-400"
                    >
                      AI is filtering the noise...
                    </motion.p>
                  </motion.div>
                )}

                {modalState === "refinement" && (
                  <motion.div
                    key="refinement"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Mood Selection */}
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Mood</label>
                      <select
                        value={selectedMood}
                        onChange={(e) => setSelectedMood(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white"
                      >
                        {MOODS.map((mood) => (
                          <option key={mood} value={mood}>
                            {mood}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sentence Input */}
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">
                        One-Sentence Summary
                      </label>
                      <textarea
                        value={refinedSentence}
                        onChange={(e) => setRefinedSentence(e.target.value)}
                        className="w-full min-h-[100px] bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleRegenerate}
                        className="flex-1 bg-zinc-800 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors border border-zinc-700"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Regenerate
                      </button>
                      <button
                        onClick={handleApprove}
                        disabled={!refinedSentence.trim()}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                      >
                        Approve & Post
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
