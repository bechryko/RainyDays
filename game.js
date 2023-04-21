let game = {
    spreads: 0,
    initializa() {
        let minSpreads = area.rows * area.cols * MIN_SPREAD_RATIO;
        while(this.spreads < minSpreads) {
            let rand = Math.floor(Math.random() * SPREAD_COLORS.length);
            map[Math.floor(Math.random() * area.cols)][Math.floor(Math.random() * area.rows)].spread(SPREAD_COLORS[rand]);
        }

        while(game.gameplay.gate1color == game.gameplay.gate2color) {
            game.gameplay.gate2color = SPREAD_COLORS[Math.floor(Math.random() * SPREAD_COLORS.length)];
        }

        window.alert("Controls: \n" +
        "1: road\n" +
        "2: tunnel\n" +
        "3: first gate (" + game.gameplay.gate1color +")\n" +
        "4: second gate (" + game.gameplay.gate2color + ")\n" +
        "5: timed barrier");

        this.int = window.setInterval(game.interval, DELTA_TIME * 1000);
    },
    int: null,
    interval() {
        for(let i = 0; i < 2; i++) {
            let timerName = ["spawner", "destination"][i] + "Timer";
            game.gameplay[timerName] -= DELTA_TIME;
            if(game.gameplay[timerName] < 0) {
                let complete = false;
                while(!complete) {
                    let targetTile = map[Math.floor(Math.random() * area.cols)][Math.floor(Math.random() * area.rows)];
                    if(!targetTile.building && targetTile.roadType == ROAD.NONE) {
                        targetTile.building = new Building(BUILDING[["SPAWNER", "DESTINATION"][i]], SPREAD_COLORS[Math.floor(Math.random() * SPREAD_COLORS.length)]);
                        complete = true;
                        game.gameplay[timerName] = SPAWN_TIMER[["SPAWNER", "DESTINATION"][i]];
                    }
                }
            }
        }

        for(const col of map) {
            for (const tile of col) {
                if(tile.building?.type == BUILDING.SPAWNER && tile.roadType != ROAD.NONE) {
                    tile.building.timer -= DELTA_TIME;
                    if(tile.building.timer < 0) {
                        tile.building.timer = SPAWN_TIMER.CAR;
                        new Car(tile, tile.building.color);
                    }
                } else if(tile.building?.type == BUILDING.TIMED_BARRIER) {
                    tile.building.timer -= DELTA_TIME;
                    if(tile.building.timer < 0) {
                        tile.building.timer = BARRIER_TIMER;
                        tile.building.status = !tile.building.status;
                    }
                } else if(tile.building?.type == BUILDING.DESTINATION) {
                    tile.building.health -= DELTA_TIME;
                    if(tile.building.health <= 0) {
                        if(game.gameplay.score > game.gameplay.highscore) {
                            storage.save(GAME_ID + "_highscore", (game.gameplay.highscore = game.gameplay.score));
                            window.setTimeout(() => window.alert("Game over!\nScore: " + game.gameplay.score + "\nNew highscore!"), 100);
                        } else {
                            window.setTimeout(() => window.alert("Game over!\nScore: " + game.gameplay.score + "\nHighscore: " + game.gameplay.highscore), 100);
                        }
                        window.clearInterval(game.int);
                    }
                }
            }
        }
        for(let i = 0; i < Car.list.length; i++) {
            Car.list[i].move();
            let currentBuilding = getTile(Car.list[i]).building;
            if(currentBuilding?.type == BUILDING.DESTINATION && currentBuilding.color == Car.list[i].color) {
                Car.list.splice(i, 1);
                currentBuilding.health += DESTINATION_HEALING_PER_CAR;
                game.gameplay.score++;
            }
        }
        for(let i = 0; i < Car.list.length; i++) {
            for(let j = 0; j < Car.list.length; j++) {
                if(i == j) {
                    continue;
                }
                let car1 = Car.list[i];
                let car2 = Car.list[j];
                if((car1.x - car2.x) ** 2 + (car1.y - car2.y) ** 2 <= (TILE_SIZE / 4) ** 2) {
                    Car.list.splice(j, 1);
                    Car.list.splice(i, 1);
                    break;
                }
            }
        }

        let selectedTile = getTile(game.control);
        if(selectedTile && game.control.down) {
            switch(game.control.selected) {
                case SELECT.ROAD:
                    if(selectedTile.roadType == ROAD.NONE) {
                        selectedTile.roadType = ROAD.BASIC;
                    }
                    break;
                case SELECT.TUNNEL:
                    if(selectedTile.roadType == ROAD.NONE) {
                        selectedTile.roadType = ROAD.TUNNEL;
                    }
                    break;
                case SELECT.GATE1:
                    if(!selectedTile.building) {
                        selectedTile.building = new Building(BUILDING.GATE, game.gameplay.gate1color);
                    }
                    break;
                case SELECT.GATE2:
                    if(!selectedTile.building) {
                        selectedTile.building = new Building(BUILDING.GATE, game.gameplay.gate2color);
                    }
                    break;
                case SELECT.TIMED_BARRIER:
                    if(!selectedTile.building) {
                        selectedTile.building = new Building(BUILDING.TIMED_BARRIER, "dimgrey");
                    }
                    break;
            }
        }
        drawAll();
    },
    control: {
        x: mid.x,
        y: mid.y,
        down: false,
        selected: SELECT.ROAD
    },
    gameplay: {
        gate1color: SPREAD_COLORS[Math.floor(Math.random() * SPREAD_COLORS.length)],
        gate2color: SPREAD_COLORS[Math.floor(Math.random() * SPREAD_COLORS.length)],
        spawnerTimer: 0,
        destinationTimer: 0,
        score: 0,
        highscore: storage.load(GAME_ID + "_highscore", 0)
    }
};

function drawAll() {
    drawer.map();

    for(let x = 0; x < area.cols; x++) {
        for(let y = 0; y < area.rows; y++) {
            let tile = map[x][y];
            switch(tile.roadType) {
                case ROAD.BASIC:
                    drawer.road(x, y);
                    break;
                case ROAD.TUNNEL:
                    drawer.tunnel(x, y);
                    break;
            }
            switch(tile.building?.type) {
                case BUILDING.GATE:
                    drawer.gate(x, y, tile.building.color);
                    break;
                case BUILDING.SPAWNER:
                    drawer.spawner(x, y, tile.building.color, tile.building.timer);
                    break;
                case BUILDING.DESTINATION:
                    drawer.destination(x, y, tile.building.color, tile.building.health);
                    break;
                case BUILDING.TIMED_BARRIER:
                    if(tile.building.status) {
                        drawer.gate(x, y, tile.building.color);
                    } else {
                        drawer.gate(x, y, "white");
                    }
                    break;
            }
        }
    }
    for(const car of Car.list) {
        drawer.car(car);
    }
}

document.addEventListener("mousedown", e => {
    if(e.button == 0) {
        game.control.down = true;
    } else {
        e.preventDefault();
        let selectedTile = getTile({x: e.offsetX, y: e.offsetY});
        if(!selectedTile) {
            return;
        }
        if(selectedTile.building?.type == BUILDING.GATE || selectedTile.building?.type == BUILDING.TIMED_BARRIER) {
            selectedTile.building = null;
        } else if(selectedTile.roadType != ROAD.NONE) {
            selectedTile.roadType = ROAD.NONE;
        }
    }
});
document.addEventListener("mouseup", e => {
    if(e.button == 0) {
        game.control.down = false;
    }
});
document.addEventListener("mousemove", e => {
    game.control.x = e.offsetX;
    game.control.y = e.offsetY;
});
document.addEventListener("keydown", e => {
    switch(e.code) {
        case "Digit1":
            game.control.selected = SELECT.ROAD;
            break;
        case "Digit2":
            game.control.selected = SELECT.TUNNEL;
            break;
        case "Digit3":
            game.control.selected = SELECT.GATE1;
            break;
        case "Digit4":
            game.control.selected = SELECT.GATE2;
            break;
        case "Digit5":
            game.control.selected = SELECT.TIMED_BARRIER;
            break;
    }
});
document.addEventListener("contextmenu", e => {
    e.preventDefault();
}, false);

game.initializa();