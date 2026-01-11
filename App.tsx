
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [isSidebarOpen, setSidebarOpen] = useState(false); 
  const [micLang, setMicLang] = useState('ckb-IQ');
  
  // New States for User Request
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activePageIndex, setActivePageIndex] = useState(0);
  
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

  // Active Page Detection (Scroll Observer)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-page-index') || '0');
            setActivePageIndex(index);
        }
      });
    }, { threshold: 0.4 }); // Trigger when 40% of page is visible

    const pageElements = document.querySelectorAll('.malzama-page-container');
    pageElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [pages, zoomLevel]); // Re-run when pages or zoom changes

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
                    pageIndex: activePageIndex // Add to currently visible page
                };
                setFloatingImages(prev => [...prev, newImg]);
                alert(`وێنە ل لاپەرە ${activePageIndex + 1} هاتە زێدەکرن`);
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const handleAddIcon = (svgString: string) => {
    const blob = new Blob([svgString], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    const newImg: FloatingImage = {
        id: Math.random().toString(),
        src: url,
        x: 100,
        y: 100,
        width: 150,
        height: 150,
        rotation: 0,
        pageIndex: activePageIndex // Add to currently visible page
    };
    setFloatingImages(prev => [...prev, newImg]);
    setSidebarOpen(false);
  };

  const handleAddManualText = () => {
    const newText: FloatingText = {
        id: Math.random().toString(),
        content: "نڤیسینا خۆ لێرە بنڤیسە",
        x: 100,
        y: 200,
        width: 250,
        height: 100,
        rotation: 0,
        fontSize: 18,
        color: '#000000',
        pageIndex: activePageIndex // Add to currently visible page
    };
    setFloatingTexts(prev => [...prev, newText]);
    setSidebarOpen(false);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("براوسەرێ تە پشتەڤانیا مایکێ ناکەت.");
      return;
    }

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = micLang;
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
          height: 100,
          rotation: 0,
          fontSize: 18,
          color: '#000000',
          pageIndex: activePageIndex // Add to currently visible page
        };
        setFloatingTexts(prev => [...prev, newText]);
      }
    };
    
    recognition.onerror = (event: any) => {
        console.error("Speech error", event);
        alert("خەلەتیا مایکێ: " + event.error);
        setIsListening(false);
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
          pageIndex: activePageIndex // Add to currently visible page
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
    // 100% Reliable PDF Generation using html2pdf
    // This captures the DOM as a canvas/image, preserving all styles, images, and backgrounds exactly as seen.
    
    // @ts-ignore
    if (typeof window.html2pdf === 'undefined') {
        alert("تکایە کێمەکێ بووەستە تا کتێبخانەیا PDF بار دکەت یان ئینتەرنێتا خۆ بپشکنە.");
        return;
    }

    const element = document.getElementById('malzama-print-area');
    if (!element) return;

    // Apply PDF-specific styles (remove gaps, resets)
    document.body.classList.add('pdf-mode');
    
    // Save current transform to restore later
    const originalTransform = element.style.transform;
    // Reset zoom for correct capture resolution
    element.style.transform = 'none';

    setLoading(true);

    const opt = {
      margin:       0,
      filename:     `malzama-${new Date().getTime()}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
          scale: 2, // High quality (Retina)
          useCORS: true, // Allow cross-origin images (like from Gemini/Google)
          logging: false,
          scrollY: 0
      },
      jsPDF:        { unit: 'mm', format: settings.paperSize.toLowerCase(), orientation: 'portrait' },
      pagebreak:    { mode: 'css', after: '.malzama-page-container' } // Prevent cutting inside pages
    };

    // @ts-ignore
    window.html2pdf().set(opt).from(element).save().then(() => {
        // Cleanup
        element.style.transform = originalTransform;
        document.body.classList.remove('pdf-mode');
        setLoading(false);
    }).catch((err: any) => {
        console.error(err);
        alert("خەلەتەک ل دەمێ دروستکرنا PDF پەیدابوو.");
        element.style.transform = originalTransform;
        document.body.classList.remove('pdf-mode');
        setLoading(false);
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f2f5]">
      
      {/* Sidebar Toggle Button (Visible when sidebar is closed) */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setSidebarOpen(true)}
          className="fixed top-6 left-6 z-40 bg-white p-3 rounded-full shadow-lg border border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition no-print"
          title="ڤەکرنا مێنویێ"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      )}

      {/* Sidebar Backdrop for Mobile/Overlay */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm no-print"
            onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        settings={settings} 
        updateSettings={(s) => setSettings(prev => ({ ...prev, ...s }))}
        onGenerateImage={createAIImage}
        onUploadImage={handleImageUpload}
        onAskAI={() => setShowChat(true)}
        onDownloadPDF={downloadPDF}
        onUploadFont={handleFontUpload}
        onVoiceInput={handleVoiceInput}
        isListening={isListening}
        micLang={micLang}
        setMicLang={setMicLang}
        onAddIcon={handleAddIcon}
        onAddText={handleAddManualText}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-12 relative no-scrollbar bg-slate-100 transition-all duration-300">
        
        {/* Floating Zoom & Page Controls */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-gray-200 no-print">
            <button 
                onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.1))}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 font-bold"
            >-</button>
            <span className="text-sm font-bold min-w-[3rem] text-center">{Math.round(zoomLevel * 100)}%</span>
            <button 
                onClick={() => setZoomLevel(z => Math.min(2, z + 0.1))}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 font-bold"
            >+</button>
            
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            
            <span className="text-xs font-bold text-gray-500">لاپەرە: {activePageIndex + 1} / {pages.length || 1}</span>
        </div>

        {/* Floating PDF Download Button */}
        <button
            onClick={downloadPDF}
            className="fixed bottom-8 right-8 z-30 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 hover:scale-105 transition active:scale-95 no-print border-4 border-white"
            title="داونلۆدکرنا PDF"
        >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        </button>

        {sections.length === 0 && !loading && (
          <div className="max-w-3xl mx-auto mt-20 p-8 md:p-12 bg-white rounded-[40px] shadow-2xl border border-white no-print text-center">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">چێکرنا مەلزەمێ ب شێوازەکێ مودرێن</h2>
            <p className="text-gray-500 mb-10 text-lg">نڤیسینا خۆ ل ڤێرە دانێ دا مامۆستایێ زیرەک بۆتە رێک بێخیت و دیزاینەکا جوان بدەتێ.</p>
            <textarea 
              className="w-full h-64 md:h-80 p-6 md:p-8 rounded-3xl border-2 border-gray-100 focus:border-blue-500 focus:outline-none transition resize-none bg-gray-50 text-lg md:text-xl leading-relaxed"
              placeholder="نڤیسینا خۆ ل ڤێرە بنڤیسە..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="flex justify-center mt-10">
                <button 
                  onClick={() => handleTextSubmit(prompt)}
                  className="px-12 md:px-16 py-4 md:py-5 bg-blue-600 text-white rounded-2xl font-black text-lg md:text-xl shadow-2xl shadow-blue-200 hover:bg-blue-700 transition active:scale-95"
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

        {/* Printable Area with Zoom Transform */}
        <div 
            className="flex flex-col items-center pb-32 transition-transform duration-200 origin-top" 
            id="malzama-print-area"
            style={{ transform: `scale(${zoomLevel})` }}
        >
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
             <div className="text-center no-print pb-20">
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
