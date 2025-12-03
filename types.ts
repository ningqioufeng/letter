
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface BoardImage {
  id: string;
  src: string;
  position: Position;
  rotation: number;
  width: number;
  height: number;
  caption?: string;
  zIndex: number;
  font?: string;
  fontSize?: number;
}

export interface StickerItem {
  id: string;
  type: 'emoji' | 'text';
  content: string;
  position: Position;
  rotation: number;
  scale: number;
  zIndex: number;
  fontSize?: number;
  font?: string;
}

export interface PaperState {
  color: string;
  text: string;
  position: Position;
  rotation: number;
  size: Size;
  font?: string;
  fontSize?: number;
}

export enum ToolType {
  NONE = 'NONE',
  PAPER_COLOR = 'PAPER_COLOR',
  BG_COLOR = 'BG_COLOR',
}