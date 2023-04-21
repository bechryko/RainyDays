const GAME_ID = "gamejamgame";

const c = document.createElement("canvas");
document.body.appendChild(c);
c.height = window.innerHeight;
c.width = window.innerWidth;
const ctx = c.getContext("2d");
ctx.strokeStyle = "black";
ctx.textAlign = "center";
ctx.textBaseline = "middle";

const TILE_SIZE = 50;
ctx.font = TILE_SIZE / 2 + "px Serif";
const BASE_COLOR = "white";
const SPREAD_CHANCE = 0.42;
const MIN_SPREAD_RATIO = 0.6;
const MAX_SPREAD_RATIO = 0.7;
const SPREAD_COLORS = ["dodgerblue", "gold", "firebrick", "greenyellow", "chocolate"];
const CAR_SPEED = 1.5;
const SPAWN_TIMER = {
    CAR: 4,
    SPAWNER: 45,
    DESTINATION: 45
};
const BARRIER_TIMER = 2;
let DESTINATION_STARTING_HEALTH = 125;
const DESTINATION_BONUS_HEALTH = 5;
const DESTINATION_HEALING_PER_CAR = SPAWN_TIMER.CAR * 1.25;

const DELTA_TIME = 1/60;

const SELECT = {
    ROAD: -1,
    TUNNEL: 1,
    GATE1: 2,
    GATE2: 3,
    TIMED_BARRIER: 4
};
const ROAD = {
    NONE: 0,
    BASIC: 1,
    TUNNEL: 2
};
const BUILDING = {
    GATE: 1,
    TIMED_BARRIER: 2,
    SPAWNER: 3,
    DESTINATION: 4
};
const DIRECTION = {
    RIGHT: 0,
    UP: 1,
    LEFT: 2,
    DOWN: 3
};

const mid = {
    x: c.width / 2,
    y: c.height / 2
};
let y = mid.y - TILE_SIZE / 2;
let rows = 0;
for(; y > TILE_SIZE; y -= TILE_SIZE, rows++);
rows = rows * 2 + 1;
let x = mid.x - TILE_SIZE / 2;
let cols = 0;
for(; x > TILE_SIZE; x -= TILE_SIZE, cols++);
cols = cols * 2 + 1;
let area = {
    top: y,
    left: x,
    cols: cols,
    rows: rows
};

const storage = {
    save: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
    load: (key, value) => (key = localStorage.getItem(key)) === null ? value : JSON.parse(key)
};

function getTile({x, y}) {
    if(x < area.left || x > c.width - area.left || y < area.top || y > c.height - area.top) {
        return null;
    }
    return map[Math.floor((x - area.left) / TILE_SIZE)][Math.floor((y - area.top) / TILE_SIZE)];
}