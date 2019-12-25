// Create a background image
class BackgroundImage extends PIXI.Sprite {
    constructor(imageSource, height, width, x, y) {
        super(PIXI.loader.resources[imageSource].texture);
        this.height = height;
        this.width = width;
        this.x = x;
        this.y = y;
        Object.seal(this);
    }
}

// Create the paddle
class Paddle extends PIXI.Sprite {
    constructor (x = 0, y = 0) {
        super(PIXI.loader.resources["images/breakout/49-breakout-tiles.png"].texture);        
        this.anchor.set(0.5, 0.5); // position, scaling, rotation etc are now from center of sprite
        this.scale.set(0.2);
        this.height /= 2;
        this.x = x;
        this.y = y;
        this.velocity = 0;
        this.powerupProperties = { 
            "type" : "none",
            "duration": 0,
            "time_left": 0
        }
    }
}

// Create the launch line (line that shows where a projectile will fire)
class LaunchLine extends PIXI.Graphics {
    constructor(startPoint = {x: 0, y: 0}, endPoint = {x: 0, y: 0}) {
        super();
        this.lineStyle( 1, 0xFFFFFF);
        this.moveTo(startPoint.x, startPoint.y);
        this.lineTo(endPoint.x, endPoint.y);
    }
}

// Create the margins
class Margin extends PIXI.Graphics {
    constructor(color = 0xFF0000, x = 0, y = 0, width = 0, height = 0) {
        super();
        this.beginFill(color);
        this.drawRect(x, y, width, height);
        this.endFill();
        this.x = x;
        this.y = y;
        // variables
        Object.seal(this);
    }
}

// Create the life icons
class LifeIcon extends PIXI.Sprite{
    constructor() {
        super(PIXI.loader.resources["images/breakout/60-breakout-tiles.png"].texture);        
        this.scale.set(0.1);
        this.x = 0;
        this.y = 0;
        //variables
        this.fwd = {x: 0, y: 0};
        this.speed = 0;
        this.isAlive = true;
        Object.seal(this);
    }
} 

// Create the blocks
class Block extends PIXI.Sprite {
    constructor(imageSource = "images/breakout/01-breakout-tiles.png", marginWidthSides, backgroundBorders, blocksInRow, objectProperties, color = 0xFF0000) {
        super(PIXI.loader.resources[imageSource].texture);
        this.objectProperties = objectProperties;
        this.width = ((sceneWidth - (2 * marginWidthSides) - (2 * backgroundBorders) - 1) / (blocksInRow)) - 2;
        this.height = 16;
        this.x = 0;
        this.y = 0;
        //variables
        this.fwd = {x: 0, y: 0};
        this.speed = 0;
        this.isAlive = true;
        Object.seal(this);
    }
}

// Create the powerups
class Powerup extends PIXI.Sprite {
    constructor(imageSource, objectProperties) {
        super(PIXI.loader.resources[imageSource].texture);
        this.objectProperties = objectProperties;
        this.scale.set(0.1);
        this.x = 0;
        this.y = 0;
        //variables
        this.fwd = {x: 0, y: 1};        
        this.speed = 50;
        this.isAlive = true;
        Object.seal(this);
    }

    move(dt = 1/60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}

// Create the projectiles
class Projectile extends PIXI.Sprite {
    constructor(color = 0xFFFFFF, x = 0, y = 0, direction = {x: 0, y: -1}) {
        super(PIXI.loader.resources["images/breakout/58-breakout-tiles.png"].texture);
        this.anchor.set(0.5, 0.5); // position, scaling, rotation etc are now from center of sprite
        this.scale.set(0.1);
        this.x = x;
        this.y = y;        
        // variables
        this.fwd = direction;
        this.speed = 150;
        this.isAlive = true;
        Object.seal(this);
    }

    move(dt = 1/60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }

    reflectX() {
        this.fwd.x *= -1;
    }

    reflectY() {
        this.fwd.y *= -1;
    }
}