import { Random } from "./Random";
import { Tile } from "./Tile";

export enum Direction {
    right, up, left, down, none
}

export class Car {
    static pool: Car[] = [];
    static readonly SPEED = 1;
    static readonly SIZE = 12.5;

    x: number;
    y: number;
    private destination = { tileX: 0, tileY: 0 };
    private lastDirection = Direction.up;

    constructor(spawnTile: Tile, public color: string) {
        this.x = (spawnTile.x + 0.5) * Tile.SIZE;
        this.y = (spawnTile.y + 0.5) * Tile.SIZE;
        this.destination.tileX = spawnTile.x;
        this.destination.tileY = spawnTile.y;
        spawnTile.tileAction(this);
        Car.pool.push(this);
    }

    move(deltaTime: number, map: Tile[][], random: Random): void {
        const dest = {
            x: (this.destination.tileX + 0.5) * Tile.SIZE,
            y: (this.destination.tileY + 0.5) * Tile.SIZE
        };
        const distance = Math.abs(this.x - dest.x) + Math.abs(this.y - dest.y);
        const moved = Car.SPEED * Tile.SIZE * deltaTime;
        switch(this.lastDirection) {
            case Direction.up:
                this.y -= moved;
                break;
            case Direction.right:
                this.x += moved;
                break;
            case Direction.down:
                this.y += moved;
                break;
            case Direction.left:
                this.x -= moved;
                break;
        }
        if(Math.abs(this.x - dest.x) + Math.abs(this.y - dest.y) >= distance) {
            this.x = dest.x;
            this.y = dest.y;
            this.searchNewDestination(map, random);
        }
        this.getTile(map).tileAction(this);
    }

    searchNewDestination(map: Tile[][], random: Random): void {
        const possibleDirections = [];
        let direction = Direction.right;
        for(let d = 0; d < 4; d++, direction = (direction + 1) % 4) {
            const targetX = this.destination.tileX + [1, 0, -1, 0][direction];
            const targetY = this.destination.tileY + [0, -1, 0, 1][direction];
            const targetTile = map[targetX]?.[targetY];
            if(targetTile && targetTile.isUnlocked(this, map)) {
                possibleDirections.push(direction);
            }
        }
        if(possibleDirections.length == 0) {
            this.lastDirection = Direction.none;
            return;
        } else if(possibleDirections.length != 1 && possibleDirections.includes((this.lastDirection + 2) % 4)) {
            possibleDirections.splice(possibleDirections.indexOf((this.lastDirection + 2) % 4), 1);
        }
        this.lastDirection = random.nextArrayElement(possibleDirections);
        switch(this.lastDirection) {
            case Direction.up:
                this.destination.tileY--;
                break;
            case Direction.right:
                this.destination.tileX++;
                break;
            case Direction.down:
                this.destination.tileY++;
                break;
            case Direction.left:
                this.destination.tileX--;
                break;
        }
    }

    getTile(map: Tile[][]): Tile {
        const tile = map[Math.floor(this.x / Tile.SIZE)]?.[Math.floor(this.y / Tile.SIZE)];
        if(!tile) {
            console.log(`${this.x} -> ${Math.floor(this.x / Tile.SIZE)}`, `${this.y} -> ${Math.floor(this.y / Tile.SIZE)}`);
        }
        return map[Math.floor(this.x / Tile.SIZE)][Math.floor(this.y / Tile.SIZE)];
    }

    static checkCollision(car1: Car, car2: Car): void {
        if((car1.x - car2.x) ** 2 + (car1.y - car2.y) ** 2 <= (Car.SIZE) ** 2) {
            Car.pool.splice(Car.pool.indexOf(car1), 1);
            Car.pool.splice(Car.pool.indexOf(car2), 1);
        }
    }
}
