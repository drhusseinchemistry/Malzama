
import React from 'react';
import { EditorSettings, PaperSize, MalzamaSection, FloatingImage } from '../types';

interface PageProps {
  index: number;
  sections: MalzamaSection[];
  settings: EditorSettings;
  floatingImages: FloatingImage[];
  onImageMove: (id: string, x: number, y: number) => void;
  onImageResize: (id: string, w: number, h: number) => void;
}

const Page: React.FC<PageProps> = ({ 
  index, 
  sections, 
  settings, 
  floatingImages,
  onImageMove,
  onImageResize
}) => {
  // Using explicit pixels for A4/A5 at 96dpi to ensure HTML2Canvas captures correctly
  // A4: 794px x 1123px
  // A5: 559px x 794px
  // Letter: 816px x 1056px
  const getPageStyle = () => {
    switch(settings.paperSize) {
      case PaperSize.A5: return 'w-[559px] h-[794px] min-w-[559px] min-h-[794px]';
      case PaperSize.Letter: return 'w-[816px] h-[1056px] min-w-[816px] min-h-[1056px]';
      default: return 'w-[794px] h-[1123px] min-w-[794px] min-h-[1123px]';
    }
  };

  const fontStyle = {
    fontFamily: settings.customFontUrl ? 'CustomMalzamaFont, Vazirmatn' : 'Vazirmatn',
    color: settings.fontColor,
    direction: 'rtl' as const
  };

  return (
    <div 
      className={`relative bg-white page-shadow mx-auto mb-12 overflow-hidden flex flex-col page-break ${getPageStyle()}`}
      style={fontStyle}
    >
      {/* Decorative Borders (SVGs) */}
      <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none opacity-20">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z" fill={settings.primaryColor} />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none opacity-20 rotate-180">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z" fill={settings.primaryColor} />
        </svg>
      </div>

      {/* Main Border Frame */}
      <div 
        className="absolute inset-6 border-2 pointer-events-none opacity-10 rounded-lg"
        style={{ borderColor: settings.primaryColor }}
      />

      {/* Teacher Name Box - Visible on all pages */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-4">
         <div 
            className="px-8 py-3 border-2 rounded-xl shadow-sm bg-white/90 backdrop-blur-sm flex flex-col items-center"
            style={{ borderColor: settings.primaryColor }}
          >
            <span className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">مامۆستا</span>
            <div className="font-black text-lg min-w-[150px] text-center leading-none">{settings.teacherName || "ناڤێ مامۆستای"}</div>
          </div>
      </div>

      <div className="mt-28 px-16 flex-1 relative z-10">
        {sections.map((section) => (
          <div key={section.id} className="mb-10 group">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-2 h-10 rounded-full" style={{ backgroundColor: settings.primaryColor }} />
               <h2 
                className="font-black leading-tight" 
                style={{ fontSize: `${settings.fontSize * 1.6}px` }}
              >
                {section.title}
              </h2>
            </div>
            <div 
              style={{ 
                fontSize: `${settings.fontSize}px`, 
                lineHeight: settings.lineHeight,
                textAlign: 'justify'
              }}
              className="text-gray-800"
            >
              {section.content}
            </div>
          </div>
        ))}

        {/* Floating Images */}
        {floatingImages.filter(img => img.pageIndex === index).map(img => (
          <div
            key={img.id}
            className="absolute cursor-move border-2 border-transparent hover:border-blue-500 hover:scale-[1.01] transition-transform z-50 group"
            style={{
              left: img.x,
              top: img.y,
              width: img.width,
              height: img.height,
            }}
            onMouseDown={(e) => {
              const startX = e.clientX - img.x;
              const startY = e.clientY - img.y;
              const move = (moveEvent: MouseEvent) => {
                onImageMove(img.id, moveEvent.clientX - startX, moveEvent.clientY - startY);
              };
              const stop = () => {
                window.removeEventListener('mousemove', move);
                window.removeEventListener('mouseup', stop);
              };
              window.addEventListener('mousemove', move);
              window.addEventListener('mouseup', stop);
            }}
          >
            <img src={img.src} className="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-white" alt="Illustration" />
            <div 
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white cursor-nwse-resize shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => {
                e.stopPropagation();
                const startW = img.width;
                const startH = img.height;
                const startX = e.clientX;
                const startY = e.clientY;
                const move = (moveEvent: MouseEvent) => {
                  onImageResize(img.id, Math.max(80, startW + (moveEvent.clientX - startX)), Math.max(80, startH + (moveEvent.clientY - startY)));
                };
                const stop = () => {
                  window.removeEventListener('mousemove', move);
                  window.removeEventListener('mouseup', stop);
                };
                window.addEventListener('mousemove', move);
                window.addEventListener('mouseup', stop);
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Design */}
      <div className="h-16 px-16 border-t mx-16 flex items-center justify-between text-xs font-bold opacity-30 mt-auto mb-4">
        <span>© مەلزەمێ مودرێن - {new Date().getFullYear()}</span>
        <span className="bg-gray-100 px-3 py-1 rounded-full">لاپەرە {index + 1}</span>
      </div>
    </div>
  );
};

export default Page;
