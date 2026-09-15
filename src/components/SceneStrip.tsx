import React from 'react';
import { Scene } from '../types';
import { Plus, Trash2, Copy, Film } from 'lucide-react';

interface SceneStripProps {
  scenes: Scene[];
  activeSceneId: string;
  onSelectScene: (id: string) => void;
  onAddScene: () => void;
  onDeleteScene: (id: string) => void;
  onDuplicateScene: (id: string) => void;
}

export default function SceneStrip({
  scenes,
  activeSceneId,
  onSelectScene,
  onAddScene,
  onDeleteScene,
  onDuplicateScene,
}: SceneStripProps) {
  return (
    <div className="h-28 bg-white/60 backdrop-blur-xl border-t border-gray-200/60 flex flex-col flex-shrink-0">
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Film size={13} className="text-gray-400" />
          <span className="text-[11px] font-semibold text-gray-600">Scenes</span>
          <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{scenes.length}</span>
        </div>
        <button
          onClick={onAddScene}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          <Plus size={11} /> Add Scene
        </button>
      </div>
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-3 py-2 flex gap-2 items-center">
        {scenes.map((scene, index) => (
          <div
            key={scene.id}
            onClick={() => onSelectScene(scene.id)}
            className={`relative flex-shrink-0 w-32 h-16 rounded-xl cursor-pointer transition-all duration-200 overflow-hidden group ${
              scene.id === activeSceneId
                ? 'ring-2 ring-blue-500 ring-offset-1 shadow-lg shadow-blue-500/10'
                : 'ring-1 ring-gray-200 hover:ring-gray-300 hover:shadow-md'
            }`}
          >
            {/* Background */}
            <div className="absolute inset-0" style={{ backgroundColor: scene.backgroundColor }}>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5" />
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center p-2">
              <span className="text-[9px] font-semibold text-gray-700 truncate w-full text-center">{scene.name}</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[8px] text-gray-400">{scene.elements.length} el</span>
                {scene.duration && <span className="text-[8px] text-gray-400">• {scene.duration}s</span>}
              </div>
            </div>

            {/* Scene number */}
            <div className="absolute top-1 left-1.5 w-4 h-4 rounded-full bg-black/10 backdrop-blur-sm flex items-center justify-center">
              <span className="text-[8px] font-bold text-gray-600">{index + 1}</span>
            </div>

            {/* Hover actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 rounded-xl">
              <button
                onClick={(e) => { e.stopPropagation(); onDuplicateScene(scene.id); }}
                className="p-1 rounded-md bg-white/90 text-gray-700 hover:bg-white transition-colors"
                title="Duplicate"
              >
                <Copy size={10} />
              </button>
              {scenes.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteScene(scene.id); }}
                  className="p-1 rounded-md bg-white/90 text-red-500 hover:bg-white transition-colors"
                  title="Delete"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Add scene */}
        <button
          onClick={onAddScene}
          className="flex-shrink-0 w-32 h-16 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-400 hover:bg-blue-50/50 transition-all"
        >
          <div className="text-center">
            <Plus size={16} className="mx-auto" />
            <span className="text-[9px] mt-0.5 block font-medium">Add Scene</span>
          </div>
        </button>
      </div>
    </div>
  );
}
