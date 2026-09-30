export type WhiteboardTool =
  | 'select'
  | 'pen'
  | 'highlighter'
  | 'eraser'
  | 'line'
  | 'rectangle'
  | 'circle'
  | 'arrow';

export interface Point {
  x: number;
  y: number;
}

export interface WhiteboardElement {
  id: string;
  tool: WhiteboardTool;
  color: string;
  strokeWidth: number;
  points?: Point[];
  startPoint?: Point;
  endPoint?: Point;
  opacity?: number;
}

export interface SlideWhiteboardState {
  slideId: string;
  elements: WhiteboardElement[];
  undoStack: WhiteboardElement[][];
  redoStack: WhiteboardElement[][];
}
