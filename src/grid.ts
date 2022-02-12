import { getColor } from "./constants";

export class GridWorld {

    colors: string[][];
    texts: string[][];

    constructor(public tileSize: number, public padding: number, public rows: number, public cols: number, 
        public textSize: number, public iconSize: number, color: string, public textColor: string, public icon: string) { 
        this.texts = [];
        this.colors = [];

        for(var i: number = 0; i < rows; i++) {
            this.texts[i] = [];
            this.colors[i] = [];
            for(var j: number = 0; j< cols; j++) {
                this.texts[i][j] = "";
                this.colors[i][j] = color;
            }
        }
    }

    setTileColor(rowIdx: number, colIdx: number, color: string) {
        this.colors[rowIdx][colIdx] = color;
    }

    setTileColors(colors: (string | null)[][]) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const color = colors[i][j];
                if (color !== null) {
                    const c = getColor(color);
                    if (c !== undefined) {
                        this.setTileColor(i, j, c);
                    }
                }
            }
        }
    }

    setText(rowIdx: number, colIdx: number, text: string) {
        this.texts[rowIdx][colIdx] = text;
    }

    setTexts(texts: (string | null)[][]) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const text = texts[i][j];
                if (text !== null) {
                    this.setText(i, j, text);
                }
            }
        }
    }

    drawGrid(ctx: CanvasRenderingContext2D, rowIdx: number, colIdx: number) {
        var tilePlusPadding = this.tileSize + this.padding;
        
        for(var i = 0; i < this.rows; i++) {
            for(var j = 0; j < this.cols; j++) {
                ctx.fillStyle = this.colors[i][j];
                ctx.fillRect(this.padding + j*tilePlusPadding, this.padding + i*tilePlusPadding, this.tileSize, this.tileSize); // tlx, tly, width, height

                if (i === rowIdx && j === colIdx) {
                    var paddingFromTop = 0;
                    if (this.texts[i][j] !== "") {
                        paddingFromTop = -this.tileSize / 12;
                        this.drawText(ctx, i, j, this.texts[i][j], this.textSize, this.tileSize / 4);
                    }
                    this.drawText(ctx, rowIdx, colIdx, this.icon, this.iconSize, paddingFromTop);
                    
                } else if (this.texts[i][j] !== "") {
                    this.drawText(ctx, i, j, this.texts[i][j], this.textSize, 0);
                }
            }
        }

    }

    drawCircle(ctx: CanvasRenderingContext2D, rowIdx: number, colIdx: number, radius: number, color: string) {
        var centerX = this.padding + this.tileSize / 2 + colIdx * (this.tileSize + this.padding);
        var centerY = this.padding + this.tileSize / 2 + rowIdx * (this.tileSize + this.padding);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        ctx.stroke();
    }

    drawText(ctx: CanvasRenderingContext2D, rowIdx: number, colIdx: number, text: string, size: number, paddingFromTop: number) {
        var centerX = this.padding + this.tileSize / 2 + colIdx * (this.tileSize + this.padding);
        var centerY = this.padding + this.tileSize / 2 + rowIdx * (this.tileSize + this.padding) + paddingFromTop;

        ctx.fillStyle = this.textColor;
        ctx.textAlign = "center";               // horizontal center
        ctx.textBaseline = "middle";            // vertical center
        ctx.font = size + "px Courier New";
        ctx.fillText(text, centerX, centerY);
    }

}

export function clearCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}