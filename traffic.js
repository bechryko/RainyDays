class Tile {
    color = BASE_COLOR;
    roadType = ROAD.NONE;
    building = null;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    spread(color, map) {
        if(this.color == color) {
            return;
        }
        if(this.color == BASE_COLOR) {
            game.spreads++;
        }
        this.color = color;
        for(let i = 0; i < 4; i++) {
            if(Math.random() < SPREAD_CHANCE && game.spreads < area.rows * area.cols * MAX_SPREAD_RATIO) {
                let x = this.x + [1, 0, -1, 0][i];
                let y = this.y + [0, 1, 0, -1][i];
                if(x < 0 || x >= area.cols || y < 0 || y >= area.rows) {
                    continue;
                }
                map[x][y].spread(color);
            }
        }
    }
}

class Car {
    static list = [];
    x;
    y;
    destination = {x: 0, y: 0};
    lastDirection = DIRECTION.UP;
    constructor(spawnTile, color) {
        this.color = color;
        this.x = area.left + (spawnTile.x + 0.5) * TILE_SIZE;
        this.y = area.top + (spawnTile.y + 0.5) * TILE_SIZE;
        this.destination.x = spawnTile.x;
        this.destination.y = spawnTile.y;
        this.searchNewDestination();
        Car.list.push(this);
    }
    move() {
        let carThis = this;
        let dest = {
            x: area.left + (carThis.destination.x + 0.5) * TILE_SIZE,
            y: area.top + (carThis.destination.y + 0.5) * TILE_SIZE
        };
        let distance = Math.abs(this.x - dest.x) + Math.abs(this.y - dest.y);
        switch(this.lastDirection) {
            case DIRECTION.UP:
                this.y -= CAR_SPEED;
                break;
            case DIRECTION.RIGHT:
                this.x += CAR_SPEED;
                break;
            case DIRECTION.DOWN:
                this.y += CAR_SPEED;
                break;
            case DIRECTION.LEFT:
                this.x -= CAR_SPEED;
                break;
        }
        if(Math.abs(this.x - dest.x) + Math.abs(this.y - dest.y) >= distance) {
            this.x = dest.x;
            this.y = dest.y;
            this.searchNewDestination();
        }
        let currentTile = getTile(this);
        if(currentTile.color != BASE_COLOR && currentTile.roadType != ROAD.TUNNEL) {
            this.color = currentTile.color;
        }
    }
    searchNewDestination() {
        let direction = (this.lastDirection + 3) % 4;
        for(let d = 0; d < 3; d++, direction = (direction + 1) % 4) {
            let targetX = this.destination.x + [1, 0, -1, 0][direction];
            let targetY = this.destination.y + [0, -1, 0, 1][direction];
            let targetTile;
            if(map[targetX] && (targetTile = map[targetX][targetY]) && targetTile.roadType != ROAD.NONE
                && !(targetTile.building?.type == BUILDING.GATE && targetTile.building.color == this.color)
                && !(targetTile.building?.type == BUILDING.TIMED_BARRIER && targetTile.building.status)) {
                break;
            }
        }
        this.lastDirection = direction;
        switch(this.lastDirection) {
            case DIRECTION.UP:
                this.destination.y--;
                break;
            case DIRECTION.RIGHT:
                this.destination.x++;
                break;
            case DIRECTION.DOWN:
                this.destination.y++;
                break;
            case DIRECTION.LEFT:
                this.destination.x--;
                break;
        }
    }
}

class Building {
    score = 0;
    constructor(type, color) {
        this.type = type;
        this.color = color;
        switch(this.type) {
            case BUILDING.SPAWNER:
                this.timer = 0;
                break;
            case BUILDING.TIMED_BARRIER:
                this.timer = BARRIER_TIMER;
                this.status = true;
                break;
            case BUILDING.DESTINATION:
                this.health = (DESTINATION_STARTING_HEALTH += DESTINATION_BONUS_HEALTH) - DESTINATION_BONUS_HEALTH;
        }
    }
}

let map = [];
for(let i = 0; i < area.cols; i++) {
    let col = [];
    for(let j = 0; j < area.rows; j++) {
        col.push(new Tile(i, j));
    }
    map.push(col);
}