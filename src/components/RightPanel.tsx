import React, { useState } from 'react';
import { CanvasElement, Scene } from '../types';
import {
  Settings, Palette, Type, Box, ChevronDown, ChevronUp,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic,
  ArrowUp, ArrowDown, Copy, Trash2, Lock, Unlock,
  Film, Clock, ArrowRightLeft, FileText
} from 'lucide-react';

interface RightPanelProps {
  selectedElement: CanvasElement | null;
  scene: Scene;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onUpdateScene: (updates: Partial<Scene>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
}

const transitions = ['None', 'Fade', 'Slide Left', 'Slide Right', 'Slide Up', 'Slide Down', 'Zoom In', 'Zoom Out', 'Dissolve'];

export default function RightPanel({
  selectedElement,
  scene,
  onUpdateElement,
  onUpdateScene,
  onDelete,
  onDuplicate,
  onBringToFront,
  onSendToBack,
}: RightPanelProps) {
  const [showScene, setShowScene] = useState(true);
  const [showDesign, setShowDesign] = useState(true);

  return (
    <div className="w-72 bg-white/70 backdrop-blur-xl border-l border-gray-200/60 flex flex-col flex-shrink-0 overflow-y-auto">
      {/* Design Properties */}
      {selectedElement && (
        <div className="border-b border-gray-200/60">
          <button
            onClick={() => setShowDesign(!showDesign)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 transition-colors"
          >
            <span className="text-xs font-semibold text-gray-900">Design</span>
            {showDesign ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
          </button>

          {showDesign && (
            <div className="px-4 pb-4 space-y-4">
              {/* Position & Size */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">X</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.x)}
                    onChange={(e) => onUpdateElement(selectedElement.id, { x: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200/60 text-xs text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Y</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.y)}
                    onChange={(e) => onUpdateElement(selectedElement.id, { y: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200/60 text-xs text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">W</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.width)}
                    onChange={(e) => onUpdateElement(selectedElement.id, { width: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200/60 text-xs text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">H</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.height)}
                    onChange={(e) => onUpdateElement(selectedElement.id, { height: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200/60 text-xs text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              {/* Border Radius */}
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Radius</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedElement.borderRadius || 0}
                    onChange={(e) => onUpdateElement(selectedElement.id, { borderRadius: Number(e.target.value) })}
                    className="flex-1 accent-gray-900"
                  />
                  <span className="text-[10px] text-gray-500 w-8 text-right tabular-nums">{selectedElement.borderRadius || 0}</span>
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Fill</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={selectedElement.fill === 'transparent' ? '#ffffff' : selectedElement.fill}
                      onChange={(e) => onUpdateElement(selectedElement.id, { fill: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer border border-gray-200"
                    />
                    <input
                      type="text"
                      value={selectedElement.fill}
                      onChange={(e) => onUpdateElement(selectedElement.id, { fill: e.target.value })}
                      className="flex-1 px-2 py-1 rounded-lg bg-gray-50 border border-gray-200/60 text-[10px] text-gray-600 font-mono focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Stroke</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={selectedElement.stroke === 'transparent' ? '#d1d5db' : selectedElement.stroke}
                      onChange={(e) => onUpdateElement(selectedElement.id, { stroke: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer border border-gray-200"
                    />
                    <input
                      type="text"
                      value={selectedElement.stroke}
                      onChange={(e) => onUpdateElement(selectedElement.id, { stroke: e.target.value })}
                      className="flex-1 px-2 py-1 rounded-lg bg-gray-50 border border-gray-200/60 text-[10px] text-gray-600 font-mono focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Opacity */}
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Opacity</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={selectedElement.opacity}
                    onChange={(e) => onUpdateElement(selectedElement.id, { opacity: Number(e.target.value) })}
                    className="flex-1 accent-gray-900"
                  />
                  <span className="text-[10px] text-gray-500 w-8 text-right tabular-nums">{Math.round(selectedElement.opacity * 100)}%</span>
                </div>
              </div>

              {/* Text properties */}
              {(selectedElement.type === 'text' || selectedElement.type === 'wireframe') && selectedElement.text !== undefined && (
                <div>
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Text</label>
                  <input
                    type="text"
                    value={selectedElement.text || ''}
                    onChange={(e) => onUpdateElement(selectedElement.id, { text: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200/60 text-xs text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  {selectedElement.fontSize !== undefined && (
                    <div className="flex items-center gap-2 mt-2">
                      <label className="text-[10px] text-gray-400">Size</label>
                      <input
                        type="number"
                        value={selectedElement.fontSize}
                        onChange={(e) => onUpdateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                        className="w-16 px-2 py-1 rounded-lg bg-gray-50 border border-gray-200/60 text-xs text-gray-700 focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
                <button onClick={onDuplicate} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Copy size={10} /> Duplicate
                </button>
                <button onClick={onDelete} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors">
                  <Trash2 size={10} /> Delete
                </button>
                <button onClick={onBringToFront} className="p-1.5 rounded-lg text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors" title="Bring to front">
                  <ArrowUp size={10} />
                </button>
                <button onClick={onSendToBack} className="p-1.5 rounded-lg text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors" title="Send to back">
                  <ArrowDown size={10} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scene Properties */}
      <div>
        <button
          onClick={() => setShowScene(!showScene)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Film size={13} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-900">Scene</span>
          </div>
          {showScene ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </button>

        {showScene && (
          <div className="px-4 pb-4 space-y-3">
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Name</label>
              <input
                type="text"
                value={scene.name}
                onChange={(e) => onUpdateScene({ name: e.target.value })}
                className="w-full px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200/60 text-xs text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="flex items-center gap-1 text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                  <Clock size={9} /> Duration
                </label>
                <input
                  type="number"
                  value={scene.duration}
                  onChange={(e) => onUpdateScene({ duration: e.target.value })}
                  min="0"
                  step="0.5"
                  className="w-full px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200/60 text-xs text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-1 text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                  <ArrowRightLeft size={9} /> Transition
                </label>
                <select
                  value={scene.transition}
                  onChange={(e) => onUpdateScene({ transition: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200/60 text-xs text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                >
                  {transitions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1 text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                <Palette size={9} /> Background
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={scene.backgroundColor}
                  onChange={(e) => onUpdateScene({ backgroundColor: e.target.value })}
                  className="w-7 h-7 rounded-lg cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  value={scene.backgroundColor}
                  onChange={(e) => onUpdateScene({ backgroundColor: e.target.value })}
                  className="flex-1 px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200/60 text-[10px] text-gray-600 font-mono focus:border-blue-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1 text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                <FileText size={9} /> Animation Notes
              </label>
              <textarea
                value={scene.notes}
                onChange={(e) => onUpdateScene({ notes: e.target.value })}
                placeholder="Describe animation behavior for After Effects..."
                className="w-full px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200/60 text-xs text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none h-28 leading-relaxed"
              />
            </div>

            {/* Quick animation tags */}
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 block">Quick Add</label>
              <div className="flex flex-wrap gap-1">
                {['Fade In', 'Slide Up', 'Scale', 'Typewriter', 'Stagger', 'Morph', 'Parallax', 'Spring', 'Blur In'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => onUpdateScene({ notes: scene.notes + (scene.notes ? '\n' : '') + `→ ${tag}` })}
                    className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
