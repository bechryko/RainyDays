import { EventEmitter } from "@angular/core";
import { BuildingWithTick, Destination, Spawner } from "./Building";
import { CanvasDrawer } from "./CanvasDrawer";
import { Car } from "./Car";
import { Controller, Selection } from "./Controller";
import { Colors, Tile } from "./Tile";
import { GameMessage } from "../pages/game/model";

export class Game {
    static readonly SPAWNER_MESSAGE_TIME = 10;
    static readonly DESTINATION_MESSAGE_TIME = 10;
    static readonly DESTINATION_CRITICAL_HEALTH = 15;

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
    
    constructor(public spreadChance: number, public spreadRatio: number[], canvas: HTMLCanvasElement, area: {rows: number, cols: number}, private eventEmitter: EventEmitter<GameMessage>) {
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
        this.selectTool(1);
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
            this.eventEmitter.emit({ type: "isGameGoing", data: false });
        }
    }
    private main(deltaTime: number): boolean {
        if(!this.paused) {
            deltaTime = Math.min(deltaTime, 0.1);
            this.timedActions(deltaTime);
            this.buildingActions(deltaTime);
            this.carActions(deltaTime);
        }
        // Mouse actions
        if(this.control.selectedTile && this.control.leftMouseDown) {
            this.control.leftMouseAction();
        } else if(this.control.selectedTile && this.control.rightMouseDown) {
            this.control.rightMouseAction(this.control.selectedTile, this.map);
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
        if(this.spawnerTimer < Game.SPAWNER_MESSAGE_TIME && this.spawnerTimer + deltaTime >= Game.SPAWNER_MESSAGE_TIME) {
            this.eventEmitter.emit({ type: "spawnerTimer", data: Game.SPAWNER_MESSAGE_TIME });
        }
        if((this.destinationTimer -= deltaTime) < 0) {
            this.destinationTimer = Destination.SPAWN_TIMER;
            Destination.spawnRandom(this.map);
        }
        if(this.destinationTimer < Game.DESTINATION_MESSAGE_TIME && this.destinationTimer + deltaTime >= Game.DESTINATION_MESSAGE_TIME) {
            this.eventEmitter.emit({ type: "destinationTimer", data: Game.DESTINATION_MESSAGE_TIME });
        }
    }
    private buildingActions(deltaTime: number) {
        for(const col of this.map) {
            for (const tile of col) {
                if(tile.building && ('tick' in tile.building)) {
                    (tile.building as BuildingWithTick).tick(deltaTime, tile);
                    if(tile.building instanceof Destination && tile.building.health < Game.DESTINATION_CRITICAL_HEALTH && tile.building.health + deltaTime >= Game.DESTINATION_CRITICAL_HEALTH) {
                        this.eventEmitter.emit({ type: "destinationHealth", data: Game.DESTINATION_CRITICAL_HEALTH });
                    }
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
                this.eventEmitter.emit({ type: "score", data: this.score });
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
                if(this.control.selected == Selection.editorTool && this.control.selectedTile && this.control.selectedTile.road) {
                    this.control.selected = Selection.roadConnect;
                    this.control.connectRoad = this.control.selectedTile;
                }
            } else {
                this.control.rightMouseDown = true;
            }
        }));
        this.eventListeners.push(new EventListener("mouseup", (e: MouseEvent) => {
            if(e.button === 0) {
                this.control.leftMouseDown = false;
                if(this.control.selected == Selection.roadConnect) {
                    this.endRoadConnection();
                }
            } else {
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
            if(e.code === "Space") {
                this.paused = !this.paused;
                this.eventEmitter.emit({ type: "isPaused", data: this.paused });
            } else if(+e.key >= 0 && +e.key <= 5) {
                this.selectTool(+e.key);
            }
        }));
    }
    selectTool(number: number) {
        if(this.control.selected == Selection.roadConnect) {
            this.endRoadConnection();
        }
        switch(number) {
            case 0:
                this.control.selected = Selection.editorTool;
                break;
            case 1:
                this.control.selected = Selection.road;
                break;
            case 2:
                this.control.selected = Selection.tunnel;
                break;
            case 3:
                this.control.selected = Selection.gate1;
                break;
            case 4:
                this.control.selected = Selection.gate2;
                break;
            case 5:
                this.control.selected = Selection.timedGate;
                break;
        }
        this.eventEmitter.emit({ type: "selected", data: number });
    }
    private endRoadConnection() {
        this.control.connectRoad = undefined;
        this.control.selected = Selection.editorTool;
    }
    private endOfGame() {
        for(const el of this.eventListeners) {
            el.destroy();
        }
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
