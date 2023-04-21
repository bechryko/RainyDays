let basicDrawer = {
    setStyle(color = "black", isStroke = false) {
        let style = (isStroke ? "stroke" : "fill") + "Style";
        if(ctx[style] != color) {
            ctx[style] = color;
        }
    },
    setLine(width = 1, cap = "square") {
        if(ctx.lineWidth != width) {
            ctx.lineWidth = width;
        }
        if(ctx.lineCap != cap) {
            ctx.lineCap = cap;
        }
    },
    square(x, y, a, color = "black", fill = true) {
        this.setStyle(color);
        ctx.beginPath();
        ctx.rect(x, y, a, a);
        ctx[fill ? "fill" : "stroke"]();
    },
    circle(x, y, r, color = "black", fill = "true") {
        this.setStyle(color);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx[fill ? "fill" : "stroke"]();
    },
    text(text, x, y, color = "black") {
        this.setStyle(color);
        ctx.fillText(text, x, y);
    },
    roadBase(x, y, color = "black", size = TILE_SIZE / 2) {
        basicDrawer.setStyle(color, true);
        basicDrawer.setLine(size, "round");
        ctx.beginPath();
        ctx.moveTo(area.left + (x + 0.5) * TILE_SIZE, area.top + (y + 0.5) * TILE_SIZE);
        if(map[x+1] && map[x+1][y] && map[x+1][y].roadType != ROAD.NONE) {
            ctx.lineTo(area.left + (x + 1.5) * TILE_SIZE, area.top + (y + 0.5) * TILE_SIZE);
            ctx.moveTo(area.left + (x + 0.5) * TILE_SIZE, area.top + (y + 0.5) * TILE_SIZE);
        } 
        ctx.lineTo(area.left + (x + 0.5) * TILE_SIZE, area.top + (y + 0.5) * TILE_SIZE);
        if(map[x][y+1] && map[x][y+1].roadType != ROAD.NONE) {
            ctx.lineTo(area.left + (x + 0.5) * TILE_SIZE, area.top + (y + 1.5) * TILE_SIZE);
        }
        ctx.stroke();
    }
};

let drawer = {
    map() {
        ctx.clearRect(0, 0, c.width, c.height);

        for(const col of map) {
            for(const t of col) {
                if(t.color == "white") {
                    continue;
                }
                basicDrawer.square(area.left + t.x * TILE_SIZE, area.top + t.y * TILE_SIZE, TILE_SIZE, t.color);
            }
        }
        //grid
        basicDrawer.setLine();
        basicDrawer.setStyle("grey", true);
        ctx.beginPath();
        for(let x = area.left; x < c.width; x += TILE_SIZE) {
            ctx.moveTo(x, area.top);
            ctx.lineTo(x, c.height - area.top);
        }
        for(let y = area.top; y < c.height; y += TILE_SIZE) {
            ctx.moveTo(area.left, y);
            ctx.lineTo(c.width - area.left, y);
        }
        ctx.stroke();
    },
    road(x, y) {
        basicDrawer.roadBase(x, y);
    },
    tunnel(x, y) {
        basicDrawer.roadBase(x, y, "black", TILE_SIZE / 2);
        basicDrawer.roadBase(x, y, "grey", TILE_SIZE / 2.5);
    },
    gate(x, y, color) {
        basicDrawer.square(area.left + (x + 0.25) * TILE_SIZE, area.top + (y + 0.25) * TILE_SIZE, TILE_SIZE / 2);
        basicDrawer.square(area.left + (x + 0.3) * TILE_SIZE, area.top + (y + 0.3) * TILE_SIZE, TILE_SIZE * 0.4, color);
    },
    spawner(x, y, color, time) {
        basicDrawer.circle(area.left + (x + 0.5) * TILE_SIZE, area.top + (y + 0.5) * TILE_SIZE, TILE_SIZE / 4);
        basicDrawer.circle(area.left + (x + 0.5) * TILE_SIZE, area.top + (y + 0.5) * TILE_SIZE, TILE_SIZE / 4.4, color);
        basicDrawer.text(Math.ceil(time), area.left + (x + 0.5) * TILE_SIZE, area.top + (y + 1) * TILE_SIZE);
    },
    destination(x, y, color, health) {
        basicDrawer.circle(area.left + (x + 0.5) * TILE_SIZE, area.top + (y + 0.5) * TILE_SIZE, TILE_SIZE / 2);
        basicDrawer.circle(area.left + (x + 0.5) * TILE_SIZE, area.top + (y + 0.5) * TILE_SIZE, TILE_SIZE / 2.2, color);
        basicDrawer.text(Math.ceil(health), area.left + (x + 0.5) * TILE_SIZE, area.top + (y + 0.5) * TILE_SIZE);
    },
    car(c) {
        basicDrawer.circle(c.x, c.y, TILE_SIZE / 8);
        basicDrawer.circle(c.x, c.y, TILE_SIZE / 10, c.color);
    }
};

let mouseDrawer = {};