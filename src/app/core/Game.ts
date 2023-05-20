import { BuildingWithTick, Destination, Spawner } from "./Building";
import { CanvasDrawer } from "./CanvasDrawer";
import { Car } from "./Car";
import { Controller, Selection } from "./Controller";
import { Colors, Tile } from "./Tile";

export class Game {
    control = new Controller();
    private spawnerTimer = 0;
    private destinationTimer = 0;
    private score = 0;
    paused = false;

    spreads = 0;
    map: Tile[][] = [];
    area: {
        rows: number,
        cols: number
    };

    private eventListeners: EventListener[] = [];
    private canvasDrawer;
    
    constructor(public spreadChance: number, public spreadRatio: number[], canvas: HTMLCanvasElement, area: {rows: number, cols: number}) {
        this.area = area;
        for(let x = 0; x < area.cols; x++) {
            this.map[x] = [];
            for(let y = 0; y < area.rows; y++) {
                this.map[x][y] = new Tile(x, y);
            }
        }
        const minSpreads = this.area.rows * this.area.cols * spreadRatio[0];
        while(this.spreads < minSpreads) {
            this.map[Math.floor(Math.random() * this.area.cols)][Math.floor(Math.random() * this.area.rows)].spread(Colors.randomColor(), this);
        }
        canvas.width = area.cols * Tile.SIZE;
        canvas.height = area.rows * Tile.SIZE;
        this.canvasDrawer = new CanvasDrawer(canvas);
    }
    startGame() {
        this.initEventListeners();
        this.gameInterval(Date.now());
    }
    private gameInterval(time: number) {
        const currentTime = Date.now();
        const deltaTime = currentTime - time;
        if(this.main(deltaTime / 1000)) {
            requestAnimationFrame(() => this.gameInterval(currentTime));
        } else {
            this.endOfGame();
        }
    }
    private main(deltaTime: number): boolean {
        if(!this.paused) {
            this.timedActions(deltaTime);
            this.buildingActions(deltaTime);
            this.carActions(deltaTime);
        }
        // Mouse actions
        if(this.control.selectedTile && this.control.leftMouseDown) {
            this.control.leftMouseAction();
        } else if(this.control.selectedTile && this.control.rightMouseDown) {
            this.control.rightMouseAction(this.control.selectedTile);
        }
        // Draw
        this.canvasDrawer.drawAll(this.map);
        return !Destination.anyWithZeroHealth();
    }
    private timedActions(deltaTime: number) {
        if((this.spawnerTimer -= deltaTime) < 0) {
            this.spawnerTimer = Spawner.SPAWN_TIMER;
            Spawner.spawnRandom(this.map);
        }
        if((this.destinationTimer -= deltaTime) < 0) {
            this.destinationTimer = Destination.SPAWN_TIMER;
            Destination.spawnRandom(this.map);
        }
    }
    private buildingActions(deltaTime: number) {
        for(const col of this.map) {
            for (const tile of col) {
                if(tile.building && ('tick' in tile.building)) {
                    (tile.building as BuildingWithTick).tick(deltaTime, tile);
                }
            }
        }
    }
    private carActions(deltaTime: number) {
        for(let i = 0; i < Car.pool.length; i++) {
            const car = Car.pool[i];
            car.move(deltaTime, this.map);
            const currentBuilding = car.getTile(this.map).building;
            if(currentBuilding instanceof Destination && currentBuilding.color == car.color) {
                Car.pool.splice(i, 1); //TODO: object pool
                currentBuilding.health += Destination.HEALING_PER_CAR;
                this.score++;
            }
        }
        for (const car1 of Car.pool) {
            for (const car2 of Car.pool) {
                if(car1 == car2) {
                    continue;
                }
                Car.checkCollision(car1, car2);
            }
        }
    }
    private initEventListeners() {
        this.eventListeners.push(new EventListener("mousedown", (e: MouseEvent) => {
            if(e.button === 0) {
                this.control.leftMouseDown = true;
            } else {
                //e.preventDefault();
                this.control.rightMouseDown = true;
            }
        }));
        this.eventListeners.push(new EventListener("mouseup", (e: MouseEvent) => {
            if(e.button === 0) {
                this.control.leftMouseDown = false;
            } else {
                this.control.deleteType = null;
                this.control.rightMouseDown = false;
            }
        }));
        this.eventListeners.push(new EventListener("mousemove", (e: MouseEvent) => {
            //TODO: draw from outside the canvas
            const x = Math.floor(e.offsetX / Tile.SIZE);
            const y = Math.floor(e.offsetY / Tile.SIZE);
            if(x < 0 || x >= this.area.cols || y < 0 || y >= this.area.rows) {
                this.control.selectedTile = undefined;
                return;
            }
            this.control.selectedTile = this.map[x][y];
        }));
        this.eventListeners.push(new EventListener("keydown", (e: KeyboardEvent) => {
            switch(e.code) {
                case "Digit1":
                    this.control.selected = Selection.road;
                    break;
                case "Digit2":
                    this.control.selected = Selection.tunnel;
                    break;
                case "Digit3":
                    this.control.selected = Selection.gate1;
                    break;
                case "Digit4":
                    this.control.selected = Selection.gate2;
                    break;
                case "Digit5":
                    this.control.selected = Selection.timedGate;
                    break;
                case "Space":
                    this.paused = !this.paused;
                    break;
            }
        }));
    }
    private endOfGame() {
        for(const el of this.eventListeners) {
            el.destroy();
        }
        window.alert("Game over! Score: " + this.score);
    }
    getScore() {
        return this.score;
    }
}

class EventListener {
    constructor(private action: string, private callback: Function) {
        document.addEventListener(action as keyof DocumentEventMap, callback as any);
    }
    destroy() {
        document.removeEventListener(this.action as keyof DocumentEventMap, this.callback as any);
    }
}
