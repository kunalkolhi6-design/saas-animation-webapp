import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Scene, Project, WireframeType } from './types';
import { useCanvas } from './hooks/useCanvas';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import SceneStrip from './components/SceneStrip';
import { Save, Download, Upload, Eye, Sparkles } from 'lucide-react';

function createDefaultScene(name: string = 'Scene 1'): Scene {
  return {
    id: uuidv4(),
    name,
    elements: [],
    notes: '',
    duration: '3',
    transition: 'Fade',
    backgroundColor: '#ffffff',
  };
}

function App() {
  const [projectName, setProjectName] = useState('My SaaS Animation');
  const [scenes, setScenes] = useState<Scene[]>([createDefaultScene()]);
  const [activeSceneId, setActiveSceneId] = useState(scenes[0].id);
  const [showPreview, setShowPreview] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [saved, setSaved] = useState(false);

  const canvas = useCanvas();

  const activeScene = scenes.find(s => s.id === activeSceneId) || scenes[0];
  const selectedElement = canvas.elements.find(el => el.id === canvas.selectedId) || null;

  // Load active scene elements into canvas
  useEffect(() => {
    canvas.loadElements(activeScene.elements);
  }, [activeSceneId]);

  // Save canvas changes back to scene
  const syncScene = useCallback(() => {
    setScenes(prev => prev.map(s =>
      s.id === activeSceneId ? { ...s, elements: canvas.elements } : s
    ));
  }, [activeSceneId, canvas.elements]);

  // Auto-save on changes
  useEffect(() => {
    const timer = setTimeout(syncScene, 100);
    return () => clearTimeout(timer);
  }, [canvas.elements, syncScene]);

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      const project: Project = {
        id: 'default',
        name: projectName,
        scenes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('storyframe-project', JSON.stringify(project));
    }, 500);
    return () => clearTimeout(timer);
  }, [scenes, projectName]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('storyframe-project');
    if (saved) {
      try {
        const project: Project = JSON.parse(saved);
        setProjectName(project.name);
        setScenes(project.scenes);
        setActiveSceneId(project.scenes[0]?.id || '');
      } catch (e) {
        console.error('Failed to load project', e);
      }
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

      switch (e.key.toLowerCase()) {
        case 'v': canvas.setTool('select'); break;
        case 'h': canvas.setTool('hand'); break;
        case 'r': canvas.setTool('rectangle'); break;
        case 'o': canvas.setTool('circle'); break;
        case 'l': canvas.setTool('line'); break;
        case 't': canvas.setTool('text'); break;
        case 'p': canvas.setTool('freehand'); break;
        case 'delete':
        case 'backspace':
          if (canvas.selectedId) canvas.deleteElement(canvas.selectedId);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvas]);

  const handleUpdateScene = (updates: Partial<Scene>) => {
    setScenes(prev => prev.map(s => s.id === activeSceneId ? { ...s, ...updates } : s));
  };

  const handleAddScene = () => {
    const newScene = createDefaultScene(`Scene ${scenes.length + 1}`);
    setScenes(prev => [...prev, newScene]);
    setActiveSceneId(newScene.id);
  };

  const handleDeleteScene = (id: string) => {
    if (scenes.length <= 1) return;
    const newScenes = scenes.filter(s => s.id !== id);
    setScenes(newScenes);
    if (activeSceneId === id) setActiveSceneId(newScenes[0].id);
  };

  const handleDuplicateScene = (id: string) => {
    const scene = scenes.find(s => s.id === id);
    if (!scene) return;
    const newScene: Scene = {
      ...scene,
      id: uuidv4(),
      name: `${scene.name} (copy)`,
      elements: scene.elements.map(el => ({ ...el, id: uuidv4() })),
    };
    const idx = scenes.findIndex(s => s.id === id);
    const newScenes = [...scenes];
    newScenes.splice(idx + 1, 0, newScene);
    setScenes(newScenes);
    setActiveSceneId(newScene.id);
  };

  const handleAddWireframe = (type: WireframeType, x: number, y: number) => {
    canvas.addWireframeElement(type, x, y);
  };

  const handleExport = () => {
    syncScene();
    const project: Project = {
      id: uuidv4(),
      name: projectName,
      scenes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}_storyboard.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const project: Project = JSON.parse(e.target?.result as string);
          setProjectName(project.name);
          setScenes(project.scenes);
          setActiveSceneId(project.scenes[0]?.id || '');
        } catch {
          alert('Invalid project file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleSave = () => {
    syncScene();
    const project: Project = {
      id: 'default',
      name: projectName,
      scenes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('storyframe-project', JSON.stringify(project));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const startPreview = () => {
    syncScene();
    setPreviewIndex(0);
    setShowPreview(true);
  };

  // Preview mode
  if (showPreview) {
    const previewScene = scenes[previewIndex];
    return (
      <div className="h-screen w-screen bg-[#1d1d1f] flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 bg-[#1d1d1f]/90 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-3">
            <Sparkles size={16} className="text-blue-400" />
            <span className="text-white/90 text-sm font-medium">{previewScene?.name}</span>
            <span className="text-white/40 text-xs">{previewIndex + 1} of {scenes.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewIndex(Math.max(0, previewIndex - 1))}
              disabled={previewIndex === 0}
              className="px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium disabled:opacity-30 hover:bg-white/20 transition-colors"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPreviewIndex(Math.min(scenes.length - 1, previewIndex + 1))}
              disabled={previewIndex === scenes.length - 1}
              className="px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium disabled:opacity-30 hover:bg-white/20 transition-colors"
            >
              Next →
            </button>
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium hover:bg-white/20 transition-colors"
            >
              Exit
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="w-full max-w-5xl aspect-video bg-white rounded-2xl shadow-2xl overflow-hidden relative">
            <Canvas
              elements={previewScene?.elements || []}
              selectedId={null}
              tool="select"
              fillColor="#f3f4f6"
              strokeColor="#d1d5db"
              strokeWidth={1}
              backgroundColor={previewScene?.backgroundColor || '#ffffff'}
              zoom={100}
              onSelect={() => {}}
              onAddElement={() => ''}
              onUpdateElement={() => {}}
            />
            {previewScene?.notes && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12">
                <p className="text-white/90 text-sm leading-relaxed">{previewScene.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#f5f5f7] overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 flex items-center justify-between px-5 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-transparent text-gray-900 font-semibold text-sm border-none focus:outline-none w-56 tracking-tight"
              />
              <p className="text-[10px] text-gray-400 -mt-0.5 tracking-tight">Storyboard & Wireframe</p>
            </div>
          </div>
        </div>

        <Toolbar
          tool={canvas.tool}
          setTool={canvas.setTool}
          zoom={canvas.zoom}
          setZoom={canvas.setZoom}
          selectedId={canvas.selectedId}
          onDelete={() => canvas.selectedId && canvas.deleteElement(canvas.selectedId)}
          onDuplicate={() => canvas.selectedId && canvas.duplicateElement(canvas.selectedId)}
        />

        <div className="flex items-center gap-2">
          <button
            onClick={startPreview}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Eye size={13} /> Preview
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              saved ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Save size={13} /> {saved ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors"
          >
            <Download size={13} />
          </button>
          <button
            onClick={handleImport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors"
          >
            <Upload size={13} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Components & Layers */}
        <LeftPanel
          elements={canvas.elements}
          selectedId={canvas.selectedId}
          onSelect={canvas.setSelectedId}
          onToggleVisibility={canvas.toggleVisibility}
          onToggleLock={canvas.toggleLock}
          onAddWireframe={handleAddWireframe}
        />

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-5 overflow-hidden">
            <div className="w-full h-full rounded-2xl shadow-sm overflow-hidden border border-gray-200/60 bg-white">
              <Canvas
                elements={canvas.elements}
                selectedId={canvas.selectedId}
                tool={canvas.tool}
                fillColor={canvas.fillColor}
                strokeColor={canvas.strokeColor}
                strokeWidth={canvas.strokeWidth}
                backgroundColor={activeScene.backgroundColor}
                zoom={canvas.zoom}
                onSelect={canvas.setSelectedId}
                onAddElement={canvas.addElement}
                onUpdateElement={canvas.updateElement}
              />
            </div>
          </div>

          {/* Scene Strip */}
          <SceneStrip
            scenes={scenes}
            activeSceneId={activeSceneId}
            onSelectScene={setActiveSceneId}
            onAddScene={handleAddScene}
            onDeleteScene={handleDeleteScene}
            onDuplicateScene={handleDuplicateScene}
          />
        </div>

        {/* Right Panel - Properties */}
        <RightPanel
          selectedElement={selectedElement}
          scene={activeScene}
          onUpdateElement={canvas.updateElement}
          onUpdateScene={handleUpdateScene}
          onDelete={() => canvas.selectedId && canvas.deleteElement(canvas.selectedId)}
          onDuplicate={() => canvas.selectedId && canvas.duplicateElement(canvas.selectedId)}
          onBringToFront={() => canvas.selectedId && canvas.bringToFront(canvas.selectedId)}
          onSendToBack={() => canvas.selectedId && canvas.sendToBack(canvas.selectedId)}
        />
      </div>
    </div>
  );
}

export default App;
