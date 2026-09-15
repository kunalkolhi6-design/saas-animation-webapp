import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CanvasElement, Tool, WireframeType } from '../types';

export function useCanvas() {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<Tool>('select');
  const [fillColor, setFillColor] = useState('#ffffff');
  const [strokeColor, setStrokeColor] = useState('#d1d5db');
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [zoom, setZoom] = useState(100);

  const addElement = useCallback((element: Partial<CanvasElement> & { type: CanvasElement['type'] }) => {
    const newElement: CanvasElement = {
      id: uuidv4(),
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      fill: '#f3f4f6',
      stroke: '#d1d5db',
      strokeWidth: 1,
      opacity: 1,
      rotation: 0,
      locked: false,
      name: element.type === 'wireframe' ? (element.wireframeType || 'Component') : element.type,
      visible: true,
      borderRadius: 8,
      ...element,
    };
    setElements(prev => [...prev, newElement]);
    setSelectedId(newElement.id);
    return newElement.id;
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  }, []);

  const deleteElement = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const duplicateElement = useCallback((id: string) => {
    const el = elements.find(e => e.id === id);
    if (el) {
      const newEl = { ...el, id: uuidv4(), x: el.x + 20, y: el.y + 20, name: `${el.name} copy` };
      setElements(prev => [...prev, newEl]);
      setSelectedId(newEl.id);
    }
  }, [elements]);

  const bringToFront = useCallback((id: string) => {
    setElements(prev => {
      const el = prev.find(e => e.id === id);
      if (!el) return prev;
      return [...prev.filter(e => e.id !== id), el];
    });
  }, []);

  const sendToBack = useCallback((id: string) => {
    setElements(prev => {
      const el = prev.find(e => e.id === id);
      if (!el) return prev;
      return [el, ...prev.filter(e => e.id !== id)];
    });
  }, []);

  const toggleVisibility = useCallback((id: string) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, visible: !el.visible } : el));
  }, []);

  const toggleLock = useCallback((id: string) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, locked: !el.locked } : el));
  }, []);

  const addWireframeElement = useCallback((type: WireframeType, x: number, y: number) => {
    const presets: Record<WireframeType, Partial<CanvasElement>> = {
      'button-primary': { width: 140, height: 44, fill: '#0071e3', stroke: 'transparent', text: 'Get Started', fontSize: 14, fontWeight: '500', borderRadius: 980 },
      'button-secondary': { width: 140, height: 44, fill: 'transparent', stroke: '#0071e3', text: 'Learn More', fontSize: 14, fontWeight: '500', borderRadius: 980 },
      'button-ghost': { width: 120, height: 36, fill: 'transparent', stroke: 'transparent', text: 'Link Text', fontSize: 14, fontWeight: '400', borderRadius: 4 },
      'input-text': { width: 280, height: 44, fill: '#f5f5f7', stroke: '#d2d2d7', text: 'Enter your email', fontSize: 14, borderRadius: 12 },
      'input-search': { width: 320, height: 40, fill: '#f5f5f7', stroke: '#d2d2d7', text: 'Search...', fontSize: 14, borderRadius: 10 },
      'textarea': { width: 320, height: 120, fill: '#f5f5f7', stroke: '#d2d2d7', text: 'Message...', fontSize: 14, borderRadius: 12 },
      'navbar': { width: 720, height: 48, fill: 'rgba(255,255,255,0.8)', stroke: '#d2d2d7' },
      'sidebar': { width: 240, height: 560, fill: '#fbfbfd', stroke: '#e8e8ed' },
      'footer': { width: 720, height: 200, fill: '#f5f5f7', stroke: '#d2d2d7' },
      'card': { width: 300, height: 360, fill: '#ffffff', stroke: '#e8e8ed', borderRadius: 18 },
      'card-horizontal': { width: 480, height: 160, fill: '#ffffff', stroke: '#e8e8ed', borderRadius: 18 },
      'pricing-card': { width: 280, height: 420, fill: '#ffffff', stroke: '#e8e8ed', borderRadius: 22 },
      'hero': { width: 680, height: 400, fill: '#fbfbfd', stroke: '#e8e8ed', borderRadius: 22 },
      'hero-split': { width: 800, height: 360, fill: '#fbfbfd', stroke: '#e8e8ed', borderRadius: 22 },
      'feature-grid': { width: 720, height: 280, fill: '#fbfbfd', stroke: '#e8e8ed', borderRadius: 18 },
      'avatar': { width: 44, height: 44, fill: '#e8e8ed', stroke: 'transparent', borderRadius: 999 },
      'avatar-group': { width: 140, height: 44, fill: 'transparent', stroke: 'transparent' },
      'heading': { width: 400, height: 48, fill: 'transparent', stroke: 'transparent', text: 'Heading', fontSize: 32, fontWeight: '600' },
      'subheading': { width: 360, height: 32, fill: 'transparent', stroke: 'transparent', text: 'Subheading', fontSize: 21, fontWeight: '500' },
      'body-text': { width: 360, height: 48, fill: 'transparent', stroke: 'transparent', text: 'Body text goes here with a clean description.', fontSize: 17, fontWeight: '400' },
      'caption': { width: 200, height: 20, fill: 'transparent', stroke: 'transparent', text: 'Caption text', fontSize: 12, fontWeight: '400' },
      'image': { width: 280, height: 200, fill: '#f5f5f7', stroke: '#e8e8ed', borderRadius: 12 },
      'video': { width: 480, height: 270, fill: '#1d1d1f', stroke: 'transparent', borderRadius: 12 },
      'icon-circle': { width: 48, height: 48, fill: '#0071e3', stroke: 'transparent', borderRadius: 999 },
      'chart-bar': { width: 320, height: 200, fill: '#ffffff', stroke: '#e8e8ed', borderRadius: 12 },
      'chart-line': { width: 320, height: 200, fill: '#ffffff', stroke: '#e8e8ed', borderRadius: 12 },
      'stat-card': { width: 180, height: 100, fill: '#ffffff', stroke: '#e8e8ed', borderRadius: 14 },
      'toggle': { width: 51, height: 31, fill: '#34c759', stroke: 'transparent', borderRadius: 999 },
      'checkbox': { width: 22, height: 22, fill: '#0071e3', stroke: 'transparent', borderRadius: 6 },
      'radio': { width: 22, height: 22, fill: 'transparent', stroke: '#d2d2d7', borderRadius: 999 },
      'badge': { width: 60, height: 24, fill: '#e8f5e9', stroke: 'transparent', text: 'New', fontSize: 11, fontWeight: '500', borderRadius: 980 },
      'tag': { width: 80, height: 28, fill: '#f5f5f7', stroke: '#d2d2d7', text: 'Tag', fontSize: 12, borderRadius: 8 },
      'pill': { width: 100, height: 32, fill: '#f5f5f7', stroke: 'transparent', text: 'Category', fontSize: 13, fontWeight: '500', borderRadius: 980 },
      'dropdown': { width: 200, height: 40, fill: '#ffffff', stroke: '#d2d2d7', text: 'Select option', fontSize: 14, borderRadius: 10 },
      'modal': { width: 400, height: 280, fill: '#ffffff', stroke: '#e8e8ed', borderRadius: 16 },
      'toast': { width: 320, height: 52, fill: '#1d1d1f', stroke: 'transparent', text: 'Notification message', fontSize: 13, borderRadius: 14 },
      'table': { width: 480, height: 240, fill: '#ffffff', stroke: '#e8e8ed', borderRadius: 12 },
      'list-item': { width: 400, height: 56, fill: '#ffffff', stroke: '#e8e8ed', borderRadius: 10 },
      'breadcrumb': { width: 300, height: 20, fill: 'transparent', stroke: 'transparent', text: 'Home / Products / Details', fontSize: 13, fontWeight: '400' },
      'tabs': { width: 320, height: 36, fill: '#f5f5f7', stroke: 'transparent', borderRadius: 10 },
      'progress': { width: 240, height: 6, fill: '#e8e8ed', stroke: 'transparent', borderRadius: 999 },
      'skeleton': { width: 200, height: 16, fill: '#e8e8ed', stroke: 'transparent', borderRadius: 8 },
      'notification': { width: 360, height: 72, fill: '#ffffff', stroke: '#e8e8ed', borderRadius: 14 },
      'alert': { width: 400, height: 56, fill: '#fff3cd', stroke: '#ffc107', text: 'Warning message here', fontSize: 14, borderRadius: 12 },
      'empty-state': { width: 320, height: 240, fill: '#fbfbfd', stroke: '#e8e8ed', borderRadius: 18 },
    };

    const preset = presets[type];
    addElement({
      type: 'wireframe',
      wireframeType: type,
      x,
      y,
      name: type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      ...preset,
    });
  }, [addElement]);

  const loadElements = useCallback((newElements: CanvasElement[]) => {
    setElements(newElements);
    setSelectedId(null);
  }, []);

  return {
    elements,
    selectedId,
    tool,
    fillColor,
    strokeColor,
    strokeWidth,
    zoom,
    setTool,
    setFillColor,
    setStrokeColor,
    setStrokeWidth,
    setZoom,
    setSelectedId,
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    bringToFront,
    sendToBack,
    toggleVisibility,
    toggleLock,
    addWireframeElement,
    loadElements,
  };
}
