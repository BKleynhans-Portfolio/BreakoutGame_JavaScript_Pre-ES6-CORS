// Breakout spritesheet courtesy of http://www.imaginelabs.rocks/?product=breakout-brick-breaker-game-tile-set-free


// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application();
app.renderer.resize(800, 600);
app.renderer.view.style.position = 'absolute';
app.renderer.view.style.left = ((window.innerWidth - app.renderer.width) >> 1) + 'px';
app.renderer.view.style.top = ((window.innerHeight - app.renderer.height) >> 1) + 'px';
//app.renderer.backgroundColor = 0xFF00FF;
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;
const marginWidthSides = sceneWidth * 0.1;
const marginHeightTopBottom = sceneHeight * 0.1;

// pre-load the images
PIXI.loader.
add([
    "images/explosions.png",
    "images/breakout/01-breakout-tiles.png", "images/breakout/02-breakout-tiles.png", "images/breakout/03-breakout-tiles.png",
    "images/breakout/04-breakout-tiles.png", "images/breakout/05-breakout-tiles.png", "images/breakout/06-breakout-tiles.png",
    "images/breakout/07-breakout-tiles.png", "images/breakout/08-breakout-tiles.png", "images/breakout/09-breakout-tiles.png",
    "images/breakout/10-breakout-tiles.png", "images/breakout/11-breakout-tiles.png", "images/breakout/12-breakout-tiles.png",
    "images/breakout/13-breakout-tiles.png", "images/breakout/14-breakout-tiles.png", "images/breakout/15-breakout-tiles.png",
    "images/breakout/16-breakout-tiles.png", "images/breakout/17-breakout-tiles.png", "images/breakout/18-breakout-tiles.png",
    "images/breakout/19-breakout-tiles.png", "images/breakout/20-breakout-tiles.png", "images/breakout/21-breakout-tiles.png",
    "images/breakout/22-breakout-tiles.png", "images/breakout/23-breakout-tiles.png", "images/breakout/24-breakout-tiles.png",
    "images/breakout/25-breakout-tiles.png", "images/breakout/26-breakout-tiles.png", "images/breakout/27-breakout-tiles.png",
    "images/breakout/28-breakout-tiles.png", "images/breakout/29-breakout-tiles.png", "images/breakout/30-breakout-tiles.png",
    "images/breakout/31-breakout-tiles.png", "images/breakout/32-breakout-tiles.png", "images/breakout/33-breakout-tiles.png",
    "images/breakout/34-breakout-tiles.png", "images/breakout/35-breakout-tiles.png", "images/breakout/36-breakout-tiles.png",
    "images/breakout/37-breakout-tiles.png", "images/breakout/38-breakout-tiles.png", "images/breakout/39-breakout-tiles.png",
    "images/breakout/40-breakout-tiles.png", "images/breakout/41-breakout-tiles.png", "images/breakout/42-breakout-tiles.png",
    "images/breakout/43-breakout-tiles.png", "images/breakout/44-breakout-tiles.png", "images/breakout/45-breakout-tiles.png",
    "images/breakout/46-breakout-tiles.png", "images/breakout/47-breakout-tiles.png", "images/breakout/48-breakout-tiles.png",
    "images/breakout/49-breakout-tiles.png", "images/breakout/50-breakout-tiles.png", "images/breakout/51-breakout-tiles.png",
    "images/breakout/52-breakout-tiles.png", "images/breakout/53-breakout-tiles.png", "images/breakout/54-breakout-tiles.png",
    "images/breakout/55-breakout-tiles.png", "images/breakout/56-breakout-tiles.png", "images/breakout/57-breakout-tiles.png",
    "images/breakout/58-breakout-tiles.png", "images/breakout/59-breakout-tiles.png", "images/breakout/60-breakout-tiles.png",
    "images/breakout/61-breakout-tiles.png", "images/breakout/background.png", "images/breakout/bottom_border.png"
]).on("progress", e => {    
    console.log(`progress=${e.progress}`)}).
load(setup);

// aliases
let stage;

// game variables
let startScene;
let gameScene, paddle, scoreLabel, lifeLabel, eventLabel;
let fireballSound, metalHitSound, brickCrackSound, brickBreakSound, growSound, shrinkSound;
let paddleBounceSound, speedUpSound, slowDownSound, gainLifeSound, levelCompleteSound;
let powerUpTimerSound, scoreCollectSound, looseGameSound;
let marginTop = [], marginRight = [], marginBottom = [], marginLeft = [], launchLine = [];
let gameOverScene, gameOverScoreLabel, backgroundImg, bottomBorder;

//let circles = [];
let blocks = [];
let textureProperties = [];
let projectiles = []; // {projectile: 0, current: {x: 0, y: 0}, previous: {x: 0, y: 0}}
let powerups = [];
let aliens = [];
let explosions = [];
let explosionTextures;
let score = 0;
let life = 0;
let lifeIcons = [];
let levelNum = 1;
let paused = true;
let levels = [];
let tileSpriteProperties = [];
let paddlePosition = {current: {x: 0, y: 0}, previous: {x: 0, y: 0}};
let offScreenReflection = false;
let superBall = false;
let backgroundBorderEdgeWidth = 28;
let superUser = false;
let timerPlayed = false;

function setup() {
    // start loading the level file into memory
    loadLevels(function(response) {        
        levels = JSON.parse(response);
    });
    
    // start loading the spritesheet for tiles into memory
    loadSpriteJSON(function(response) {
        tileSpriteProperties = JSON.parse(response);
    });

	stage = app.stage;
    // Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    // Add the background
    backgroundImg = new BackgroundImage(
        "images/breakout/background.png",
        sceneHeight - marginHeightTopBottom,                    // height
        sceneWidth - (marginWidthSides * 2),                    // width
        marginWidthSides,                                       // x
        marginHeightTopBottom                                   // y
    );
    backgroundImg.visible = false;
    stage.addChild(backgroundImg);
    
    // Add the bottom border used for green powerup
    bottomBorder = new BackgroundImage(
        "images/breakout/bottom_border.png",
        backgroundBorderEdgeWidth - 5,                          // height
        sceneWidth - (marginWidthSides * 2),                    // width
        marginWidthSides,                                       // x
        sceneHeight - backgroundBorderEdgeWidth + 5             // y
    );
    bottomBorder.visible = false;
    stage.addChild(bottomBorder);
	
    // Create the main `game` scene and make it invisible    
    gameScene = new PIXI.Container();    
    gameScene.visible = false;    
    stage.addChild(gameScene);

    // Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    // Create labels for all 3 scenes
    createLabelsAndButtons();
    
    // Create paddle
    paddle = new Paddle();
    paddle.zIndex = 1;
    gameScene.addChild(paddle);
	
	// Load Sounds
	fireballSound = new Howl({
        src: ['sounds/fireball.mp3']
    });

    metalHitSound = new Howl({
        src: ['sounds/metal_hit.mp3']
    });

    brickCrackSound = new Howl({
        src: ['sounds/brick_crack.mp3']
    });

    brickBreakSound = new Howl({
        src: ['sounds/brick_breaking.mp3']
    });

    growSound = new Howl({
        src: ['sounds/grow_sound.mp3']
    });

    shrinkSound = new Howl({
        src: ['sounds/shrink_sound.mp3']
    })

    paddleBounceSound = new Howl({
        src: ['sounds/paddle_bounce.mp3']
    });

    speedUpSound = new Howl({
        src: ['sounds/speed_up.mp3']
    });

    slowDownSound = new Howl({
        src: ['sounds/slow_down.mp3']
    });
    
    gainLifeSound = new Howl({
        src: ['sounds/gain_life.mp3']
    });
    
    levelCompleteSound = new Howl({
        src: ['sounds/level_completed.mp3']
    });
    
    powerUpTimerSound = new Howl({
        src: ['sounds/powerup_timer.mp3']
    });

    scoreCollectSound = new Howl({
        src: ['sounds/score_collect.mp3']
    });

    looseGameSound = new Howl({
        src: ['sounds/loose_game.mp3']
    });

	// Load explosion sprite sheet
    explosionTextures = loadSpriteSheet();
    
    // Start update loop
	app.ticker.add(gameLoop);
}

// Create labels and buttons
function createLabelsAndButtons() {
    let buttonStyle = new PIXI.TextStyle ({
        fill: 0xFF4B4B,
        fontSize: 48,
        fontFamily: "Press Start 2P"
    });

    // Set up `startScene`
    // Make the top start label
    let startLabel1 = new PIXI.Text("Roof Breaker!");
    startLabel1.style = new PIXI.TextStyle ({
        fill: 0xFFFFFF,
        fontSize: 48,
        fontFamily: 'Press Start 2P',
        stroke: 0x808080,
        strokeThickness: 6
    });
    startLabel1.x = 100;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);

    // Make the middle start label
    let startLabel2 = new PIXI.Text("Because who doesn't want to\n    bring down the roof?");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 24,
        fontFamily: "Press Start 2P",
        fontStyle: "italic",
        stroke: 0xBC7676,
        strokeThickness: 6
    });
    startLabel2.x = 75;
    startLabel2.y = 300;
    startScene.addChild(startLabel2);

    // Make the start game button
    let startButton = new PIXI.Text("Start");
    startButton.style = buttonStyle;
    startButton.fontSize = 16;
    startButton.x = 280;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame); // startGame is a function reference
    startButton.on('pointerover', e => e.target.alpha = 0.7); // concise arrow function with no brackets
    startButton.on('pointerout', e => e.currentTarget.alpha = 1.0); // ditto
    startScene.addChild(startButton);    

    // Set up `gameScene`
    let textStyle = new PIXI.TextStyle ({
        fill: 0xFFFFFF,
        fontSize: 16,
        fontFamily: "Press Start 2P",
        stroke: 0x808080,        
        strokeThickness: 4
    });

    // Set up margins
    let marginTop = new Margin(
        0x000000, 
        0, 
        0, 
        sceneWidth, 
        marginHeightTopBottom
    );
    
    let marginLeft = new Margin(
        0x000000, 
        0, 
        pixelsToUnits(marginHeightTopBottom), 
        marginWidthSides, 
        sceneHeight - marginHeightTopBottom
    );

    let marginRight = new Margin(
        0x000000, 
        pixelsToUnits(sceneWidth - marginWidthSides), 
        pixelsToUnits(marginHeightTopBottom), 
        marginWidthSides, 
        sceneHeight - marginHeightTopBottom
    );

    gameScene.addChild(marginTop);
    gameScene.addChild(marginLeft);
    gameScene.addChild(marginRight);

    // Make score label
    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = 5;
    scoreLabel.y = 5;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

    // Make life label
    lifeLabel = new PIXI.Text();
    lifeLabel.style = textStyle;
    lifeLabel.x = 5;
    lifeLabel.y = 26;
    gameScene.addChild(lifeLabel);
    decreaseLife();

    // Make events label
    eventLabel = new PIXI.Text();
    eventLabel.style = textStyle;
    eventLabel.x = 450;
    eventLabel.y = 5;
    gameScene.addChild(eventLabel);

    // Set up `gameOverScene`
    // Make game over text
    let gameOverText = new PIXI.Text("Game Over");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 60,
        fontFamily: "Press Start 2P",
        stroke: 0x808080,
        strokeThickness: 6
    });
    gameOverText.style = textStyle;    
    gameOverText.x = 130;
    gameOverText.y = 140;
    gameOverText.visible = false;
    gameOverScene.addChild(gameOverText);

    // Make game end text if you won the game
    let endGameText = new PIXI.Text("!You Won!");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 60,
        fontFamily: "Press Start 2P",
        stroke: 0x808080,
        strokeThickness: 6
    });
    endGameText.style = textStyle;    
    endGameText.x = 130;
    endGameText.y = 140;
    endGameText.visible = false;
    gameOverScene.addChild(endGameText);

    // Make game over score label
    gameOverScoreLabel = new PIXI.Text();
    let gameOverTextStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 24,
        fontFamily: "Press Start 2P",
        stroke: 0xBC7676,
        strokeThickness: 6
    });
    gameOverScoreLabel.style = gameOverTextStyle;
    gameOverScoreLabel.x = 180;
    gameOverScoreLabel.y = 250;
    gameOverScene.addChild(gameOverScoreLabel);

    // Make "play again?" button
    let playAgainButton = new PIXI.Text("Play Again?");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 150;
    playAgainButton.y = sceneHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame); // startGame is a function reference
    playAgainButton.on('pointerover', e => e.target.alpha = 0.7); // concise arrow function with no brackets
    playAgainButton.on('pointerout', e => e.currentTarget.alpha = 1.0); // ditto
    gameOverScene.addChild(playAgainButton);
}

// Start the game
function startGame() {
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    backgroundImg.visible = true;
    levelNum = 1;
    score = 0;
    life = 3;
    increaseScoreBy(0);
    paddle.x = 300;    
    paddle.y = 550;    
    loadLevel();
}

// Increase the score by the specified value
function increaseScoreBy(value) {
    score += value;
    scoreLabel.text = `Score   ${score}`;
}

// Increase the life by the specified value
function increaseLife() {

    if (!superUser) {

        life++;
        lifeLabel.text = `Lives`;
    }
    
    // Draw the life icons to the screen
    drawLifeIcons();
}

// Decrease the life by the specified value
function decreaseLife() {

    // Run this code if superuser flag is not set (taking away health)
    if (!superUser) {

        life--;        
        lifeLabel.text = `Lives`;        
    }

    // Draw the life icons to the screen
    drawLifeIcons();
}

// Create the life icons
function createLifeIcons() {

    const minX = 100;
    let iconWidth = 0;

    // Remove all life icons from the game scene before creating new ones
    lifeIcons.forEach(li => gameScene.removeChild(li));
    // Remove all life icons from the array before creating new ones
    lifeIcons = [];
    
    // Create the number of heart icons as there are objects in the array
    for (let i = 0; i < life; i++) {
        let lifeIcon = new LifeIcon();

        iconWidth = lifeIcon.getBounds().width;
        
        lifeIcon.x = minX + (lifeIcons.length * (iconWidth + 5));
        lifeIcon.y = lifeLabel.getBounds().y + 6;

        lifeIcons.push(lifeIcon);        
    }
}

// Add the life icons to the game scene
function drawLifeIcons() {

    createLifeIcons();

    for (let lifeIcon of lifeIcons) {
        gameScene.addChild(lifeIcon);
    }
}

// Update the event label that shows power up duration
function updateEventLabel(value) {
    event = value;
    eventLabel.text = `Powerup Timer   ${event}`;
}

// Start the game loop
function gameLoop(){
    if (paused) return; // keep this commented out for now

    // Calculate "delta time"
    let dt = 1 / app.ticker.FPS;
    if (dt > 1/12) dt = 1/12;

    // Move Paddle
    let mousePosition = app.renderer.plugins.interaction.mouse.global;    

    let amt = 6 * dt; // at 60 FPS would move about 10% of distance per update

    let currentEventTime = 0;

    // lerp (linear interpolate) the x & y values with lerp()
    let newX = lerp(paddle.x, mousePosition.x, amt);

    // keep the paddle on the screen with clamp()
    let w2 = paddle.width / 2;
    
    // If there are projectiles in the scene, record the current
    // and previous positions for use in directional vector calculations
    if (projectiles.length > 0) {

        paddlePosition.previous.x = paddlePosition.current.x;
        paddlePosition.previous.y = paddlePosition.current.y;
        
        // Clamp the paddle to the screen considering the border and background
        // adjustments
        paddle.x = clamp(
            newX,
            w2 + gameScene.children[1].width + backgroundBorderEdgeWidth,
            sceneWidth - w2 - gameScene.children[2].width - backgroundBorderEdgeWidth
        );
		
        paddlePosition.current.x = paddle.x;
        paddlePosition.current.y = paddle.y;

        // Calculate paddle velocity using current and previous positions
        paddle.velocity = Math.round((paddlePosition.current.x - paddlePosition.previous.x) / 10);

        // Determine if the paddle is moving to the left or the right based on
        // the x-vector sign
        if (paddlePosition.previous.x > paddlePosition.current.x) {

            paddle.velocity *= -1;

        } else if (Math.abs(paddlePosition.previous.x - paddlePosition.current.x) < 2) {

            paddle.velocity = 0;

        }

    // If there are no projectiles on the screen, set the paddle velocity to zero
    } else {
        paddle.velocity = 0;
    }

    // If there are no projectils in the scene, draw the launch line to indicate direction of projectile launch
    if (projectiles.length > 0) {

        if (launchLine.length >  0) {
            
            launchLine.forEach(line => gameScene.removeChild(line));
            launchLine = [];
        }
    // If there are projectiles in the scene, remove the launch line
    } else {

        launchLine.forEach(line => gameScene.removeChild(line));
        launchLine = [];

        launchLine.push(
            new LaunchLine(
                {
                    x: paddle.getBounds().x + (paddle.getBounds().width / 2), 
                    y: paddle.getBounds().y}, 
                mousePosition)
            );

        for (let line of launchLine) {
            gameScene.addChild(line);
        }
    }

    // Move Projectile and bounce off walls
    for (let p of projectiles) {

        // Record previous and current projectile positions for use in vector calculations
        p.previous.x = p.current.x;
        p.previous.y = p.current.y;
        p.projectile.move(dt);
        p.current.x = p.projectile.x;
        p.current.y = p.projectile.y;

        // Project the projectile to determine its future position
        let futurePositionProjectile = futurePosition(p.projectile, dt);

        // If the future position of the projectile will move out of bounds, reflect the projectile
        if (((futurePositionProjectile.x - 5) <= (marginWidthSides + backgroundBorderEdgeWidth)) || 
            ((futurePositionProjectile.x + p.projectile.width + 5) >= (sceneWidth - marginWidthSides - backgroundBorderEdgeWidth))) {
            
            p.projectile.reflectX();
            p.projectile.move(dt);            
        }

        if ((futurePositionProjectile.y <= (marginHeightTopBottom + backgroundBorderEdgeWidth)) || 
            (((futurePositionProjectile.y + p.projectile.getBounds().height) >= (sceneHeight - (backgroundBorderEdgeWidth - 10))) && offScreenReflection)) {

            p.projectile.reflectY();
            p.projectile.move(dt);
        }
    }

    // Remove powerups that go off screen
    for (let pu of powerups) {
        if (pu.y > sceneHeight) {
            pu.isAlive = false;
            gameScene.removeChild(pu)
        }
    }

    // Move Projectiles
    for (let p of projectiles) {
        p.projectile.move(dt);
    }

    // Move Powerups
    for (let p of powerups) {
        p.move(dt);
    }

    // Check for Collisions
    for (let b of blocks) {
        for (let p of projectiles) {
            // If a blocks and a projectile will intersect in the next loop
            // Collision detection, projectiles and blocks
            if (rectsIntersectFuture(p.projectile, b, dt)) {
                // If the block only requires 1 hit to be destroyed, destroy and create powerup if required
                if ((b.objectProperties.hits == 1) || (superBall)) {

                    brickBreakSound.play();
                    //createExplosion(b.x, b.y, 64, 64);
                    createExplosion(p.projectile.x, p.projectile.y, 64, 64);

                    // If the superBall powerup is active, don't reflect projectile
                    if (!superBall) {
                        applyReflection(p.projectile, b, dt);
                    }
                    
                    increaseScoreBy(1);

                    // If the block being destroyed has a powerup, create the powerup object
                    if (b.objectProperties.powerup.event != "none") {
                        for (let tile of tileSpriteProperties["subtexture"]) {
                            if (tile.attributes.property === b.objectProperties.powerup.event) {
                
                                let localPowerup = new Powerup(
                                    "images/breakout/" + tile.name,
                                    {
                                        "type": "powerup",
                                        "event": tile.attributes.property,                                        
                                    }
                                );

                                localPowerup.x = b.getBounds().x + 5;
                                localPowerup.y = b.getBounds().y + 1;
                                
                                powerups.push(localPowerup);
                                gameScene.addChild(localPowerup);
    
                                gameScene.removeChild(b);
                                
                                b.isAlive = false;

                                localPowerup.move(dt);

                                break;
                            }
                        }
                    }

                    gameScene.removeChild(b);
                    b.isAlive = false;
                
                // If the block requires 2 hits to be destroyed, destroy and create replacement/cracked block
                } else if (b.objectProperties.hits == 2) {

                    brickCrackSound.play();

                    for (let tile of tileSpriteProperties["subtexture"]) {
                        if ((tile.attributes.color === b.objectProperties.color) && 
                            (tile.attributes.style === "cracked")) {
        
                            applyReflection(p.projectile, b, dt);

                            let block = new Block(
                                "images/breakout/" + tile.name,
                                marginWidthSides,
                                backgroundBorderEdgeWidth,
                                levels["level" + levelNum][b.objectProperties.row].length,
                                {
                                    "color": b.objectProperties.color, 
                                    "type": "cracked", 
                                    "hits": 1,
                                    "row": b.objectProperties.row,
                                    "powerup": getPowerup()
                                },
                                0xFFFF00
                            );
            
                            block.x = b.getBounds().x;
                            block.y = b.getBounds().y;
            
                            blocks.push(block);
                            gameScene.addChild(block);

                            gameScene.removeChild(b);
                            b.isAlive = false;

                            break;
                        }
                    }
                // If the block cannot be destroyed, reflect and play metalic sound
                } else if (b.objectProperties.hits == "none") {

                    metalHitSound.play();

                    applyReflection(p.projectile, b, dt);
                }
            }

            // Collision detection, projectiles and screen edges
            // Check and remove projectiles that left the scene
            if (p.projectile.y > sceneHeight)  {
                gameScene.removeChild(p.projectile);
                p.projectile.isAlive = false;
                projectiles.splice(projectiles.indexOf(p), 1);

                decreaseLife();
            }

            // Collision detection, projectiles and paddle
            // Improved collision detection through projection
            if (p.projectile.isAlive && rectsIntersectFuture(p.projectile, paddle, dt)) {
                
                let exitVector = calculateExitVector(p.projectile, paddle, paddlePosition);

                p.projectile.fwd.x = exitVector.x;
                p.projectile.fwd.y = exitVector.y;

                paddleBounceSound.play();
            }

            // Collision detection, powerups and paddle
            // If the paddle collides with powerup, apply powerup
            for (let pu of powerups) {
                // #5B - powerups & paddle - Improved collision detection through projection
                if (pu.isAlive & rectsIntersectFuture(pu, paddle, dt)) {

                    pu.isAlive = false;
                    gameScene.removeChild(pu);

                    let thisEvent = pu.objectProperties.event;

                    let updatedProperties = implementPowerup(
                        thisEvent,
                        paddle, 
                        projectiles);

                    // Increase score based on powerup score
                    increaseScoreBy(updatedProperties.score);

                    // Increase lives based on powerup hearts
                    if (updatedProperties.increaseLives) {
                        increaseLife();
                    };

                    // Close the bottom of the screen so the ball cannot leave the screen
                    if (!offScreenReflection) {                        
                        offScreenReflection = updatedProperties.reflect;
                    }

                    // Enable super ball which goes through everything (except paddle)
                    if (!superBall) {
                        superBall = updatedProperties.superBall;
                    }
                    
                    // Switch the bottom border on and off based on offScreenReflection
                    if (offScreenReflection) {
                        bottomBorder.visible = true;
                    } else {
                        bottomBorder.visible = false;
                    }
                }
            }            
        }
    }
    // All done checking for collisions

    // Calculate the time left for the events
    currentEventTime = parseFloat(Math.round(paddle.powerupProperties.time_left * 100) / 100).toFixed(2);

    // Update the event time remaining label
    updateEventLabel(currentEventTime);

    // If there is less than 2.5 seconds left on the powerup, flash the screen text
    if ((currentEventTime < 2.5) && (paddle.powerupProperties.type != "none")) {

        if (!timerPlayed) {
            powerUpTimerSound.play();

            timerPlayed = true;
        }

        if (eventLabel.style.fill === "#ffffff") {
            eventLabel.style.fill = 0xFF0000;
        } else {
            eventLabel.style.fill = 0xFFFFFF;
        }
    }

    // Update powerup duration stored in the paddle
    if (paddle.powerupProperties.type != "none") {

        updatePowerupDuration(paddle, dt);

        // disables powerup when time has expired
        if (paddle.powerupProperties.time_left <= 0) {
            
            resetPowerupChanges();
        }
    }

    // Do some clean up
    // Get rid of dead projectiles
    projectiles = projectiles.filter(p => p.projectile.isAlive);

    // Get rid of dead powerups
    powerups = powerups.filter(p => p.isAlive);

    // Get rid of dead blocks    
    blocks = blocks.filter(b => b.isAlive);

    // Get rid of explosions
    explosions = explosions.filter(e => e.playing);

    // Test if the game is over
    if (life <= 0) {

        end();

        return; // return here so we skip # 8 below
    }

    let activeBlocks = 0;

    // Count the number of active blocks in the scene
    for (let block of blocks) {

        if (block.objectProperties.hits != "none") {
            activeBlocks++;
        }
    }

    // Load the next level
    if ((activeBlocks == 0) && (levelNum < Object.keys(levels).length)) {

        levelNum++;

        levelCompleteSound.play();

        loadLevel();
    }
    
    // Fire a projectile on click
    app.view.onclick = fireProjectile;
}

// Reset the changes made to the game objects because of powerups
function resetPowerupChanges() {

    paddle.width = 0;
    paddle.height = 0;
    paddle.scale.set(0.2);
    paddle.height /= 2;
    paddle.powerupProperties.type = "none";
    paddle.powerupProperties.time_left = 0;
    paddle.powerupProperties.duration = 0;

    offScreenReflection = false;
    superBall = false;
    bottomBorder.visible = false;
    eventLabel.style.fill = 0xFFFFFF;

    for (let p of projectiles) {
        p.projectile.speed = 150;
    }
}

// Create the blocks in the scene
function createBlocks() {

    let currentLevel = "level" + levelNum;
    let rows = Object.keys(levels[currentLevel]).length;        // Get size of level from JSON file
    let columns = 0;
    let imageSource = "";
    let tempProperties = [];
    let brickPadding = pixelsToUnits(100);    

    let xPos = marginWidthSides + backgroundBorderEdgeWidth;
    let yPos = marginHeightTopBottom + brickPadding + backgroundBorderEdgeWidth;
    let spaceMultiplier = 0;
    let spacer = 0;
    
    // For each row
    for (let row = 0; row < rows; row++) {
        // get the number of columns in the row from the JSON level object
        columns = Object.keys(levels[currentLevel][row]).length;

        // Ffor each column
        for (let col = 0; col < columns; col++) {
            // Calculate the space required between open tiles
            spacer = ((sceneWidth - (2 * marginWidthSides) - (2 * backgroundBorderEdgeWidth) - 1) / levels[currentLevel][row].length) + 1;

            // For each tile defined in the breakout_tile_free JSON file
            for (let tile of tileSpriteProperties["subtexture"]) {

                // Get the tile properties based on the parameters defined in the translator
                textureProperties = levelTranslator(levels[currentLevel][row][col])

                // If the properties of the tile from the breakout_tile_free JSON file match
                // the properties from the level translator.  Extract the required information
                // from the JSOn file
                if ((tile.attributes.color === textureProperties.color) && 
                    (tile.attributes.style === textureProperties.type)) {

                    imageSource = "images/breakout/" + tile.name;
                    tempProperties = {"color":  tile.attributes.color, "width": tile.width};

                    break;
                }
            }

            // If the levels JSON file row/column value is not 0 (0 represents a space), based on the level
            // template read from the levels JSON file, create a block based on the levels JSON file requirements
            if (levels[currentLevel][row][col] != 0) {
                let block = new Block(
                    imageSource,
                    marginWidthSides,
                    backgroundBorderEdgeWidth,
                    levels[currentLevel][row].length,
                    {
                        "color": tempProperties.color, 
                        "type": textureProperties.type, 
                        "hits": textureProperties.hits,
                        "row": row,
                        "powerup": getPowerup() // change this property to {event: "plus_50"} or equivalent for troubleshooting
                    },
                    0xFFFF00
                );
                
                block.x = (xPos - 2);
                block.y = yPos;

                blocks.push(block);
                gameScene.addChild(block);

                spaceMultiplier++;
            } 
            // If the value is 0, add the required spaces to the next block
            else {
                spaceMultiplier++;
            }

            // Update the next block position by adding the above-calculated spacer value
            xPos = marginWidthSides + (spacer * spaceMultiplier) + backgroundBorderEdgeWidth;
        }

        xPos = marginWidthSides + backgroundBorderEdgeWidth;
        yPos = yPos + 18;

        spaceMultiplier = 0;
    }
}

// Load a new level into the scene
function loadLevel() {

    app.view.onclick = null;

    if (levelNum == Object.keys(levels).length) {
        end();
    }

    clearLevelElements();
    
    createBlocks();

    drawLifeIcons();

    resetPowerupChanges();

    paddle.x = sceneWidth / 2;

    paused = false;
}

// End the game
function end() {
    paused = true;

    clearLevelElements();

    resetPowerupChanges();

    if (levelNum != Object.keys(levels).length) {

        looseGameSound.play();

        gameOverScene.children[1].visible = false;
        gameOverScene.children[0].visible = true;
    } else {
        
        levelCompleteSound.play();

        gameOverScene.children[0].visible = false;
        gameOverScene.children[1].visible = true;
    }

    gameOverScoreLabel.text = "Your final score: " + score;

    gameOverScene.visible = true;
    gameScene.visible = false;
    backgroundImg.visible = false;
}

// Clear all elements from the level scene
function clearLevelElements() {

    // clear out level
    paddlePosition = {current: {x: 0, y: 0}, previous: {x: 0, y: 0}};

    if (blocks.length > 0) {
        
        blocks.forEach(b => gameScene.removeChild(b)); // Remove all blocks from scene
        blocks = [];
    }

    if (projectiles.length > 0) {

        projectiles.forEach(p => gameScene.removeChild(p.projectile)); // Remove all projectiles from scene
        projectiles = [];
    }
    
    if (explosions.length > 0) {

        explosions.forEach(e => gameScene.removeChild(e)); // Remove all explosions from scene
        explosions = [];
    }
    
    if (powerups.length > 0) {

        powerups.forEach(pu => gameScene.removeChild(pu)); // Remove all powerups from scene
        powerups = [];
    }

    if (lifeIcons.length > 0) {

        lifeIcons.forEach(li => gameScene.removeChild(li)); // Remove all life icons from scene
        lifeIcons = [];
    }
}

// Fire a projectile
function fireProjectile(e) {
    
    if (paused) return;

    // If there are no projectiles in the scene, or the user is a superuser, create a projectile
    if (projectiles <= 0 || superUser) {

        // Get the position of the mouse on the screen
        let mousePosition = app.renderer.plugins.interaction.mouse.global;
        // Get the position of the paddle on the screen
        let sourceObject = {x: paddle.x, y: (paddle.y - (paddle.getBounds().height / 2) - 10)};
        let destinationObject = mousePosition;

        createProjectile(sourceObject, destinationObject);
    }
}

// Create the projectile
function createProjectile(sourceObject, destinationObject) {

    let directionUnitVector = {x: 0, y: 0};

    directionUnitVector = calculateUnitVector(sourceObject, destinationObject);

    // If the projectile is fired at a too-low angle, increase the angle
    if (Math.abs(directionUnitVector.y) < 0.25) {
        if ( directionUnitVector.x < 0) {
            directionUnitVector = normalizeVector(-2.0, -0.47);
        } else {
            directionUnitVector = normalizeVector(2.0, -0.47);
        }
    }

    let b = new Projectile(0xFFFFFF, sourceObject.x, sourceObject.y, directionUnitVector);        
    
    // Add the new projectile to the projectiles array
    projectiles.push({
        projectile: b,
        current: {
            x: sourceObject.x,
            y: sourceObject.y
        }, 
        previous: {
            x: sourceObject.x, 
            y: sourceObject.y}
        }
    );

    gameScene.addChild(b);    
}

function loadSpriteSheet() {
    // the 16 animation frames in each row are 64x64 pixels
    // we are using the second row
    // http://pixijs.download/dev/docs/PIXI.BaseTextures.html
    let spriteSheet = PIXI.BaseTexture.fromImage("images/explosions.png");
    let width = 64;
    let height = 64;
    let numFrames = 16;
    let textures = [];

    for (let i = 0; i < numFrames; i++) {
        // http://pixijs.download/dev/docs/PIXI.Textures.html
        let frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i * width, 64, width, height));
        textures.push(frame);
    }

    return textures;
}

function createExplosion(x, y, frameWidth, frameHeight) {
    // http://pixijs.download/dev/docs/PIXI.extras.AnimatedSprite.html
    // the animation frames are 64x64 pixels
    let w2 = frameWidth / 2;
    let h2 = frameHeight / 2;
    let expl = new PIXI.extras.AnimatedSprite(explosionTextures);

    expl.x = x - w2; // we want the explosions to appear at the center of the circle
    expl.y = y - h2; // ditto
    expl.animationSpeed = 2/7;
    expl.loop = false;
    expl.onComplete = e => gameScene.removeChild(expl);
    explosions.push(expl);
    gameScene.addChild(expl);
    expl.play();
}

// Load the JSON file containing all the information about the levels
function loadLevels(callback) {

    let xobj = new XMLHttpRequest();
    xobj.overrideMimeType('application/json');
    xobj.open('GET', 'resources/levels.json', true);
    xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && xobj.status == "200" ) {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }        
    };

    xobj.send(null);
}

// Load the JSON file containing all the information about the sprites
function loadSpriteJSON(callback) {

    let xobj = new XMLHttpRequest();
    xobj.overrideMimeType('application/json');
    xobj.open('GET', 'resources/breakout_tile_free.json', true);
    xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && xobj.status == "200" ) {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }        
    };

    xobj.send(null);
}
