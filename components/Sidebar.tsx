
import React, { useState, useEffect, useRef } from 'react';
import { EditorSettings, PaperSize } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditorSettings;
  updateSettings: (s: Partial<EditorSettings>) => void;
  onGenerateImage: () => void;
  onUploadImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAskAI: () => void;
  onDownloadPDF: () => void;
  onUploadFont: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVoiceInput: () => void;
  isListening: boolean;
  micLang: string;
  setMicLang: (lang: string) => void;
  onAddIcon: (svg: string) => void;
  onAddText: () => void;
}

const ICONS = [
    // Shapes
    '<svg viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" fill="#3b82f6" opacity="0.5"/></svg>',
    '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#ef4444" opacity="0.5"/></svg>',
    '<svg viewBox="0 0 100 100"><polygon points="50,10 90,90 10,90" fill="#10b981" opacity="0.5"/></svg>',
    // Icons
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    // Decorations
    '<svg viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="black" stroke-width="2" fill="none"/></svg>',
    '<svg viewBox="0 0 24 24" fill="orange"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
];

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen,
  onClose,
  settings, 
  updateSettings, 
  onGenerateImage, 
  onUploadImage,
  onAskAI, 
  onDownloadPDF, 
  onUploadFont,
  onVoiceInput,
  isListening,
  micLang,
  setMicLang,
  onAddIcon,
  onAddText
}) => {
  const [localApiKey, setLocalApiKey] = useState('');
  const [showIcons, setShowIcons] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings.apiKey) {
      setLocalApiKey(settings.apiKey);
    }
  }, [settings.apiKey]);

  const handleConnect = () => {
    localStorage.setItem('gemini_api_key', localApiKey);
    updateSettings({ apiKey: localApiKey });
    alert("API Key هاتە تۆمارکرن!");
  };

  return (
    <>
    <div 
        className={`fixed top-0 left-0 h-screen bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out flex flex-col w-80 no-print transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-3">
            <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-inner"
                style={{ backgroundColor: settings.primaryColor }}
            >M</div>
            <div>
                <h1 className="text-lg font-black text-gray-900 leading-none">دیزاینەر</h1>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">v2.0</span>
            </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
        {/* API Key */}
        <section className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-3 rounded-full bg-yellow-500"></div>
            <h3 className="text-xs font-black text-gray-800">Google API Key</h3>
          </div>
          <div className="flex gap-2">
            <input 
              type="password" 
              placeholder="Paste Key Here"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:border-yellow-500 outline-none"
            />
            <button onClick={handleConnect} className="bg-gray-900 text-white px-2 rounded-lg font-bold text-[10px] whitespace-nowrap">Save</button>
          </div>
        </section>

        {/* Tools */}
        <section className="grid grid-cols-2 gap-3">
             <button 
                onClick={onAddText}
                className="flex flex-col items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 hover:bg-blue-100 transition"
             >
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                <span className="text-xs font-bold">تێکست بۆکس</span>
             </button>
             <button 
                onClick={() => setShowIcons(true)}
                className="flex flex-col items-center justify-center p-4 bg-purple-50 text-purple-700 rounded-2xl border border-purple-100 hover:bg-purple-100 transition"
             >
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="text-xs font-bold">ئایکۆن و شێوە</span>
             </button>
        </section>

        {/* Voice Section */}
        <section className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
           <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" /></svg>
            <h3 className="text-sm font-black text-gray-800">نڤیسینا دەنگی</h3>
           </div>
           
           <div className="mb-3">
             <label className="text-[10px] font-bold text-gray-400 block mb-1">زمانێ ئاخافتنێ هەلبژێرە</label>
             <select 
               value={micLang}
               onChange={(e) => setMicLang(e.target.value)}
               className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-white"
             >
               <option value="ckb-IQ">کوردی (سۆرانی/بادینی)</option>
               <option value="ar-IQ">عەرەبی</option>
               <option value="en-US">English</option>
               <option value="tr-TR">Türkçe</option>
             </select>
           </div>

           <button 
              onClick={onVoiceInput}
              className={`w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white border-2 border-red-100 text-red-500 hover:bg-red-50'}`}
            >
              {isListening ? "گوهداریکرن..." : "دەستپێک"}
            </button>
        </section>

        {/* AI Images */}
        <section>
             <button 
              onClick={onGenerateImage}
              className="flex items-center justify-between w-full px-4 py-3 bg-slate-900 text-white rounded-xl font-bold hover:shadow-lg transition text-xs"
            >
              <span>وێنەکێ نوو چێکە (AI)</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-between w-full px-4 py-3 mt-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition text-xs"
            >
              <span>ئەپلۆدکرنا وێنەی</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onUploadImage} />
            </button>
        </section>

        {/* Settings */}
        <section className="space-y-4 border-t pt-4">
            <h3 className="text-xs font-black text-gray-400 uppercase">ڕێکخستن</h3>
            <input 
              type="text" 
              placeholder="ناڤێ مامۆستای"
              value={settings.teacherName}
              onChange={(e) => updateSettings({ teacherName: e.target.value })}
              className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-xs bg-gray-50 focus:border-blue-500 outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
                 <select 
                    value={settings.paperSize}
                    onChange={(e) => updateSettings({ paperSize: e.target.value as PaperSize })}
                    className="w-full border-2 border-gray-100 rounded-xl px-2 py-2 text-xs font-bold bg-gray-50"
                >
                    <option value={PaperSize.A4}>A4</option>
                    <option value={PaperSize.A5}>A5</option>
                </select>
                <div className="flex gap-1 justify-end">
                     {['#2563eb', '#db2777', '#16a34a'].map(color => (
                     <button 
                        key={color}
                        onClick={() => updateSettings({ primaryColor: color })}
                        className={`w-8 h-8 rounded-full border-2 ${settings.primaryColor === color ? 'border-black' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                     />
                 ))}
                </div>
            </div>
        </section>
      </div>

      <div className="p-6 border-t bg-gray-50">
          <button 
            onClick={onDownloadPDF}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            داونلۆد PDF
          </button>
      </div>
    </div>

    {/* Icon Library Modal */}
    {showIcons && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm no-print">
            <div className="bg-white rounded-3xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-xl font-black text-gray-800">کیتێبخانەیا هێمایان</h3>
                    <button onClick={() => setShowIcons(false)} className="text-gray-400 hover:text-red-500 text-2xl">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto grid grid-cols-4 gap-4">
                    {ICONS.map((svg, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => { onAddIcon(svg); setShowIcons(false); }}
                            className="aspect-square bg-gray-50 rounded-xl border-2 border-transparent hover:border-blue-500 hover:bg-white cursor-pointer flex items-center justify-center p-4 transition [&>svg]:w-full [&>svg]:h-full"
                            dangerouslySetInnerHTML={{ __html: svg }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default Sidebar;
