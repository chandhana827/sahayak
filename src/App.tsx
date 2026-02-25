/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  BookOpen, 
  Camera, 
  HelpCircle, 
  Image as ImageIcon, 
  Calendar, 
  Languages, 
  ChevronRight, 
  Loader2,
  Download,
  Printer,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { cn } from './lib/utils';
import { 
  generateLocalizedContent, 
  differentiateWorksheet, 
  getSimpleExplanation, 
  generateVisualAid, 
  generateLessonPlan,
  generateWorksheetFromTopic
} from './services/gemini';

type Tool = 'content' | 'worksheet' | 'knowledge' | 'visual' | 'planner' | null;

export default function App() {
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [imageResult, setImageResult] = useState<string | null>(null);
  
  // Form states
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('Hindi');
  const [grades, setGrades] = useState<string[]>(['Grade 1', 'Grade 2']);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runTool = async () => {
    setLoading(true);
    setResult(null);
    setImageResult(null);
    try {
      switch (activeTool) {
        case 'content':
          const content = await generateLocalizedContent(prompt, language);
          setResult(content || "Failed to generate content.");
          break;
        case 'worksheet':
          if (selectedImage) {
            const base64Data = selectedImage.split(',')[1];
            const mimeType = selectedImage.split(';')[0].split(':')[1];
            const worksheet = await differentiateWorksheet(base64Data, mimeType, grades);
            setResult(worksheet || "Failed to generate worksheet.");
          } else if (prompt) {
            const worksheet = await generateWorksheetFromTopic(prompt, grades, language);
            setResult(worksheet || "Failed to generate worksheet.");
          }
          break;
        case 'knowledge':
          const explanation = await getSimpleExplanation(prompt, language);
          setResult(explanation || "Failed to get explanation.");
          break;
        case 'visual':
          const visual = await generateVisualAid(prompt);
          setImageResult(visual);
          break;
        case 'planner':
          const plan = await generateLessonPlan(prompt, grades, "1 Week");
          setResult(plan || "Failed to generate plan.");
          break;
      }
    } catch (error) {
      console.error(error);
      setResult("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tools = [
    { id: 'content', name: 'Hyper-Local Content', icon: Languages, color: 'bg-orange-500/10 text-orange-400', desc: 'Stories & lessons in local languages' },
    { id: 'worksheet', name: 'Worksheet Maker', icon: Camera, color: 'bg-blue-500/10 text-blue-400', desc: 'Create worksheets from topics or photos' },
    { id: 'knowledge', name: 'Instant Knowledge', icon: HelpCircle, color: 'bg-emerald-500/10 text-emerald-400', desc: 'Simple answers for student questions' },
    { id: 'visual', name: 'Visual Aid Designer', icon: ImageIcon, color: 'bg-purple-500/10 text-purple-400', desc: 'Simple drawings for the blackboard' },
    { id: 'planner', name: 'Lesson Planner', icon: Calendar, color: 'bg-rose-500/10 text-rose-400', desc: 'Weekly plans for multi-grade classes' },
  ];

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#E5E5E5] font-sans selection:bg-orange-500/30">
      {/* Header */}
      <header className="border-b border-stone-800 bg-[#0F0F0F]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActiveTool(null); setResult(null); setImageResult(null); }}>
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-white">Pathshala</h1>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-stone-500 -mt-1">AI Teaching Companion</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-stone-500 hover:text-stone-300 transition-colors">
              <Languages size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!activeTool ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-serif italic text-white">Namaste, Teacher.</h2>
                <p className="text-stone-400 max-w-lg">How can I help you support your students today? Select a tool to begin.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id as Tool)}
                    className="group flex items-start gap-4 p-6 bg-[#1A1A1A] border border-stone-800 rounded-3xl hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/5 transition-all text-left"
                  >
                    <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", tool.color)}>
                      <tool.icon size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1 text-white">{tool.name}</h3>
                      <p className="text-sm text-stone-400 leading-relaxed">{tool.desc}</p>
                    </div>
                    <ChevronRight className="text-stone-600 group-hover:text-orange-400 transition-colors mt-1" size={20} />
                  </button>
                ))}
              </div>

              <div className="p-8 bg-[#1A1A1A] rounded-[2rem] border border-stone-800 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-4">
                  <h3 className="text-xl font-bold text-white">New: Audio Reading Assessment</h3>
                  <p className="text-stone-400">Record a student reading a passage and get instant feedback on fluency and pronunciation.</p>
                  <button className="px-6 py-2.5 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors">
                    Try it now
                  </button>
                </div>
                <div className="w-32 h-32 bg-[#252525] rounded-full flex items-center justify-center shadow-inner">
                  <BookOpen size={48} className="text-stone-600" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="tool-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <button 
                onClick={() => { setActiveTool(null); setResult(null); setImageResult(null); }}
                className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors font-medium mb-4"
              >
                <ArrowLeft size={18} />
                Back to Dashboard
              </button>

              <div className="bg-[#1A1A1A] border border-stone-800 rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className={cn("p-4 rounded-2xl", tools.find(t => t.id === activeTool)?.color)}>
                    {React.createElement(tools.find(t => t.id === activeTool)?.icon || HelpCircle, { size: 32 })}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{tools.find(t => t.id === activeTool)?.name}</h2>
                    <p className="text-stone-400">{tools.find(t => t.id === activeTool)?.desc}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Common Inputs */}
                  {(activeTool === 'content' || activeTool === 'knowledge' || activeTool === 'visual' || activeTool === 'planner' || activeTool === 'worksheet') && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-stone-500">
                        {activeTool === 'visual' ? 'Describe the drawing' : activeTool === 'planner' ? 'Topic' : activeTool === 'worksheet' ? 'Topic Name (e.g., Photosynthesis)' : 'Your Request'}
                      </label>
                      <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={
                          activeTool === 'content' ? "e.g., A story about a brave farmer in Maharashtra..." :
                          activeTool === 'knowledge' ? "e.g., Why is the sky blue?" :
                          activeTool === 'visual' ? "e.g., The water cycle showing evaporation and rain..." :
                          activeTool === 'worksheet' ? "Enter topic name for MCQs, Fill in blanks, etc." :
                          "e.g., Solar System"
                        }
                        className="w-full p-4 bg-[#252525] border border-stone-800 text-white rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all min-h-[120px]"
                      />
                    </div>
                  )}

                  {activeTool === 'worksheet' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-stone-800"></div>
                        <span className="text-xs font-bold text-stone-600 uppercase tracking-widest">OR</span>
                        <div className="h-px flex-1 bg-stone-800"></div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Upload Textbook Photo</label>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full aspect-video bg-[#252525] border-2 border-dashed border-stone-800 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#2A2A2A] transition-colors overflow-hidden relative"
                        >
                          {selectedImage ? (
                            <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <Camera size={48} className="text-stone-700 mb-2" />
                              <p className="text-stone-500 font-medium">Click to upload or take a photo</p>
                            </>
                          )}
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            accept="image/*" 
                            className="hidden" 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(activeTool === 'content' || activeTool === 'knowledge' || activeTool === 'worksheet') && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Language</label>
                        <select 
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full p-4 bg-[#252525] border border-stone-800 text-white rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20"
                        >
                          {['Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Bengali', 'Kannada', 'English'].map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {(activeTool === 'worksheet' || activeTool === 'planner') && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Grades</label>
                        <div className="flex flex-wrap gap-2">
                          {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'].map(grade => (
                            <button
                              key={grade}
                              onClick={() => setGrades(prev => prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade])}
                              className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                                grades.includes(grade) 
                                  ? "bg-orange-500 text-white" 
                                  : "bg-[#252525] text-stone-500 hover:bg-[#2A2A2A]"
                              )}
                            >
                              {grade}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={runTool}
                    disabled={loading || (!prompt && !selectedImage)}
                    className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/20 hover:bg-orange-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={24} />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={24} />
                        Generate with Pathshala
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Results Area */}
              <AnimatePresence>
                {(result || imageResult) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1A1A1A] border border-stone-800 rounded-[2.5rem] p-8 shadow-sm space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                      <h3 className="text-xl font-bold text-white">Your Result</h3>
                      <div className="flex gap-2">
                        <button className="p-2 text-stone-500 hover:text-white transition-colors">
                          <Download size={20} />
                        </button>
                        <button className="p-2 text-stone-500 hover:text-white transition-colors">
                          <Printer size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="prose prose-invert max-w-none">
                      {imageResult ? (
                        <div className="space-y-4">
                          <img src={imageResult} alt="Visual Aid" className="w-full rounded-2xl border border-stone-800" />
                          <p className="text-sm text-stone-500 italic text-center">This drawing is designed to be easily replicated on a blackboard.</p>
                        </div>
                      ) : (
                        <div className="markdown-body">
                          <Markdown>{result || ""}</Markdown>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-12 text-center text-stone-600 text-sm">
        <p>© 2026 Pathshala AI. Built for the heroes in our classrooms.</p>
      </footer>
    </div>
  );
}
