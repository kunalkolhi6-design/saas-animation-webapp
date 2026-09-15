import React from 'react';
import { Tool } from '../types';
import { MousePointer2, Hand, Square, Circle, Minus, Type, Pencil, ZoomIn, ZoomOut } from 'lucide-react';

interface ToolbarProps {
  tool: Tool;
  setTool: (tool: Tool) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  selectedId: string | null;
  onDelete: () => void;
  onDuplicate: () => void;
}

const tools: { id: Tool; icon: React.ReactNode; label: string; shortcut: string }[] = [
  { id: 'select', icon: <MousePointer2 size={16} />, label: 'Select', shortcut: 'V' },
  { id: 'hand', icon: <Hand size={16} />, label: 'Hand', shortcut: 'H' },
  { id: 'rectangle', icon: <Square size={16} />, label: 'Rectangle', shortcut: 'R' },
  { id: 'circle', icon: <Circle size={16} />, label: 'Circle', shortcut: 'O' },
  { id: 'line', icon: <Minus size={16} />, label: 'Line', shortcut: 'L' },
  { id: 'text', icon: <Type size={16} />, label: 'Text', shortcut: 'T' },
  { id: 'freehand', icon: <Pencil size={16} />, label: 'Draw', shortcut: 'P' },
];

export default function Toolbar({ tool, setTool, zoom, setZoom, selectedId, onDelete, onDuplicate }: ToolbarProps) {
  return (
    <div className="h-12 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 flex items-center justify-between px-4 flex-shrink-0">
      {/* Left - Tools */}
      <div className="flex items-center gap-0.5 bg-gray-100/80 rounded-xl p-0.5">
        {tools.map(t => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`relative p-2 rounded-lg transition-all duration-200 ${
              tool === t.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title={`${t.label} (${t.shortcut})`}
          >
            {t.icon}
          </button>
        ))}
      </div>

      {/* Center - Selection actions */}
      <div className="flex items-center gap-2">
        {selectedId && (
          <div className="flex items-center gap-1 bg-gray-100/80 rounded-xl p-0.5 animate-in fade-in">
            <button onClick={onDuplicate} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-white hover:shadow-sm transition-all">
              Duplicate
            </button>
            <div className="w-px h-5 bg-gray-200" />
            <button onClick={onDelete} className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-all">
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Right - Zoom */}
      <div className="flex items-center gap-1 bg-gray-100/80 rounded-xl p-0.5">
        <button onClick={() => setZoom(Math.max(25, zoom - 25))} className="p-2 rounded-lg text-gray-500 hover:text-gray-700 transition-colors">
          <ZoomOut size={16} />
        </button>
        <span className="text-xs font-medium text-gray-600 w-10 text-center tabular-nums">{zoom}%</span>
        <button onClick={() => setZoom(Math.min(200, zoom + 25))} className="p-2 rounded-lg text-gray-500 hover:text-gray-700 transition-colors">
          <ZoomIn size={16} />
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button onClick={() => setZoom(100)} className="px-2 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-sm transition-all">
          Reset
        </button>
      </div>
    </div>
  );
}
