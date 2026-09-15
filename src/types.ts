export type Tool = 'select' | 'hand' | 'rectangle' | 'circle' | 'line' | 'text' | 'freehand';

export type WireframeType =
  | 'button-primary' | 'button-secondary' | 'button-ghost'
  | 'input-text' | 'input-search' | 'textarea'
  | 'navbar' | 'sidebar' | 'footer'
  | 'card' | 'card-horizontal' | 'pricing-card'
  | 'hero' | 'hero-split' | 'feature-grid'
  | 'avatar' | 'avatar-group'
  | 'heading' | 'subheading' | 'body-text' | 'caption'
  | 'image' | 'video' | 'icon-circle'
  | 'chart-bar' | 'chart-line' | 'stat-card'
  | 'toggle' | 'checkbox' | 'radio'
  | 'badge' | 'tag' | 'pill'
  | 'dropdown' | 'modal' | 'toast'
  | 'table' | 'list-item' | 'breadcrumb'
  | 'tabs' | 'progress' | 'skeleton'
  | 'notification' | 'alert' | 'empty-state';

export interface CanvasElement {
  id: string;
  type: 'rectangle' | 'circle' | 'line' | 'text' | 'freehand' | 'wireframe';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  points?: { x: number; y: number }[];
  wireframeType?: WireframeType;
  opacity: number;
  rotation: number;
  locked: boolean;
  name: string;
  visible: boolean;
  borderRadius?: number;
}

export interface Scene {
  id: string;
  name: string;
  elements: CanvasElement[];
  notes: string;
  duration: string;
  transition: string;
  backgroundColor: string;
}

export interface Project {
  id: string;
  name: string;
  scenes: Scene[];
  createdAt: string;
  updatedAt: string;
}
