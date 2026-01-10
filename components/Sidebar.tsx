
import React, { useState } from 'react';
import { EditorSettings, PaperSize } from '../types';

interface SidebarProps {
  settings: EditorSettings;
  updateSettings: (s: Partial<EditorSettings>) => void;
  onGenerateImage: () => void;
  onAskAI: () => void;
  onPrint: () => void;
  onUploadFont: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  settings, 
  updateSettings, 
  onGenerateImage, 
  onAskAI, 
  onPrint, 
  onUploadFont
}) => {
  const [localApiKey, setLocalApiKey] = useState(settings.apiKey || '');

  const handleConnect = () => {
    updateSettings({ apiKey: localApiKey });
    alert("API Key هاتە تۆمارکرن!");
  };

  return (
    <div className="w-80 bg-white border-l h-screen flex flex-col no-print shadow-xl z-20">
      <div className="p-8 border-b flex items-center gap-4 bg-gray-50/50">
        <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-inner"
            style={{ backgroundColor: settings.primaryColor }}
        >M</div>
        <div>
            <h1 className="text-xl font-black text-gray-900 leading-none">دیزاینەر</h1>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Modern Malzama v2.0</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
        {/* Teachers */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1.5 h-4 rounded-full bg-blue-500"></div>
            <h3 className="text-sm font-black text-gray-800">مامۆستا</h3>
          </div>
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="ناڤێ مامۆستای"
              value={settings.teacherName}
              onChange={(e) => updateSettings({ teacherName: e.target.value })}
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 bg-gray-50 focus:border-blue-500 focus:outline-none transition"
            />
          </div>
        </section>

        {/* API Key Section */}
        <section className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-4 rounded-full bg-yellow-500"></div>
            <h3 className="text-sm font-black text-gray-800">Google Gemini API</h3>
          </div>
          <div className="flex gap-2">
            <input 
              type="password" 
              placeholder="API Key لێرە بنڤیسە"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:border-yellow-500 focus:outline-none transition"
            />
            <button 
              onClick={handleConnect}
              className="bg-gray-900 text-white px-3 py-2 rounded-xl font-bold text-xs whitespace-nowrap hover:bg-black transition"
            >
              کونێکت
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 leading-tight">پێدڤیە کلیلا زیرەکی (API Key) هەبیت بۆ کارکرنا بەرنامەی.</p>
        </section>

        {/* Appearance */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1.5 h-4 rounded-full bg-purple-500"></div>
            <h3 className="text-sm font-black text-gray-800">دیزاین و نڤیسین</h3>
          </div>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">قەبارێ وەرەقێ</label>
                    <select 
                        value={settings.paperSize}
                        onChange={(e) => updateSettings({ paperSize: e.target.value as PaperSize })}
                        className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-bold bg-gray-50"
                    >
                        <option value={PaperSize.A4}>A4</option>
                        <option value={PaperSize.A5}>A5</option>
                        <option value={PaperSize.Letter}>Letter</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">قەبارێ فۆنتی</label>
                    <input 
                        type="number" 
                        value={settings.fontSize}
                        onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                        className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-bold bg-gray-50"
                    />
                </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">رەنگێ سەرەکی</label>
              <div className="flex gap-2">
                 {['#2563eb', '#7c3aed', '#db2777', '#16a34a', '#ea580c'].map(color => (
                     <button 
                        key={color}
                        onClick={() => updateSettings({ primaryColor: color })}
                        className={`w-8 h-8 rounded-full border-2 transition ${settings.primaryColor === color ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                     />
                 ))}
                 <input 
                    type="color" 
                    value={settings.primaryColor}
                    onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                    className="w-8 h-8 rounded-full border-none p-0 overflow-hidden cursor-pointer"
                 />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">فۆنتەکێ دی بارهێنە</label>
              <label className="flex items-center justify-between w-full px-4 py-3 bg-white border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 transition group">
                <span className="text-xs font-bold text-gray-500 group-hover:text-blue-500">Upload Font (TTF/OTF)</span>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                <input type="file" accept=".ttf,.otf" className="hidden" onChange={onUploadFont} />
              </label>
            </div>
          </div>
        </section>

        {/* AI Buttons */}
        <section className="space-y-3 pt-4">
            <button 
              onClick={onGenerateImage}
              className="flex items-center justify-between w-full px-5 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:shadow-2xl transition group"
            >
              <span>وێنەکێ نوو چێکە</span>
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
              </div>
            </button>
            
            <button 
              onClick={onAskAI}
              className="flex items-center justify-between w-full px-5 py-4 border-2 border-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-50 transition"
            >
              <span>پسیارا ژ زیرەکی</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </button>
        </section>
      </div>

      <div className="p-8">
          <button 
            onClick={onPrint}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition active:scale-95"
          >
            خەزن کرن و پرنت
          </button>
      </div>
    </div>
  );
};

export default Sidebar;
