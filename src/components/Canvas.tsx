import React, { useRef, useState } from 'react';
import { CanvasElement, Tool } from '../types';

interface CanvasProps {
  elements: CanvasElement[];
  selectedId: string | null;
  tool: Tool;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  backgroundColor: string;
  zoom: number;
  onSelect: (id: string | null) => void;
  onAddElement: (el: Partial<CanvasElement> & { type: CanvasElement['type'] }) => string;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
}

export default function Canvas({
  elements,
  selectedId,
  tool,
  fillColor,
  strokeColor,
  strokeWidth,
  backgroundColor,
  zoom,
  onSelect,
  onAddElement,
  onUpdateElement,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState('');
  const [freehandPoints, setFreehandPoints] = useState<{ x: number; y: number }[]>([]);

  const getMousePos = (e: React.MouseEvent): { x: number; y: number } => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / (zoom / 100),
      y: (e.clientY - rect.top) / (zoom / 100),
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);

    if (tool === 'select' || tool === 'hand') {
      onSelect(null);
      return;
    }

    if (tool === 'freehand') {
      setIsDrawing(true);
      setFreehandPoints([pos]);
      return;
    }

    setIsDrawing(true);
    setStartPos(pos);
    setCurrentPos(pos);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getMousePos(e);

    if (tool === 'freehand' && isDrawing) {
      setFreehandPoints(prev => [...prev, pos]);
      return;
    }

    if (isDrawing && tool !== 'select' && tool !== 'hand' && tool !== 'freehand') {
      setCurrentPos(pos);
      return;
    }

    if (isDragging && selectedId) {
      const el = elements.find(e => e.id === selectedId);
      if (el && !el.locked) {
        onUpdateElement(selectedId, {
          x: Math.round((pos.x - dragOffset.x) / 4) * 4,
          y: Math.round((pos.y - dragOffset.y) / 4) * 4,
        });
      }
      return;
    }

    if (isResizing && selectedId) {
      const el = elements.find(e => e.id === selectedId);
      if (el && !el.locked) {
        const dx = pos.x - startPos.x;
        const dy = pos.y - startPos.y;
        let newX = el.x, newY = el.y, newW = el.width, newH = el.height;

        if (resizeHandle.includes('r')) { newW = Math.max(20, Math.round((el.width + dx) / 4) * 4); }
        if (resizeHandle.includes('b')) { newH = Math.max(20, Math.round((el.height + dy) / 4) * 4); }
        if (resizeHandle.includes('l')) { newX = Math.round((el.x + dx) / 4) * 4; newW = Math.max(20, Math.round((el.width - dx) / 4) * 4); }
        if (resizeHandle.includes('t')) { newY = Math.round((el.y + dy) / 4) * 4; newH = Math.max(20, Math.round((el.height - dy) / 4) * 4); }

        onUpdateElement(selectedId, { x: newX, y: newY, width: newW, height: newH });
        setStartPos(pos);
      }
    }
  };

  const handleMouseUp = () => {
    if (tool === 'freehand' && isDrawing) {
      if (freehandPoints.length > 2) {
        onAddElement({
          type: 'freehand',
          points: freehandPoints,
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          fill: 'transparent',
          name: 'Drawing',
        });
      }
      setFreehandPoints([]);
      setIsDrawing(false);
      return;
    }

    if (isDrawing && tool !== 'select' && tool !== 'hand') {
      const x = Math.min(startPos.x, currentPos.x);
      const y = Math.min(startPos.y, currentPos.y);
      const w = Math.abs(currentPos.x - startPos.x);
      const h = Math.abs(currentPos.y - startPos.y);

      if (w > 5 || h > 5) {
        onAddElement({
          type: tool as CanvasElement['type'],
          x: Math.round(x / 4) * 4,
          y: Math.round(y / 4) * 4,
          width: Math.max(Math.round(w / 4) * 4, 20),
          height: Math.max(Math.round(h / 4) * 4, 20),
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth,
          name: tool.charAt(0).toUpperCase() + tool.slice(1),
          borderRadius: tool === 'circle' ? 999 : 8,
        });
      }
    }

    setIsDrawing(false);
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleElementMouseDown = (e: React.MouseEvent, el: CanvasElement) => {
    e.stopPropagation();
    if (tool === 'select') {
      onSelect(el.id);
      if (!el.locked) {
        const pos = getMousePos(e);
        setDragOffset({ x: pos.x - el.x, y: pos.y - el.y });
        setIsDragging(true);
      }
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    const pos = getMousePos(e);
    setStartPos(pos);
    setIsResizing(true);
    setResizeHandle(handle);
  };

  const renderPreview = () => {
    if (!isDrawing || tool === 'select' || tool === 'hand' || tool === 'freehand') return null;
    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const w = Math.abs(currentPos.x - startPos.x);
    const h = Math.abs(currentPos.y - startPos.y);

    const style: React.CSSProperties = {
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      border: `1.5px dashed #0071e3`,
      backgroundColor: '#0071e310',
      pointerEvents: 'none',
      borderRadius: tool === 'circle' ? '50%' : '8px',
    };

    if (tool === 'line') {
      return (
        <svg style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <line x1={startPos.x} y1={startPos.y} x2={currentPos.x} y2={currentPos.y} stroke="#0071e3" strokeWidth={1.5} strokeDasharray="6,4" />
        </svg>
      );
    }

    if (tool === 'text') {
      return (
        <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#1d1d1f' }}>
          Text
        </div>
      );
    }

    return <div style={style} />;
  };

  const renderFreehandPreview = () => {
    if (freehandPoints.length < 2) return null;
    const d = freehandPoints.reduce((acc, p, i) => acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), '');
    return (
      <svg style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <path d={d} fill="none" stroke="#0071e3" strokeWidth={2} strokeLinecap="round" />
      </svg>
    );
  };

  const renderWireframeElement = (el: CanvasElement) => {
    const t = el.wireframeType;
    if (!t) return null;

    // Buttons
    if (t === 'button-primary') {
      return (
        <div className="w-full h-full flex items-center justify-center text-white" style={{ backgroundColor: el.fill, borderRadius: el.borderRadius || 980, fontSize: el.fontSize || 14, fontWeight: el.fontWeight || '500', letterSpacing: '-0.01em' }}>
          {el.text || 'Get Started'}
        </div>
      );
    }
    if (t === 'button-secondary') {
      return (
        <div className="w-full h-full flex items-center justify-center" style={{ border: `1.5px solid ${el.stroke || '#0071e3'}`, color: '#0071e3', borderRadius: el.borderRadius || 980, fontSize: el.fontSize || 14, fontWeight: el.fontWeight || '500', letterSpacing: '-0.01em' }}>
          {el.text || 'Learn More'}
        </div>
      );
    }
    if (t === 'button-ghost') {
      return (
        <div className="w-full h-full flex items-center justify-center" style={{ color: '#0071e3', fontSize: el.fontSize || 14, fontWeight: el.fontWeight || '400' }}>
          {el.text || 'Link Text'} →
        </div>
      );
    }

    // Inputs
    if (t === 'input-text' || t === 'input-search') {
      return (
        <div className="w-full h-full flex items-center px-4" style={{ backgroundColor: el.fill, border: `1px solid ${el.stroke}`, borderRadius: el.borderRadius || 12, fontSize: el.fontSize || 14, color: '#86868b' }}>
          {t === 'input-search' && <svg className="mr-2 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#86868b" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>}
          {el.text || 'Enter text...'}
        </div>
      );
    }
    if (t === 'textarea') {
      return (
        <div className="w-full h-full p-4 text-sm" style={{ backgroundColor: el.fill, border: `1px solid ${el.stroke}`, borderRadius: el.borderRadius || 12, color: '#86868b' }}>
          {el.text || 'Type your message...'}
        </div>
      );
    }

    // Navbar
    if (t === 'navbar') {
      return (
        <div className="w-full h-full flex items-center px-6" style={{ backgroundColor: 'rgba(251,251,253,0.8)', backdropFilter: 'blur(20px)', borderBottom: '0.5px solid #d2d2d7' }}>
          <div className="flex items-center gap-6 flex-1">
            <div className="w-6 h-6 rounded-full bg-gray-800" />
            {['Products', 'Solutions', 'Pricing', 'Docs'].map(item => (
              <div key={item} className="text-xs text-gray-600 font-medium">{item}</div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-20 h-7 rounded-full bg-[#0071e3]" />
            <div className="w-7 h-7 rounded-full bg-gray-200" />
          </div>
        </div>
      );
    }

    // Sidebar
    if (t === 'sidebar') {
      return (
        <div className="w-full h-full flex flex-col p-4 gap-1" style={{ backgroundColor: el.fill, borderRight: '0.5px solid #e8e8ed' }}>
          <div className="w-full h-8 rounded-lg bg-gray-100 mb-3" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`w-full h-8 rounded-lg ${i === 1 ? 'bg-blue-50' : ''} flex items-center px-3 gap-2`}>
              <div className={`w-4 h-4 rounded ${i === 1 ? 'bg-blue-400' : 'bg-gray-200'}`} />
              <div className={`h-2 rounded ${i === 1 ? 'bg-blue-300 w-16' : 'bg-gray-200 w-20'}`} />
            </div>
          ))}
        </div>
      );
    }

    // Footer
    if (t === 'footer') {
      return (
        <div className="w-full h-full flex flex-col justify-between p-8" style={{ backgroundColor: el.fill }}>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="w-16 h-2 bg-gray-300 rounded" />
                {[...Array(3)].map((_, j) => <div key={j} className="w-20 h-1.5 bg-gray-200 rounded" />)}
              </div>
            ))}
          </div>
          <div className="w-full h-px bg-gray-200 mt-4" />
          <div className="w-32 h-2 bg-gray-200 rounded mt-2" />
        </div>
      );
    }

    // Card
    if (t === 'card') {
      return (
        <div className="w-full h-full flex flex-col overflow-hidden" style={{ backgroundColor: el.fill, border: `0.5px solid ${el.stroke}`, borderRadius: el.borderRadius || 18 }}>
          <div className="h-2/5 bg-gradient-to-br from-gray-50 to-gray-100" />
          <div className="p-5 flex-1 flex flex-col gap-2.5">
            <div className="w-3/5 h-3 bg-gray-200 rounded-full" />
            <div className="w-full h-2 bg-gray-100 rounded-full" />
            <div className="w-4/5 h-2 bg-gray-100 rounded-full" />
            <div className="mt-auto w-24 h-7 rounded-full bg-[#0071e3] opacity-80" />
          </div>
        </div>
      );
    }

    // Card horizontal
    if (t === 'card-horizontal') {
      return (
        <div className="w-full h-full flex" style={{ backgroundColor: el.fill, border: `0.5px solid ${el.stroke}`, borderRadius: el.borderRadius || 18 }}>
          <div className="w-2/5 bg-gradient-to-br from-gray-50 to-gray-100" />
          <div className="flex-1 p-5 flex flex-col gap-2 justify-center">
            <div className="w-3/5 h-3 bg-gray-200 rounded-full" />
            <div className="w-full h-2 bg-gray-100 rounded-full" />
            <div className="w-4/5 h-2 bg-gray-100 rounded-full" />
          </div>
        </div>
      );
    }

    // Pricing card
    if (t === 'pricing-card') {
      return (
        <div className="w-full h-full flex flex-col p-6" style={{ backgroundColor: el.fill, border: `0.5px solid ${el.stroke}`, borderRadius: el.borderRadius || 22 }}>
          <div className="w-16 h-4 bg-gray-200 rounded-full mb-4" />
          <div className="flex items-baseline gap-1 mb-1">
            <div className="w-12 h-8 bg-gray-800 rounded" />
            <div className="w-8 h-3 bg-gray-300 rounded" />
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full mb-6" />
          <div className="flex-1 flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div className="h-2 bg-gray-100 rounded-full flex-1" />
              </div>
            ))}
          </div>
          <div className="w-full h-10 rounded-full bg-[#0071e3] mt-4" />
        </div>
      );
    }

    // Hero
    if (t === 'hero') {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-center" style={{ backgroundColor: el.fill, borderRadius: el.borderRadius || 22 }}>
          <div className="px-3 py-1 rounded-full bg-blue-50 text-[10px] text-blue-600 font-medium">New Feature</div>
          <div className="w-3/4 h-8 bg-gray-800 rounded-lg opacity-10" />
          <div className="w-1/2 h-4 bg-gray-300 rounded-full" />
          <div className="flex gap-3 mt-2">
            <div className="w-28 h-9 rounded-full bg-[#0071e3]" />
            <div className="w-28 h-9 rounded-full border border-gray-300" />
          </div>
        </div>
      );
    }

    // Hero split
    if (t === 'hero-split') {
      return (
        <div className="w-full h-full flex" style={{ backgroundColor: el.fill, borderRadius: el.borderRadius || 22 }}>
          <div className="flex-1 flex flex-col justify-center p-8 gap-3">
            <div className="w-24 h-3 bg-gray-200 rounded-full" />
            <div className="w-full h-6 bg-gray-300 rounded-lg opacity-30" />
            <div className="w-3/4 h-3 bg-gray-200 rounded-full" />
            <div className="flex gap-2 mt-2">
              <div className="w-24 h-8 rounded-full bg-[#0071e3]" />
              <div className="w-24 h-8 rounded-full border border-gray-300" />
            </div>
          </div>
          <div className="w-1/2 bg-gradient-to-br from-gray-100 to-gray-50 m-4 rounded-2xl" />
        </div>
      );
    }

    // Feature grid
    if (t === 'feature-grid') {
      return (
        <div className="w-full h-full grid grid-cols-3 gap-4 p-6" style={{ backgroundColor: el.fill, borderRadius: el.borderRadius || 18 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <div className="w-5 h-5 rounded bg-blue-400" />
              </div>
              <div className="w-16 h-2.5 bg-gray-200 rounded-full" />
              <div className="w-full h-2 bg-gray-100 rounded-full" />
              <div className="w-3/4 h-2 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>
      );
    }

    // Avatar
    if (t === 'avatar') {
      return (
        <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: el.fill }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#86868b">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      );
    }

    // Avatar group
    if (t === 'avatar-group') {
      return (
        <div className="w-full h-full flex items-center">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center" style={{ backgroundColor: ['#e8e8ed', '#d1d5db', '#9ca3af', '#6b7280'][i], marginLeft: i > 0 ? -8 : 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
              </svg>
            </div>
          ))}
        </div>
      );
    }

    // Text elements
    if (t === 'heading' || t === 'subheading' || t === 'body-text' || t === 'caption') {
      const colors: Record<string, string> = { heading: '#1d1d1f', subheading: '#1d1d1f', 'body-text': '#6e6e73', caption: '#86868b' };
      return (
        <div className="w-full h-full flex items-start" style={{ fontSize: el.fontSize || 16, fontWeight: el.fontWeight || '400', color: colors[t] || '#1d1d1f', letterSpacing: '-0.02em', lineHeight: '1.4' }}>
          {el.text || 'Text'}
        </div>
      );
    }

    // Image
    if (t === 'image') {
      return (
        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: el.fill, border: `0.5px solid ${el.stroke}`, borderRadius: el.borderRadius || 12 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d2d2d7" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
      );
    }

    // Video
    if (t === 'video') {
      return (
        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: el.fill, borderRadius: el.borderRadius || 12 }}>
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          </div>
        </div>
      );
    }

    // Icon circle
    if (t === 'icon-circle') {
      return (
        <div className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: el.fill }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      );
    }

    // Chart bar
    if (t === 'chart-bar') {
      return (
        <div className="w-full h-full rounded-xl p-4 flex flex-col" style={{ backgroundColor: el.fill, border: `0.5px solid ${el.stroke}` }}>
          <div className="w-20 h-2.5 bg-gray-200 rounded-full mb-3" />
          <div className="flex-1 flex items-end gap-2 pb-2">
            {[35, 55, 40, 70, 50, 85, 60, 75, 45, 90].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, backgroundColor: i === 9 ? '#0071e3' : '#e8e8ed' }} />
            ))}
          </div>
        </div>
      );
    }

    // Chart line
    if (t === 'chart-line') {
      return (
        <div className="w-full h-full rounded-xl p-4 flex flex-col" style={{ backgroundColor: el.fill, border: `0.5px solid ${el.stroke}` }}>
          <div className="w-20 h-2.5 bg-gray-200 rounded-full mb-3" />
          <div className="flex-1 relative">
            <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
              <path d="M0 80 Q30 60 50 50 T100 30 T150 45 T200 20" fill="none" stroke="#0071e3" strokeWidth="2" />
              <path d="M0 80 Q30 60 50 50 T100 30 T150 45 T200 20 V100 H0Z" fill="#0071e310" />
            </svg>
          </div>
        </div>
      );
    }

    // Stat card
    if (t === 'stat-card') {
      return (
        <div className="w-full h-full rounded-xl p-4 flex flex-col justify-between" style={{ backgroundColor: el.fill, border: `0.5px solid ${el.stroke}` }}>
          <div className="w-12 h-2 bg-gray-200 rounded-full" />
          <div>
            <div className="w-16 h-5 bg-gray-800 rounded mb-1" />
            <div className="w-10 h-2 bg-green-200 rounded-full" />
          </div>
        </div>
      );
    }

    // Toggle
    if (t === 'toggle') {
      return (
        <div className="w-full h-full rounded-full relative" style={{ backgroundColor: el.fill }}>
          <div className="absolute right-0.5 top-0.5 bottom-0.5 aspect-square rounded-full bg-white shadow-sm" />
        </div>
      );
    }

    // Checkbox
    if (t === 'checkbox') {
      return (
        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: el.fill, borderRadius: el.borderRadius || 6 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
      );
    }

    // Radio
    if (t === 'radio') {
      return (
        <div className="w-full h-full rounded-full flex items-center justify-center" style={{ border: `2px solid ${el.stroke}` }}>
          <div className="w-2.5 h-2.5 rounded-full bg-[#0071e3]" />
        </div>
      );
    }

    // Badge
    if (t === 'badge') {
      return (
        <div className="w-full h-full flex items-center justify-center font-medium" style={{ backgroundColor: el.fill, color: '#16a34a', borderRadius: el.borderRadius || 980, fontSize: el.fontSize || 11 }}>
          {el.text || 'New'}
        </div>
      );
    }

    // Tag
    if (t === 'tag') {
      return (
        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: el.fill, border: `0.5px solid ${el.stroke}`, borderRadius: el.borderRadius || 8, fontSize: el.fontSize || 12, color: '#6e6e73' }}>
          {el.text || 'Tag'}
        </div>
      );
    }

    // Pill
    if (t === 'pill') {
      return (
        <div className="w-full h-full flex items-center justify-center font-medium" style={{ backgroundColor: el.fill, borderRadius: el.borderRadius || 980, fontSize: el.fontSize || 13, color: '#1d1d1f' }}>
          {el.text || 'Category'}
        </div>
      );
    }

    // Dropdown
    if (t === 'dropdown') {
      return (
        <div className="w-full h-full flex items-center justify-between px-4" style={{ backgroundColor: el.fill, border: `1px solid ${el.stroke}`, borderRadius: el.borderRadius || 10, fontSize: el.fontSize || 14, color: '#86868b' }}>
          <span>{el.text || 'Select option'}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#86868b" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
        </div>
      );
    }

    // Modal
    if (t === 'modal') {
      return (
        <div className="w-full h-full flex flex-col p-6" style={{ backgroundColor: el.fill, border: `0.5px solid ${el.stroke}`, borderRadius: el.borderRadius || 16, boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-24 h-3.5 bg-gray-200 rounded-full" />
            <div className="w-6 h-6 rounded-full bg-gray-100" />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="w-full h-2 bg-gray-100 rounded-full" />
            <div className="w-4/5 h-2 bg-gray-100 rounded-full" />
            <div className="w-3/5 h-2 bg-gray-100 rounded-full" />
          </div>
          <div className="flex gap-2 mt-4 justify-end">
            <div className="w-16 h-8 rounded-full bg-gray-100" />
            <div className="w-20 h-8 rounded-full bg-[#0071e3]" />
          </div>
        </div>
      );
    }

    // Toast
    if (t === 'toast') {
      return (
        <div className="w-full h-full flex items-center px-4 gap-3" style={{ backgroundColor: el.fill, borderRadius: el.borderRadius || 14, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
          <div className="w-6 h-6 rounded-full bg-green-500 flex-shrink-0 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <span className="text-white text-sm">{el.text || 'Notification message'}</span>
        </div>
      );
    }

    // Table
    if (t === 'table') {
      return (
        <div className="w-full h-full flex flex-col overflow-hidden" style={{ backgroundColor: el.fill, border: `0.5px solid ${el.stroke}`, borderRadius: el.borderRadius || 12 }}>
          <div className="h-10 flex items-center px-4 gap-4 border-b border-gray-100 bg-gray-50/50">
            {['Name', 'Status', 'Date', 'Amount'].map(h => (
              <div key={h} className="flex-1 h-2 bg-gray-200 rounded-full text-[10px]" />
            ))}
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 flex items-center px-4 gap-4 border-b border-gray-50">
              <div className="flex-1 h-2 bg-gray-100 rounded-full" />
              <div className="flex-1"><div className="w-12 h-4 rounded-full bg-green-50 inline-block" /></div>
              <div className="flex-1 h-2 bg-gray-100 rounded-full" />
              <div className="flex-1 h-2 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>
      );
    }

    // List item
    if (t === 'list-item') {
      return (
        <div className="w-full h-full flex items-center px-4 gap-3" style={{ backgroundColor: el.fill, border: `0.5px solid ${el.stroke}`, borderRadius: el.borderRadius || 10 }}>
          <div className="w-9 h-9 rounded-full bg-gray-100 flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-1">
            <div className="w-24 h-2.5 bg-gray-200 rounded-full" />
            <div className="w-40 h-2 bg-gray-100 rounded-full" />
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d2d2d7" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        </div>
      );
    }

    // Breadcrumb
    if (t === 'breadcrumb') {
      return (
        <div className="w-full h-full flex items-center" style={{ fontSize: el.fontSize || 13, color: '#86868b' }}>
          {el.text || 'Home / Products / Details'}
        </div>
      );
    }

    // Tabs
    if (t === 'tabs') {
      return (
        <div className="w-full h-full flex items-center gap-1 px-1" style={{ backgroundColor: el.fill, borderRadius: el.borderRadius || 10 }}>
          <div className="flex-1 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-xs font-medium text-gray-800">Tab 1</div>
          <div className="flex-1 h-7 rounded-lg flex items-center justify-center text-xs text-gray-500">Tab 2</div>
          <div className="flex-1 h-7 rounded-lg flex items-center justify-center text-xs text-gray-500">Tab 3</div>
        </div>
      );
    }

    // Progress
    if (t === 'progress') {
      return (
        <div className="w-full h-full rounded-full overflow-hidden" style={{ backgroundColor: el.fill }}>
          <div className="h-full w-2/3 rounded-full bg-[#0071e3]" />
        </div>
      );
    }

    // Skeleton
    if (t === 'skeleton') {
      return (
        <div className="w-full h-full rounded-lg animate-pulse" style={{ backgroundColor: el.fill }} />
      );
    }

    // Notification
    if (t === 'notification') {
      return (
        <div className="w-full h-full flex items-start p-4 gap-3" style={{ backgroundColor: el.fill, border: `0.5px solid ${el.stroke}`, borderRadius: el.borderRadius || 14 }}>
          <div className="w-9 h-9 rounded-full bg-blue-50 flex-shrink-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded bg-blue-400" />
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="w-32 h-2.5 bg-gray-200 rounded-full" />
            <div className="w-full h-2 bg-gray-100 rounded-full" />
            <div className="w-3/4 h-2 bg-gray-100 rounded-full" />
          </div>
        </div>
      );
    }

    // Alert
    if (t === 'alert') {
      return (
        <div className="w-full h-full flex items-center px-4 gap-3" style={{ backgroundColor: el.fill, border: `1px solid ${el.stroke}`, borderRadius: el.borderRadius || 12 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span className="text-sm text-amber-800">{el.text || 'Warning message'}</span>
        </div>
      );
    }

    // Empty state
    if (t === 'empty-state') {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6" style={{ backgroundColor: el.fill, borderRadius: el.borderRadius || 18 }}>
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d2d2d7" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18M9 21V9" /></svg>
          </div>
          <div className="w-28 h-3 bg-gray-200 rounded-full" />
          <div className="w-40 h-2 bg-gray-100 rounded-full" />
          <div className="w-24 h-8 rounded-full bg-[#0071e3] mt-2" />
        </div>
      );
    }

    return null;
  };

  const renderElement = (el: CanvasElement) => {
    if (!el.visible) return null;
    const isSelected = el.id === selectedId;

    if (el.type === 'freehand' && el.points) {
      const d = el.points.reduce((acc, p, i) => acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), '');
      return (
        <svg key={el.id} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: tool === 'select' ? 'auto' : 'none' }}
          onMouseDown={(e) => handleElementMouseDown(e, el)}>
          <path d={d} fill="none" stroke={el.stroke} strokeWidth={el.strokeWidth} strokeLinecap="round" opacity={el.opacity} />
          {isSelected && <path d={d} fill="none" stroke="#0071e3" strokeWidth={el.strokeWidth + 3} strokeLinecap="round" opacity={0.3} />}
        </svg>
      );
    }

    if (el.type === 'line') {
      return (
        <svg key={el.id} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: tool === 'select' ? 'auto' : 'none' }}
          onMouseDown={(e) => handleElementMouseDown(e, el)}>
          <line x1={el.x} y1={el.y} x2={el.x + el.width} y2={el.y + el.height} stroke={el.stroke} strokeWidth={el.strokeWidth} opacity={el.opacity} />
          {isSelected && <>
            <circle cx={el.x} cy={el.y} r="4" fill="white" stroke="#0071e3" strokeWidth="1.5" />
            <circle cx={el.x + el.width} cy={el.y + el.height} r="4" fill="white" stroke="#0071e3" strokeWidth="1.5" />
          </>}
        </svg>
      );
    }

    if (el.type === 'wireframe') {
      return (
        <div key={el.id} style={{ position: 'absolute', left: el.x, top: el.y, width: el.width, height: el.height, opacity: el.opacity, cursor: tool === 'select' ? 'move' : 'default' }}
          onMouseDown={(e) => handleElementMouseDown(e, el)}>
          {renderWireframeElement(el)}
          {isSelected && (
            <div className="absolute inset-0 pointer-events-none" style={{ outline: '1.5px solid #0071e3', outlineOffset: '1px', borderRadius: el.borderRadius || 0 }}>
              {['tl', 'tr', 'bl', 'br'].map(h => (
                <div key={h}
                  className="absolute w-2.5 h-2.5 bg-white border-[1.5px] border-[#0071e3] rounded-sm pointer-events-auto"
                  style={{
                    top: h.includes('t') ? -5 : undefined,
                    bottom: h.includes('b') ? -5 : undefined,
                    left: h.includes('l') ? -5 : undefined,
                    right: h.includes('r') ? -5 : undefined,
                    cursor: h === 'tl' || h === 'br' ? 'nwse-resize' : 'nesw-resize',
                  }}
                  onMouseDown={(e) => handleResizeMouseDown(e, h)}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    // Default shapes
    const shapeStyle: React.CSSProperties = {
      position: 'absolute',
      left: el.x,
      top: el.y,
      width: el.width,
      height: el.height,
      backgroundColor: el.fill === 'transparent' ? undefined : el.fill,
      border: el.stroke !== 'transparent' ? `${el.strokeWidth}px solid ${el.stroke}` : undefined,
      borderRadius: el.borderRadius || (el.type === 'circle' ? '50%' : 8),
      opacity: el.opacity,
      cursor: tool === 'select' ? 'move' : 'default',
      display: el.type === 'text' ? 'flex' : undefined,
      alignItems: el.type === 'text' ? 'center' : undefined,
      justifyContent: el.type === 'text' ? 'center' : undefined,
      fontSize: el.fontSize || 16,
      color: '#1d1d1f',
      fontWeight: el.fontWeight || '400',
    };

    return (
      <div key={el.id} style={shapeStyle} onMouseDown={(e) => handleElementMouseDown(e, el)}>
        {el.type === 'text' && (el.text || 'Text')}
        {isSelected && (
          <div className="absolute inset-0 pointer-events-none" style={{ outline: '1.5px solid #0071e3', outlineOffset: '1px', borderRadius: el.borderRadius || 8 }}>
            <div className="absolute -right-1.5 -bottom-1.5 w-2.5 h-2.5 bg-white border-[1.5px] border-[#0071e3] rounded-sm pointer-events-auto cursor-se-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, 'br')} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden"
      style={{ backgroundColor, cursor: tool === 'select' ? 'default' : tool === 'hand' ? 'grab' : 'crosshair', transform: `scale(${zoom / 100})`, transformOrigin: '0 0' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Dot grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.3 }}>
        <defs>
          <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.5" fill="#86868b" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotGrid)" />
      </svg>

      {elements.map(renderElement)}
      {renderPreview()}
      {renderFreehandPreview()}
    </div>
  );
}
