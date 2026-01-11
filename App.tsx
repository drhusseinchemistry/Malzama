
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Page from './components/Page';
import { EditorSettings, PaperSize, MalzamaSection, FloatingImage, FloatingText } from './types';
import { processTextToSections, generateExplanatoryImage, chatWithAI } from './services/geminiService';

const App: React.FC = () => {
  const [sections, setSections] = useState<MalzamaSection[]>([]);
  const [pages, setPages] = useState<MalzamaSection[][]>([]);
  const [floatingImages, setFloatingImages] = useState<FloatingImage[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [isListening, setIsListening] = useState(false);
  
  // Load API Key from LocalStorage on init
  const [settings, setSettings] = useState<EditorSettings>({
    paperSize: PaperSize.A4,
    fontSize: 16,
    fontColor: '#1e293b',
    primaryColor: '#2563eb',
    lineHeight: 1.8,
    teacherName: '',
    apiKey: typeof localStorage !== 'undefined' ? localStorage.getItem('gemini_api_key') || '' : '',
    customFontUrl: undefined
  });

  // Inject custom font style tag
  useEffect(() => {
    if (settings.customFontUrl) {
      const styleId = 'custom-malzama-font-style';
      let styleTag = document.getElementById(styleId);
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
      }
      styleTag.innerHTML = `
        @font-face {
          font-family: 'CustomMalzamaFont';
          src: url('${settings.customFontUrl}');
        }
      `;
    }
  }, [settings.customFontUrl]);

  const paginate = useCallback((allSections: MalzamaSection[]) => {
    const charsPerPage = settings.paperSize === PaperSize.A4 ? 1800 : settings.paperSize === PaperSize.A5 ? 900 : 1600;
    const result: MalzamaSection[][] = [];
    let currentPage: MalzamaSection[] = [];
    let currentCharCount = 0;

    allSections.forEach(section => {
      const sectionLength = section.content.length + section.title.length + 200;
      if (currentCharCount + sectionLength > charsPerPage && currentPage.length > 0) {
        result.push(currentPage);
        currentPage = [section];
        currentCharCount = sectionLength;
      } else {
        currentPage.push(section);
        currentCharCount += sectionLength;
      }
    });

    if (currentPage.length > 0) result.push(currentPage);
    setPages(result);
  }, [settings.paperSize]);

  useEffect(() => {
    paginate(sections);
  }, [sections, settings.paperSize, paginate]);

  const handleTextSubmit = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const { sections: newSections } = await processTextToSections(text, settings.apiKey);
      setSections(newSections);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`خەلەتەک پەیدابوو: ${errorMessage}\nهیڤیە پشت راست بە کو API Key دروستە.`);
    } finally {
      setLoading(false);
    }
  };

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSettings(prev => ({ ...prev, customFontUrl: url }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                const newImg: FloatingImage = {
                    id: Math.random().toString(),
                    src: event.target.result as string,
                    x: 100,
                    y: 100,
                    width: 300,
                    height: 300,
                    rotation: 0,
                    pageIndex: 0
                };
                setFloatingImages(prev => [...prev, newImg]);
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("براوسەرێ تە پشتەڤانیا مایکێ ناکەت.");
      return;
    }

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'ku-IQ'; // Support Kurdish (Iraq) or similar
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        const newText: FloatingText = {
          id: Math.random().toString(),
          content: transcript,
          x: 100,
          y: 200,
          width: 250,
          height: 100, // height might auto-adjust but initial box
          rotation: 0,
          fontSize: 18,
          color: '#000000',
          pageIndex: 0
        };
        setFloatingTexts(prev => [...prev, newText]);
      }
    };

    recognition.start();
  };

  const handleAskAI = async (q: string) => {
    setChatHistory(prev => [...prev, { role: 'user', text: q }]);
    try {
        const answer = await chatWithAI(q, settings.apiKey);
        if (answer) {
            setChatHistory(prev => [...prev, { role: 'ai', text: answer }]);
        }
    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setChatHistory(prev => [...prev, { role: 'ai', text: `خەلەتەک: ${errorMessage}` }]);
    }
  };

  const insertChatAnswer = (text: string) => {
    const newSection: MalzamaSection = {
      id: Math.random().toString(),
      title: "بەرسڤا مامۆستایێ زیرەک",
      content: text
    };
    setSections(prev => [...prev, newSection]);
    setShowChat(false);
  };

  const createAIImage = async () => {
    const desc = window.prompt("نڤیسینا وێنەی چ بێتن؟ (ب ئینگلیزی ب نڤیسە باشترە)");
    if (!desc) return;
    setLoading(true);
    try {
      const src = await generateExplanatoryImage(desc, settings.apiKey);
      if (src) {
        const newImg: FloatingImage = {
          id: Math.random().toString(),
          src,
          x: 200,
          y: 300,
          width: 350,
          height: 350,
          rotation: 0,
          pageIndex: 0
        };
        setFloatingImages(prev => [...prev, newImg]);
      } else {
        alert("نەشیا وێنەی دروست بکەت. تکایە دووبارە بکە.");
      }
    } catch (error: any) {
        console.error(error);
        const isQuota = error.message?.includes("429") || error.message?.includes("Quota") || error.message?.includes("RESOURCE_EXHAUSTED");
        if (isQuota) {
            alert("بوورە، باڵانسا بەلاش یا Google AI ب دوماهیک هات. تکایە کێمەکێ بووەستە یان وێنەی ژ لایێ خۆ ئەپلۆد بکە ب رێکا دوکمەیا 'ئەپلۆدکرنا وێنەی'.");
        } else {
            alert(`خەلەتیا وێنەی: ${error.message}`);
        }
    } finally {
      setLoading(false);
    }
  };

  // Generalized updater for items (Images or Text)
  const updateItem = (type: 'image' | 'text', id: string, updates: any) => {
    if (type === 'image') {
      setFloatingImages(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img));
    } else {
      setFloatingTexts(prev => prev.map(txt => txt.id === id ? { ...txt, ...updates } : txt));
    }
  };

  const updateSectionContent = (id: string, newContent: string) => {
     setSections(prev => prev.map(sec => sec.id === id ? { ...sec, content: newContent } : sec));
  };

  const downloadPDF = () => {
    window.print();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f2f5]">
      <Sidebar 
        settings={settings} 
        updateSettings={(s) => setSettings(prev => ({ ...prev, ...s }))}
        onGenerateImage={createAIImage}
        onUploadImage={handleImageUpload}
        onAskAI={() => setShowChat(true)}
        onDownloadPDF={downloadPDF}
        onUploadFont={handleFontUpload}
        onVoiceInput={handleVoiceInput}
        isListening={isListening}
      />

      <main className="flex-1 overflow-y-auto p-12 relative no-scrollbar bg-slate-100">
        {sections.length === 0 && !loading && (
          <div className="max-w-3xl mx-auto mt-20 p-12 bg-white rounded-[40px] shadow-2xl border border-white no-print">
            <h2 className="text-4xl font-black text-gray-900 mb-6 text-center">چێکرنا مەلزەمێ ب شێوازەکێ مودرێن</h2>
            <p className="text-gray-500 mb-10 text-center text-lg">نڤیسینا خۆ ل ڤێرە دانێ دا مامۆستایێ زیرەک بۆتە رێک بێخیت و دیزاینەکا جوان بدەتێ.</p>
            <textarea 
              className="w-full h-80 p-8 rounded-3xl border-2 border-gray-100 focus:border-blue-500 focus:outline-none transition resize-none bg-gray-50 text-xl leading-relaxed"
              placeholder="نڤیسینا خۆ ل ڤێرە بنڤیسە..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="flex justify-center mt-10">
                <button 
                  onClick={() => handleTextSubmit(prompt)}
                  className="px-16 py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-2xl shadow-blue-200 hover:bg-blue-700 transition active:scale-95"
                >
                  دەستپێبکە
                </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center no-print">
            <div className="relative">
                <div className="w-24 h-24 border-8 border-blue-100 rounded-full"></div>
                <div className="w-24 h-24 border-8 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="mt-8 text-2xl font-black text-gray-900 tracking-tight animate-pulse">
                {sections.length > 0 ? "PDF یێ دهێتە دروستکرن..." : "زیرەکی یێ کار لسەر دکەت..."}
            </p>
          </div>
        )}

        <div className="flex flex-col items-center pb-20" id="malzama-print-area">
          {pages.map((pageSections, i) => (
            <Page 
              key={i}
              index={i}
              sections={pageSections}
              settings={settings}
              floatingImages={floatingImages}
              floatingTexts={floatingTexts}
              onItemUpdate={updateItem}
              onSectionUpdate={updateSectionContent}
            />
          ))}
        </div>
        
        {pages.length > 0 && (
             <div className="text-center no-print">
                 <button 
                    onClick={() => setSections(prev => [...prev, { id: Math.random().toString(), title: "بابەتەکێ نوو", content: "ل ڤێرە بنڤیسە..." }])}
                    className="mt-4 px-8 py-3 bg-white text-gray-900 rounded-full font-bold shadow-lg border hover:bg-gray-50 transition"
                >
                    + زێدەکرنا لاپەرەکێ دی
                </button>
             </div>
        )}
      </main>

      {/* AI Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-md px-4 no-print">
          <div className="bg-white w-full max-w-2xl h-[750px] rounded-[40px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
            <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black">پسیارێ ژ زیرەکی بکە</h3>
                <p className="text-white/70 text-sm font-medium">ب شێوازەکێ بادینی جابا تە ددەت</p>
              </div>
              <button 
                onClick={() => setShowChat(false)} 
                className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition"
              >&times;</button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto space-y-6 no-scrollbar bg-gray-50/50">
              {chatHistory.length === 0 && (
                  <div className="text-center mt-20 opacity-30">
                      <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                      <p className="font-bold">چ جاران پسیار نەکریە</p>
                  </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] p-5 rounded-3xl shadow-sm leading-relaxed ${msg.role === 'user' ? 'bg-white text-gray-900 font-medium' : 'bg-blue-600 text-white font-bold'}`}>
                    {msg.text}
                    {msg.role === 'ai' && (
                      <button 
                        onClick={() => insertChatAnswer(msg.text)}
                        className="flex items-center gap-2 mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        زێدە بکە بۆ مەلزەمێ
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 border-t bg-white">
              <div className="relative group">
                <input 
                    type="text" 
                    placeholder="پسیارا تە چیە؟..." 
                    className="w-full border-2 border-gray-100 rounded-2xl px-8 py-5 pr-20 focus:outline-none focus:border-blue-500 transition font-bold text-lg"
                    onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleAskAI(e.currentTarget.value);
                        e.currentTarget.value = '';
                    }
                    }}
                />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300 opacity-0 group-hover:opacity-100 transition">بۆ ناردنێ Enter لێ بدە</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
