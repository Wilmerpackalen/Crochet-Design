class CrochetPatternDesigner {
    constructor() {
        this.canvas = document.getElementById('pattern-grid');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 15;
        this.cellSize = 40;
        this.selectedColor = '#ffffff';
        this.pattern = {};
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeGrid();
        this.drawGrid();
        this.updatePatternInfo();
    }
    
    setupEventListeners() {
        // Color palette selection
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectColor(e.target.dataset.color);
            });
        });
        
        // Grid size change
        document.getElementById('grid-size').addEventListener('change', (e) => {
            this.changeGridSize(parseInt(e.target.value));
        });
        
        // Canvas interactions - click only, no dragging
        this.canvas.addEventListener('click', (e) => this.colorCell(e));
        
        // Right-click to erase
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.eraseCell(e);
        });
        
        // Button events
        document.getElementById('clear-grid').addEventListener('click', () => this.clearGrid());
        document.getElementById('save-pattern').addEventListener('click', () => this.savePattern());
        document.getElementById('load-pattern').addEventListener('click', () => this.loadPattern());
        
        // File input for loading
        document.getElementById('file-input').addEventListener('change', (e) => this.handleFileLoad(e));
    }
    
    selectColor(color) {
        this.selectedColor = color;
        
        // Update active color in UI
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-color="${color}"]`).classList.add('active');
    }
    
    changeGridSize(newSize) {
        this.gridSize = newSize;
        this.cellSize = Math.floor(600 / this.gridSize);
        this.pattern = {};
        this.initializeGrid();
        this.drawGrid();
        this.updatePatternInfo();
    }
    
    initializeGrid() {
        // Initialize pattern with white cells
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const key = `${row}-${col}`;
                if (!this.pattern[key]) {
                    this.pattern[key] = '#ffffff';
                }
            }
        }
    }
    
    drawGrid() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw cells
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const key = `${row}-${col}`;
                const color = this.pattern[key] || '#ffffff';
                
                this.ctx.fillStyle = color;
                this.ctx.fillRect(
                    col * this.cellSize,
                    row * this.cellSize,
                    this.cellSize,
                    this.cellSize
                );
                
                // Draw grid lines
                this.ctx.strokeStyle = '#e0e0e0';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(
                    col * this.cellSize,
                    row * this.cellSize,
                    this.cellSize,
                    this.cellSize
                );
            }
        }
    }
    
    getCellCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        return { row, col };
    }
    
    colorCell(e) {
        const { row, col } = this.getCellCoordinates(e);
        
        if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
            const key = `${row}-${col}`;
            this.pattern[key] = this.selectedColor;
            
            // Redraw the specific cell
            this.ctx.fillStyle = this.selectedColor;
            this.ctx.fillRect(
                col * this.cellSize,
                row * this.cellSize,
                this.cellSize,
                this.cellSize
            );
            
            // Draw grid line
            this.ctx.strokeStyle = '#e0e0e0';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(
                col * this.cellSize,
                row * this.cellSize,
                this.cellSize,
                this.cellSize
            );
            
            this.updatePatternInfo();
        }
    }
    
    eraseCell(e) {
        const { row, col } = this.getCellCoordinates(e);
        
        if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
            const key = `${row}-${col}`;
            this.pattern[key] = '#ffffff';
            
            // Redraw the specific cell as white
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(
                col * this.cellSize,
                row * this.cellSize,
                this.cellSize,
                this.cellSize
            );
            
            // Draw grid line
            this.ctx.strokeStyle = '#e0e0e0';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(
                col * this.cellSize,
                row * this.cellSize,
                this.cellSize,
                this.cellSize
            );
            
            this.updatePatternInfo();
        }
    }
    
    clearGrid() {
        if (confirm('Are you sure you want to clear the entire grid?')) {
            this.pattern = {};
            this.initializeGrid();
            this.drawGrid();
            this.updatePatternInfo();
        }
    }
    
    updatePatternInfo() {
        // Update pattern size
        document.getElementById('pattern-size').textContent = `${this.gridSize}x${this.gridSize}`;
        
        // Count unique colors used
        const colors = new Set(Object.values(this.pattern));
        const nonWhiteColors = Array.from(colors).filter(color => color !== '#ffffff');
        document.getElementById('colors-count').textContent = nonWhiteColors.length;
    }
    
    savePattern() {
        const patternData = {
            gridSize: this.gridSize,
            pattern: this.pattern,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(patternData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `crochet-pattern-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        // Show success message
        this.showMessage('Pattern saved successfully!', 'success');
    }
    
    loadPattern() {
        document.getElementById('file-input').click();
    }
    
    handleFileLoad(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const patternData = JSON.parse(event.target.result);
                
                if (patternData.gridSize && patternData.pattern) {
                    this.gridSize = patternData.gridSize;
                    this.cellSize = Math.floor(600 / this.gridSize);
                    this.pattern = patternData.pattern;
                    
                    // Update UI
                    document.getElementById('grid-size').value = this.gridSize;
                    this.initializeGrid();
                    this.drawGrid();
                    this.updatePatternInfo();
                    
                    this.showMessage('Pattern loaded successfully!', 'success');
                } else {
                    throw new Error('Invalid pattern file format');
                }
            } catch (error) {
                this.showMessage('Error loading pattern: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    }
    
    showMessage(message, type) {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            ${type === 'success' ? 'background: linear-gradient(45deg, #4CAF50, #45a049);' : 'background: linear-gradient(45deg, #f44336, #da190b);'}
        `;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(messageEl);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(messageEl);
                document.head.removeChild(style);
            }, 300);
        }, 3000);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CrochetPatternDesigner();
});

// Add some additional utility functions
window.CrochetUtils = {
    // Generate a random pattern
    generateRandomPattern: function(gridSize = 15) {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
        const pattern = {};
        
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const key = `${row}-${col}`;
                // 70% chance of being white, 30% chance of being colored
                pattern[key] = Math.random() < 0.3 ? colors[Math.floor(Math.random() * colors.length)] : '#ffffff';
            }
        }
        
        return pattern;
    },
    
    // Export pattern as image
    exportAsImage: function(canvas) {
        const link = document.createElement('a');
        link.download = `crochet-pattern-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }
};