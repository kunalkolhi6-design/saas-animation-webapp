import React, { useState } from 'react';
import { CanvasElement, WireframeType } from '../types';
import {
  Layers, Component, Eye, EyeOff, Lock, Unlock, ChevronDown, ChevronRight,
  Square, Circle, Type, Minus, Pencil, Layout, CreditCard, PanelLeft,
  Image, Heading, AlignLeft, User, BarChart3, ToggleLeft, Tag,
  ChevronDown as ChevDown, Table, List, Menu, SlidersHorizontal,
  AlertTriangle, Bell, FileX, MousePointerClick, Search, Radio,
  CheckSquare, Pill, Frame, Columns, FileText, Box
} from 'lucide-react';

interface LeftPanelProps {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onAddWireframe: (type: WireframeType, x: number, y: number) => void;
}

const componentCategories = [
  {
    name: 'Buttons',
    items: [
      { id: 'button-primary' as WireframeType, label: 'Primary', icon: <MousePointerClick size={14} /> },
      { id: 'button-secondary' as WireframeType, label: 'Secondary', icon: <Square size={14} /> },
      { id: 'button-ghost' as WireframeType, label: 'Ghost', icon: <Type size={14} /> },
    ]
  },
  {
    name: 'Inputs',
    items: [
      { id: 'input-text' as WireframeType, label: 'Text Input', icon: <Type size={14} /> },
      { id: 'input-search' as WireframeType, label: 'Search', icon: <Search size={14} /> },
      { id: 'textarea' as WireframeType, label: 'Textarea', icon: <FileText size={14} /> },
      { id: 'dropdown' as WireframeType, label: 'Dropdown', icon: <ChevDown size={14} /> },
    ]
  },
  {
    name: 'Navigation',
    items: [
      { id: 'navbar' as WireframeType, label: 'Navbar', icon: <Menu size={14} /> },
      { id: 'sidebar' as WireframeType, label: 'Sidebar', icon: <PanelLeft size={14} /> },
      { id: 'footer' as WireframeType, label: 'Footer', icon: <Columns size={14} /> },
      { id: 'breadcrumb' as WireframeType, label: 'Breadcrumb', icon: <ChevDown size={14} /> },
      { id: 'tabs' as WireframeType, label: 'Tabs', icon: <SlidersHorizontal size={14} /> },
    ]
  },
  {
    name: 'Layout',
    items: [
      { id: 'hero' as WireframeType, label: 'Hero', icon: <Frame size={14} /> },
      { id: 'hero-split' as WireframeType, label: 'Hero Split', icon: <Columns size={14} /> },
      { id: 'feature-grid' as WireframeType, label: 'Feature Grid', icon: <Layout size={14} /> },
      { id: 'card' as WireframeType, label: 'Card', icon: <CreditCard size={14} /> },
      { id: 'card-horizontal' as WireframeType, label: 'Card H', icon: <CreditCard size={14} /> },
      { id: 'pricing-card' as WireframeType, label: 'Pricing', icon: <CreditCard size={14} /> },
    ]
  },
  {
    name: 'Typography',
    items: [
      { id: 'heading' as WireframeType, label: 'Heading', icon: <Heading size={14} /> },
      { id: 'subheading' as WireframeType, label: 'Subheading', icon: <Heading size={14} /> },
      { id: 'body-text' as WireframeType, label: 'Body', icon: <AlignLeft size={14} /> },
      { id: 'caption' as WireframeType, label: 'Caption', icon: <AlignLeft size={14} /> },
    ]
  },
  {
    name: 'Media',
    items: [
      { id: 'image' as WireframeType, label: 'Image', icon: <Image size={14} /> },
      { id: 'video' as WireframeType, label: 'Video', icon: <Image size={14} /> },
      { id: 'avatar' as WireframeType, label: 'Avatar', icon: <User size={14} /> },
      { id: 'avatar-group' as WireframeType, label: 'Avatars', icon: <User size={14} /> },
      { id: 'icon-circle' as WireframeType, label: 'Icon', icon: <Box size={14} /> },
    ]
  },
  {
    name: 'Data',
    items: [
      { id: 'chart-bar' as WireframeType, label: 'Bar Chart', icon: <BarChart3 size={14} /> },
      { id: 'chart-line' as WireframeType, label: 'Line Chart', icon: <BarChart3 size={14} /> },
      { id: 'stat-card' as WireframeType, label: 'Stat Card', icon: <BarChart3 size={14} /> },
      { id: 'table' as WireframeType, label: 'Table', icon: <Table size={14} /> },
      { id: 'list-item' as WireframeType, label: 'List Item', icon: <List size={14} /> },
    ]
  },
  {
    name: 'Controls',
    items: [
      { id: 'toggle' as WireframeType, label: 'Toggle', icon: <ToggleLeft size={14} /> },
      { id: 'checkbox' as WireframeType, label: 'Checkbox', icon: <CheckSquare size={14} /> },
      { id: 'radio' as WireframeType, label: 'Radio', icon: <Radio size={14} /> },
      { id: 'progress' as WireframeType, label: 'Progress', icon: <SlidersHorizontal size={14} /> },
    ]
  },
  {
    name: 'Feedback',
    items: [
      { id: 'badge' as WireframeType, label: 'Badge', icon: <Tag size={14} /> },
      { id: 'tag' as WireframeType, label: 'Tag', icon: <Tag size={14} /> },
      { id: 'pill' as WireframeType, label: 'Pill', icon: <Pill size={14} /> },
      { id: 'toast' as WireframeType, label: 'Toast', icon: <Bell size={14} /> },
      { id: 'notification' as WireframeType, label: 'Notification', icon: <Bell size={14} /> },
      { id: 'alert' as WireframeType, label: 'Alert', icon: <AlertTriangle size={14} /> },
      { id: 'modal' as WireframeType, label: 'Modal', icon: <Frame size={14} /> },
      { id: 'empty-state' as WireframeType, label: 'Empty State', icon: <FileX size={14} /> },
      { id: 'skeleton' as WireframeType, label: 'Skeleton', icon: <Square size={14} /> },
    ]
  },
];

export default function LeftPanel({ elements, selectedId, onSelect, onToggleVisibility, onToggleLock, onAddWireframe }: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState<'components' | 'layers'>('components');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Buttons', 'Layout', 'Navigation']));

  const toggleCategory = (name: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="w-64 bg-white/70 backdrop-blur-xl border-r border-gray-200/60 flex flex-col flex-shrink-0">
      {/* Tabs */}
      <div className="flex border-b border-gray-200/60">
        <button
          onClick={() => setActiveTab('components')}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors ${activeTab === 'components' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Component size={13} />
            Components
          </div>
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors ${activeTab === 'layers' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Layers size={13} />
            Layers
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'components' ? (
          <div className="p-2">
            {componentCategories.map(cat => (
              <div key={cat.name} className="mb-1">
                <button
                  onClick={() => toggleCategory(cat.name)}
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {expandedCategories.has(cat.name) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  {cat.name}
                  <span className="ml-auto text-[10px] text-gray-400">{cat.items.length}</span>
                </button>
                {expandedCategories.has(cat.name) && (
                  <div className="grid grid-cols-2 gap-1 px-1 pb-1">
                    {cat.items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => onAddWireframe(item.id, 80, 80)}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150"
                      >
                        <span className="text-gray-400">{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2">
            {elements.length === 0 ? (
              <div className="text-center py-8">
                <Layers size={24} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs text-gray-400">No layers yet</p>
                <p className="text-[10px] text-gray-300 mt-1">Add components to see them here</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {[...elements].reverse().map(el => (
                  <div
                    key={el.id}
                    onClick={() => onSelect(el.id)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-150 ${
                      el.id === selectedId ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <span className="text-gray-400 flex-shrink-0">
                      {el.type === 'wireframe' ? <Component size={12} /> :
                       el.type === 'rectangle' ? <Square size={12} /> :
                       el.type === 'circle' ? <Circle size={12} /> :
                       el.type === 'text' ? <Type size={12} /> :
                       el.type === 'line' ? <Minus size={12} /> :
                       <Pencil size={12} />}
                    </span>
                    <span className="text-[11px] truncate flex-1">{el.name}</span>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleVisibility(el.id); }}
                        className="p-0.5 rounded hover:bg-gray-200/50 transition-colors"
                      >
                        {el.visible ? <Eye size={10} className="text-gray-400" /> : <EyeOff size={10} className="text-gray-300" />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleLock(el.id); }}
                        className="p-0.5 rounded hover:bg-gray-200/50 transition-colors"
                      >
                        {el.locked ? <Lock size={10} className="text-amber-500" /> : <Unlock size={10} className="text-gray-300" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
