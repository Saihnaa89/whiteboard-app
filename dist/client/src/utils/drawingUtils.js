export class DrawingManager {
    constructor(canvas) {
        this.history = [];
        this.historyIndex = 0;
        this.canvas = null;
        this.canvas = canvas;
    }
    // Add drawing to history
    addDrawing(drawing) {
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
    undo() {
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
    redo() {
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
    clear() {
        if (this.canvas) {
            this.canvas.clear();
            this.history = [];
            this.historyIndex = 0;
        }
    }
    // Get current state
    getState() {
        return {
            history: [...this.history],
            historyIndex: this.historyIndex
        };
    }
    // Load state
    loadState(state) {
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
    async saveAsImage() {
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
