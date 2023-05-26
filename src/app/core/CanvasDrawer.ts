import { ColoredGate, Destination, Gate, Spawner, TimedGate } from "./Building";
import { Car } from "./Car";
import { Tunnel } from "./Road";
import { Tile } from "./Tile";

class BasicDrawer {
    private ctx: CanvasRenderingContext2D;
    constructor(private canvas: HTMLCanvasElement) {
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.font = Tile.SIZE * 0.4 + "px Serif";
    }

    set strokeStyle(color: string) {
        if(this.ctx.strokeStyle != color) {
            this.ctx.strokeStyle = color;
        }
    }
    set fillStyle(color: string) {
        if(this.ctx.fillStyle != color) {
            this.ctx.fillStyle = color;
        }
    }
    set lineWidth(width: number) {
        if(this.ctx.lineWidth != width) {
            this.ctx.lineWidth = width;
        }
    }
    set lineCap(cap: CanvasLineCap) {
        if(this.ctx.lineCap != cap) {
            this.ctx.lineCap = cap;
        }
    }
    protected line(x1: number, y1: number, x2: number, y2: number, width: number) {
        this.lineWidth = width;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }
    protected square(x: number, y: number, side: number, color = "black", fill = true) {
        if(fill) {
            this.fillStyle = color;
        } else {
            this.strokeStyle = color;
        }
        this.ctx.beginPath();
        this.ctx.rect(x, y, side, side);
        this.ctx[fill ? "fill" : "stroke"]();
    }
    protected circle(x: number, y: number, radius: number, color = "black", fill = true) {
        if(fill) {
            this.fillStyle = color;
        } else {
            this.strokeStyle = color;
        }
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx[fill ? "fill" : "stroke"]();
    }
    protected text(text: string, x: number, y: number) {
        this.fillStyle = "black";
        this.ctx.fillText(text, x, y);
    }
    protected roadBase(x: number, y: number, connectedRoads: boolean[], color: string, size: number) {
        this.strokeStyle = color;
        this.lineWidth = size;
        this.lineCap = "round";
        this.ctx.beginPath();
        this.ctx.moveTo((x + 0.5) * Tile.SIZE, (y + 0.5) * Tile.SIZE);
        this.ctx.lineTo((x + 0.5) * Tile.SIZE, (y + 0.5) * Tile.SIZE);
        for(let i = 0; i < 4; i++) {
            if(connectedRoads[i]) {
                this.ctx.lineTo((x + 0.5 + [1, 0, -1, 0][i] / 2) * Tile.SIZE, (y + 0.5 + [0, 1, 0, -1][i] / 2) * Tile.SIZE);
                this.ctx.moveTo((x + 0.5) * Tile.SIZE, (y + 0.5) * Tile.SIZE);
            }
        }
        this.ctx.stroke();
    }
    protected clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};

export class CanvasDrawer extends BasicDrawer {
    public drawAll(map: Tile[][]) {
        this.clear();
        // tile colors
        map.forEach(row => row.forEach(tile => this.drawTileBase(tile)));
        // grid
        this.strokeStyle = "black";
        this.lineCap = "square";
        this.lineWidth = 1;
        const rows = map[0].length;
        const cols = map.length;
        for(let x = 1; x < cols; x++) {
            this.line(x * Tile.SIZE, 0, x * Tile.SIZE, rows * Tile.SIZE, 1);
        }
        for(let y = 1; y < rows; y++) {
            this.line(0, y * Tile.SIZE, cols * Tile.SIZE, y * Tile.SIZE, 1);
        }
        // roads
        for(let x = 0; x < cols; x++) {
            for(let y = 0; y < rows; y++) {
                this.drawRoad(map[x][y], map[x][y].getConnectedRoads(map));
            }
        }
        // cars
        Car.pool.forEach(car => this.drawCar(car));
        // buildings
        map.forEach(row => row.forEach(tile => this.drawBuilding(tile)));
    }
    private drawTileBase(tile: Tile) {
        this.square(tile.x * Tile.SIZE, tile.y * Tile.SIZE, Tile.SIZE, tile.color);
    }
    private drawBuilding(tile: Tile) {
        if(!tile.building) {
            return;
        }
        if(tile.building instanceof Gate) {
            this.drawGate(tile, tile.building);
        } else if(tile.building instanceof Spawner) {
            this.drawSpawner(tile, tile.building);
        } else if(tile.building instanceof Destination) {
            this.drawDestination(tile, tile.building);
        }
    }
    private drawRoad(tile: Tile, neighboringRoads: boolean[]) {
        if(!tile.road) {
            return;
        }
        if(tile.road instanceof Tunnel) {
            this.drawTunnel(tile, neighboringRoads);
        } else {
            this.drawBasicRoad(tile, neighboringRoads);
        }
    }
    private drawBasicRoad(tile: Tile, neighboringRoads: boolean[]) {
        this.roadBase(tile.x, tile.y, neighboringRoads, "black", Tile.SIZE / 2);
    }
    private drawTunnel(tile: Tile, neighboringRoads: boolean[]) {
        this.roadBase(tile.x, tile.y, neighboringRoads, "black", Tile.SIZE / 2);
        this.roadBase(tile.x, tile.y, neighboringRoads, "grey", Tile.SIZE / 2.5);
    }
    private drawGate(tile: Tile, gate: Gate) {
        this.square((tile.x + 0.25) * Tile.SIZE, (tile.y + 0.25) * Tile.SIZE, Tile.SIZE / 2);
        this.square((tile.x + 0.3) * Tile.SIZE, (tile.y + 0.3) * Tile.SIZE, Tile.SIZE * 0.4, gate.color);
        if(gate instanceof TimedGate && gate.closed) {
            this.strokeStyle = TimedGate.DENY_COLOR;
            const width = Tile.SIZE * 0.05;
            this.line((tile.x + 0.3) * Tile.SIZE + width / 2, (tile.y + 0.3) * Tile.SIZE + width / 2, (tile.x + 0.7) * Tile.SIZE - width / 2, (tile.y + 0.7) * Tile.SIZE - width / 2, width);
            this.line((tile.x + 0.3) * Tile.SIZE + width / 2, (tile.y + 0.7) * Tile.SIZE - width / 2, (tile.x + 0.7) * Tile.SIZE - width / 2, (tile.y + 0.3) * Tile.SIZE + width / 2, width);
        }
    }
    private drawSpawner(tile: Tile, spawner: Spawner) {
        this.lineWidth = 2;
        this.circle((tile.x + 0.5) * Tile.SIZE, (tile.y + 0.5) * Tile.SIZE, Tile.SIZE / 4, spawner.color);
        const circleSizeIncrease = Tile.SIZE / 4 / Spawner.MAX_POWER;
        for(let i = 0; i < spawner.power; i++) {
            this.circle((tile.x + 0.5) * Tile.SIZE, (tile.y + 0.5) * Tile.SIZE, Tile.SIZE / 4 + i * circleSizeIncrease, "black", false);
        }
        this.text(Math.ceil(spawner.timer) + "s", (tile.x + 0.5) * Tile.SIZE, (tile.y + 0.5) * Tile.SIZE);
    }
    private drawDestination(tile: Tile, destination: Destination) {
        this.circle((tile.x + 0.5) * Tile.SIZE, (tile.y + 0.5) * Tile.SIZE, Tile.SIZE / 2);
        this.circle((tile.x + 0.5) * Tile.SIZE, (tile.y + 0.5) * Tile.SIZE, Tile.SIZE / 2.2, destination.color);
        this.text(Math.ceil(destination.health) + "s", (tile.x + 0.5) * Tile.SIZE, (tile.y + 0.5) * Tile.SIZE);
    }
    private drawCar(car: Car) {
        this.circle(car.x, car.y, Car.SIZE / 2, "black");
        this.circle(car.x, car.y, Car.SIZE / 2.5, car.color);
    }
};

//TODO: MouseDrawer?
