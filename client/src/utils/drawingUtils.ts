import { fabric } from 'fabric';

export interface DrawingObject {
  type: string;
  path: fabric.Object;
  roomId: string;
  userId: string;
}

export class DrawingManager {
  private history: DrawingObject[] = [];
  private historyIndex: number = 0;
  private canvas: fabric.Canvas | null = null;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
  }

  // Add drawing to history
  public addDrawing(drawing: DrawingObject) {
    // Remove future history
    this.history = this.history.slice(0, this.historyIndex);
    
    // Add new drawing
    this.history.push(drawing);
    this.historyIndex = this.history.length;

    // Update canvas
    if (this.canvas) {
      this.canvas.add(drawing.path);
      this.canvas.renderAll();
    }
  }

  // Undo last drawing
  public undo(): boolean {
    if (this.historyIndex > 0) {
      const currentHistory = [...this.history];
      const currentObject = currentHistory[this.historyIndex - 1];
      
      if (this.canvas) {
        this.canvas.remove(currentObject.path);
        this.canvas.renderAll();
      }

      this.historyIndex--;
      return true;
    }
    return false;
  }

  // Redo last undone drawing
  public redo(): boolean {
    if (this.historyIndex < this.history.length) {
      const currentHistory = [...this.history];
      const currentObject = currentHistory[this.historyIndex];
      
      if (this.canvas) {
        this.canvas.add(currentObject.path);
        this.canvas.renderAll();
      }

      this.historyIndex++;
      return true;
    }
    return false;
  }

  // Clear canvas and history
  public clear() {
    if (this.canvas) {
      this.canvas.clear();
      this.history = [];
      this.historyIndex = 0;
    }
  }

  // Get current state
  public getState(): {
    history: DrawingObject[];
    historyIndex: number;
  } {
    return {
      history: [...this.history],
      historyIndex: this.historyIndex
    };
  }

  // Load state
  public loadState(state: {
    history: DrawingObject[];
    historyIndex: number;
  }) {
    this.history = state.history;
    this.historyIndex = state.historyIndex;

    if (this.canvas) {
      this.canvas.clear();
      this.history.forEach(drawing => {
        this.canvas.add(drawing.path);
      });
      this.canvas.renderAll();
    }
  }

  // Save current drawing to image
  public async saveAsImage(): Promise<string> {
    if (this.canvas) {
      return new Promise((resolve, reject) => {
        this.canvas.toDataURL('image/png', (dataUrl) => {
          resolve(dataUrl);
        });
      });
    }
    return Promise.reject('Canvas not initialized');
  }
}
