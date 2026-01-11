
import React, { useRef } from 'react';
import { EditorSettings, PaperSize, MalzamaSection, FloatingImage, FloatingText } from '../types';

interface PageProps {
  index: number;
  sections: MalzamaSection[];
  settings: EditorSettings;
  floatingImages: FloatingImage[];
  floatingTexts: FloatingText[];
  onItemUpdate: (type: 'image' | 'text', id: string, updates: any) => void;
  onSectionUpdate: (id: string, content: string) => void;
}

const Page: React.FC<PageProps> = ({ 
  index, 
  sections, 
  settings, 
  floatingImages,
  floatingTexts,
  onItemUpdate,
  onSectionUpdate
}) => {
  // Use 'mm' for print precision.
  const getPageStyle = () => {
    switch(settings.paperSize) {
      case PaperSize.A5: return 'w-[148mm] h-[210mm]';
      case PaperSize.Letter: return 'w-[216mm] h-[279mm]';
      default: return 'w-[210mm] h-[297mm]'; // A4 Default
    }
  };

  const fontStyle = {
    fontFamily: settings.customFontUrl ? 'CustomMalzamaFont, Vazirmatn' : 'Vazirmatn',
    color: settings.fontColor,
    direction: 'rtl' as const
  };

  // Helper to handle dragging and resizing for both images and text
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, type: 'image'|'text', id: string, currentX: number, currentY: number) => {
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const startX = clientX - currentX;
    const startY = clientY - currentY;

    const move = (moveEvent: MouseEvent | TouchEvent) => {
      const moveClientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : (moveEvent as MouseEvent).clientX;
      const moveClientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : (moveEvent as MouseEvent).clientY;
      onItemUpdate(type, id, { x: moveClientX - startX, y: moveClientY - startY });
    };

    const stop = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', stop);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', stop);
  };

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent, type: 'image'|'text', id: string, currentW: number, currentH: number) => {
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const move = (moveEvent: MouseEvent | TouchEvent) => {
        const moveClientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : (moveEvent as MouseEvent).clientX;
        const moveClientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : (moveEvent as MouseEvent).clientY;
        const newW = Math.max(50, currentW + (moveClientX - clientX));
        const newH = Math.max(20, currentH + (moveClientY - clientY));
        onItemUpdate(type, id, { width: newW, height: newH });
    };

    const stop = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', stop);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', stop);
  };

  const handleRotateStart = (e: React.MouseEvent | React.TouchEvent, type: 'image'|'text', id: string, currentRotation: number) => {
      e.stopPropagation();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      
      const move = (moveEvent: MouseEvent | TouchEvent) => {
          const moveClientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : (moveEvent as MouseEvent).clientX;
          // Simple rotation sensitivity based on horizontal drag
          const delta = moveClientX - clientX;
          onItemUpdate(type, id, { rotation: currentRotation + delta });
      };
      
      const stop = () => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', stop);
        window.removeEventListener('touchmove', move);
        window.removeEventListener('touchend', stop);
      };

      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', stop);
      window.addEventListener('touchmove', move);
      window.addEventListener('touchend', stop);
  };

  return (
    <div 
      className={`relative bg-white page-shadow mx-auto mb-12 overflow-hidden flex flex-col page-break ${getPageStyle()}`}
      style={fontStyle}
    >
      {/* Decorative Borders (SVGs) */}
      <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none opacity-20 z-0">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z" fill={settings.primaryColor} />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none opacity-20 rotate-180 z-0">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z" fill={settings.primaryColor} />
        </svg>
      </div>

      {/* Main Border Frame */}
      <div 
        className="absolute inset-6 border-2 pointer-events-none opacity-10 rounded-lg z-0"
        style={{ borderColor: settings.primaryColor }}
      />

      {/* Teacher Name Box */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-4 z-10">
         <div 
            className="px-8 py-3 border-2 rounded-xl shadow-sm bg-white flex flex-col items-center"
            style={{ borderColor: settings.primaryColor }}
          >
            <span className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">مامۆستا</span>
            <div className="font-black text-lg min-w-[150px] text-center leading-none">{settings.teacherName || "ناڤێ مامۆستای"}</div>
          </div>
      </div>

      <div className="mt-32 px-16 flex-1 relative z-10">
        {sections.map((section) => (
          <div key={section.id} className="mb-10 group relative">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-2 h-10 rounded-full" style={{ backgroundColor: settings.primaryColor }} />
               <h2 
                className="font-black leading-tight outline-none" 
                style={{ fontSize: `${settings.fontSize * 1.6}px` }}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                    // Title update logic could be added here if needed in data
                }}
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
              className="text-gray-800 outline-none focus:bg-yellow-50/50 rounded p-1 transition"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onSectionUpdate(section.id, e.currentTarget.innerText)}
            >
              {section.content}
            </div>
          </div>
        ))}

        {/* Floating Images */}
        {floatingImages.filter(img => img.pageIndex === index).map(img => (
          <div
            key={img.id}
            className="absolute cursor-move border-2 border-transparent hover:border-blue-500 z-50 group no-print-border"
            style={{
              left: img.x,
              top: img.y,
              width: img.width,
              height: img.height,
              transform: `rotate(${img.rotation || 0}deg)`
            }}
            onMouseDown={(e) => handleDragStart(e, 'image', img.id, img.x, img.y)}
            onTouchStart={(e) => handleDragStart(e, 'image', img.id, img.x, img.y)}
          >
            <img src={img.src} className="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-white bg-white select-none pointer-events-none" alt="Illustration" />
            
            {/* Resizer */}
            <div 
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white cursor-nwse-resize shadow-lg opacity-0 group-hover:opacity-100 transition-opacity no-print z-50"
              onMouseDown={(e) => handleResizeStart(e, 'image', img.id, img.width, img.height)}
              onTouchStart={(e) => handleResizeStart(e, 'image', img.id, img.width, img.height)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            </div>
            
            {/* Rotator */}
            <div 
               className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white cursor-ew-resize shadow-lg opacity-0 group-hover:opacity-100 transition-opacity no-print z-50"
               onMouseDown={(e) => handleRotateStart(e, 'image', img.id, img.rotation || 0)}
               onTouchStart={(e) => handleRotateStart(e, 'image', img.id, img.rotation || 0)}
            >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </div>
          </div>
        ))}

        {/* Floating Texts (Voice Input) */}
        {floatingTexts.filter(txt => txt.pageIndex === index).map(txt => (
           <div
            key={txt.id}
            className="absolute cursor-move border-2 border-dashed border-gray-300 hover:border-blue-500 z-50 group no-print-border bg-white/50 backdrop-blur-sm p-2 rounded-lg"
            style={{
              left: txt.x,
              top: txt.y,
              width: txt.width,
              minHeight: txt.height,
              transform: `rotate(${txt.rotation || 0}deg)`
            }}
            onMouseDown={(e) => handleDragStart(e, 'text', txt.id, txt.x, txt.y)}
            onTouchStart={(e) => handleDragStart(e, 'text', txt.id, txt.x, txt.y)}
           >
             <div 
                className="w-full h-full outline-none font-bold text-gray-800"
                style={{ fontSize: txt.fontSize }}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onItemUpdate('text', txt.id, { content: e.currentTarget.innerText })}
             >
                {txt.content}
             </div>

             {/* Resizer */}
            <div 
              className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white cursor-nwse-resize shadow-lg opacity-0 group-hover:opacity-100 transition-opacity no-print z-50"
              onMouseDown={(e) => handleResizeStart(e, 'text', txt.id, txt.width, txt.height)}
              onTouchStart={(e) => handleResizeStart(e, 'text', txt.id, txt.width, txt.height)}
            />

            {/* Rotator */}
            <div 
               className="absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white cursor-ew-resize shadow-lg opacity-0 group-hover:opacity-100 transition-opacity no-print z-50"
               onMouseDown={(e) => handleRotateStart(e, 'text', txt.id, txt.rotation || 0)}
               onTouchStart={(e) => handleRotateStart(e, 'text', txt.id, txt.rotation || 0)}
            >
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
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
