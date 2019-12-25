// http://paulbourke.net/miscellaneous/interpolation/

// we use this to interpolate the ship towards the mouse position
function lerp(start, end, amt){
	return start * (1-amt) + amt * end;
}

// we didn't use this one
function cosineInterpolate(y1, y2, amt){
	let amt2 = (1 - Math.cos(amt * Math.PI)) / 2;
	return (y1 * (1 - amt2)) + (y2 * amt2);
}

// we use this to keep the ship on the screen
function clamp(val, min, max){
	return val < min ? min : (val > max ? max : val);
}

// bounding box collision detection - it compares PIXI.Rectangles
function rectsIntersect(a, b) {
	var ab = a.getBounds();
	var bb = b.getBounds();
	return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
}

// Performs AABB collision detection by vector projection
function rectsIntersectFuture(a, b, dt) {

	let returnValue = false;

	var aBounds = a.getBounds();
	var bBounds = b.getBounds();
	
	if (((futurePosition(a, dt).x + aBounds.width) > bBounds.x) && 
		((futurePosition(a, dt).x) < (bBounds.x + bBounds.width)) && 
		((futurePosition(a, dt).y + aBounds.height) > bBounds.y) && 
		((futurePosition(a, dt).y) < (bBounds.y + bBounds.height))) {
		
			returnValue = true;
		}

	return returnValue;
}

// Test for intersection from the top or the bottom
function intersectTopBottom(a, b, dt) {

	let returnValue = false;

	let aBounds = a.getBounds();
	let bBounds = b.getBounds();
	let aTempBounds = getProjectedBounds(a, dt);
	let bTempBounds = getProjectedBounds(b, dt);

	// Determine if the objects are intersecting horizontally
	if ((aTempBounds.left < bTempBounds.right) || (aTempBounds.right > bTempBounds.left)) {
	
		// ball from top
		if ((aTempBounds.bottom > bTempBounds.top) && (a.fwd.y > 0.01)) {

			a.y = bBounds.y - aBounds.height - 1;

			returnValue = true;
		}

		// ball from bottom
		if ((aTempBounds.top < bTempBounds.bottom) && (a.fwd.y < -0.01)) {

			a.y = bBounds.y + bBounds.height + 1;

			returnValue =  true;
		}
	}

	return returnValue;
}

// intersecting from left or right
function intersectLeftRight(a, b, dt) {

	let returnValue = false;

	let aBounds = a.getBounds();
	let bBounds = b.getBounds();
	let aTempBounds = getProjectedBounds(a, dt);
	let bTempBounds = getProjectedBounds(b, dt);
	
	// Determine if the objects are intersecting vertically
	if ((aTempBounds.bottom > bTempBounds.top) || (aTempBounds.top < bTempBounds.bottom)) {

		// ball from right
		if (aTempBounds.left < bTempBounds.right) {

			a.x = b.x + bBounds.width + 1;

			returnValue = true;
		}

		// ball from left
		if (aTempBounds.right > bTempBounds.left) {

			a.x = b.x - aBounds.width - 1;

			returnValue =  true;
		}
	}

	return returnValue;
}

// Calculate and return object projected bounds
function getProjectedBounds(obj, dt) {

	let returnValue = {};
	let objBounds = obj.getBounds();

	returnValue  = {
		"top" : (futurePosition(obj, dt).y),
		"bottom" : (objBounds.height + futurePosition(obj, dt).y),
		"left" : (futurePosition(obj, dt).x),
		"right" : (objBounds.width + futurePosition(obj, dt).x)
	};

	return returnValue;
}

// Calculate future position of object with implemented speed variable
function futurePosition(object, dt) {

    let returnValue = {x: 0, y: 0};

    returnValue.x = object.getBounds().x + (object.speed * dt);
    returnValue.y = object.getBounds().y - (object.speed * dt);

    return returnValue;
}


function applyReflection(a, b, dt) {

	// let aBounds = a.getBounds();
	// let bBounds = b.getBounds();
	let aTempBounds = getProjectedBounds(a, dt);
	let bTempBounds = getProjectedBounds(b, dt);
	// let aTempBounds = {
	// 	"top" : (futurePosition(a, dt).y),
	// 	"bottom" : (aBounds.height + futurePosition(a, dt).y),
	// 	"left" : (futurePosition(a, dt).x),
	// 	"right" : (aBounds.width + futurePosition(a, dt).x)
	// };

	// let bTempBounds = {
	// 	"top" : (futurePosition(b, dt).y),
	// 	"bottom" : (bBounds.height + futurePosition(b, dt).y),
	// 	"left" : (futurePosition(b, dt).x),
	// 	"right" : (bBounds.width + futurePosition(b, dt).x)
	// };

	// Calculate the distances between top/bottom and left/right
	let impactPoints = {
		"top" : Math.abs(aTempBounds.bottom - bTempBounds.top),
		"bottom" : Math.abs(aTempBounds.top - bTempBounds.bottom),
		"left" : Math.abs(aTempBounds.right - bTempBounds.left),
		"right" : Math.abs(aTempBounds.left - bTempBounds.right)
	};

	let impactSide = {"name": "top", "distance": impactPoints.top};

	// The smallest distance between objects should be the side of impact
	for (const [key, value] of Object.entries(impactPoints)) {
		if (value < impactSide.distance) {
			impactSide.name = key;
			impactSide.distance = value;
		}
	}

	// Reflect the projectile based on the calculated side of impact
	if ((impactSide.name == "top") || (impactSide.name == "bottom")) {

        a.reflectY();
		a.move(dt);
		a.move(dt);
		
    } else if ((impactSide.name == "left") || (impactSide.name == "right")) {

        a.reflectX();
		a.move(dt);
		a.move(dt);
	}
}

// these 2 helpers are used by classes.js
function getRandomUnitVector(){
	let x = getRandom(-1,1);
	//let y = getRandom(-1,1);
	let y = getRandom(-0.1, -1);
	let length = Math.sqrt(x*x + y*y);
	if(length == 0){ // very unlikely
		x=1; // point right
		y=0;
		length = 1;
	} else{
		x /= length;
		y /= length;
	}

	return {x:x, y:y};
}

// Get random number between two numbers
function getRandom(min, max) {

	return Math.random() * (max - min) + min;
}

// Convert from pixels to units (as required by PixiJS)
function pixelsToUnits(pixels) {
	return (pixels / 2);
}

// Calculate the unit vector in which a projectile should be launched from the paddle
function calculateUnitVector(obj1Position, obj2Position) {

	let returnValue = {x: 0, y: 0};
	
	let x1 = obj1Position.x;
	let x2 = obj2Position.x;

	let y1 = obj1Position.y;
	let y2 = obj2Position.y;

	let vx = x2 - x1;
	let vy = y2 - y1;

	let vMag = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));

	if (Number.isNaN(vx / vMag)) {
		returnValue.x = 0;
	} else {
		returnValue.x = vx / vMag;
	}

	if (Number.isNaN(vy / vMag)) {
		returnValue.y = 0;
	} else {
		returnValue.y = vy / vMag;
	}

	return returnValue;
}

// Calculates only the vector magnitude
function normalizeVector(x, y) {

	let returnValue = {x: 0, y: 0};
	let myMag = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

	returnValue.x = x / myMag;
	returnValue.y = y / myMag;

	return returnValue;
}

// Calculate the unit vector angle at which the projectile would leave the padd
// after impacting the paddle at velcity and angle
function calculateExitVector(obj1, obj2, paddlePosition) {

	let returnValue = {x: 0, y: 0};

	let paddleVectorX = paddlePosition.current.x - paddlePosition.previous.x;
	// Adding the projectile and paddle vector together to get combined vector
	let combinedVector = {
		x: (obj1.fwd.x + (paddleVectorX / 10)), 
		y: (obj1.fwd.y)
	};

	// Normalize the combined vector to get new exit angle
	let normalizedCombinedVector = normalizeVector(combinedVector.x, combinedVector.y);

	returnValue.x = normalizedCombinedVector.x;
	returnValue.y = normalizedCombinedVector.y * -1;

	obj1.y = obj2.getBounds().y - obj1.getBounds().height - 1;//(obj2.getBounds().height / 2) - 1;

	// If the exit angle is too small, adjust it appropriately
	if ((returnValue.y >= -0.5) && (returnValue.y <=0)) {

		let tempVector = normalizeVector(returnValue.x, -0.5);

		returnValue.x = tempVector.x;
		returnValue.y = tempVector.y;

	} else if ((returnValue.y > 0) && (returnValue <= 0.5)) {

		let tempVector = normalizeVector(returnValue.x, 0.5);

		returnValue.x = tempVector.x;
		returnValue.y = tempVector.y;
	}

	return returnValue;
}


// function degrees2Radians(deg) {

//     returnValue = 0;

//     returnValue = deg * (Math.PI / 180);

//     return returnValue;
// }

// function radians2Degrees(rad) {

//     returnValue = 0;

//     returnValue = rad * (180 / Math.PI);

//     return returnValue;
// }

// function magnitude(x, y) {

// 	returnValue = 0;

// 	returnValue = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

// 	return returnValue;
// }

// Translates the level codes into properties which relate to the level details JSON file
function levelTranslator(attribute) {

	let returnValue = null;

	switch (attribute) {
		case 0:
			returnValue = {color: "none", type: "none", hits: "none"};

			break;
		case 1:
			returnValue = {color: "lightblue", type: "solid", hits: "1"};

			break;
		case 2:
			returnValue = {color: "darkblue", type: "solid", hits: "1"};

			break;
		case 3:
			returnValue = {color: "lightgreen", type: "solid", hits: "1"};
			
			break;
		case 4:
			returnValue = {color: "darkgreen", type: "solid", hits: "1"};
			
			break;
		case 5:
			returnValue = {color: "purple", type: "solid", hits: "1"};
			
			break;
		case 6:
			returnValue = {color: "red", type: "solid", hits: "1"};
			
			break;
		case 7:
			returnValue = {color: "orange", type: "solid", hits: "1"};
			
			break;
		case 8:
			returnValue = {color: "yellow", type: "solid", hits: "1"};
			
			break;
		case 9:
			returnValue = {color: "gray", type: "solid", hits: "1"};
			
			break;
		case 10:
			returnValue = {color: "brown", type: "solid", hits: "1"};
			
			break;
		case 11:
			returnValue = {color: "lightblue", type: "cracked", hits: "1"};

			break;
		case 12:
			returnValue = {color: "darkblue", type: "cracked", hits: "1"};

			break;
		case 13:
			returnValue = {color: "lightgreen", type: "cracked", hits: "1"};
			
			break;
		case 14:
			returnValue = {color: "darkgreen", type: "cracked", hits: "1"};
			
			break;
		case 15:
			returnValue = {color: "purple", type: "cracked", hits: "1"};
			
			break;
		case 16:
			returnValue = {color: "red", type: "cracked", hits: "1"};
			
			break;
		case 17:
			returnValue = {color: "orange", type: "cracked", hits: "1"};
			
			break;
		case 18:
			returnValue = {color: "yellow", type: "cracked", hits: "1"};
			
			break;
		case 19:
			returnValue = {color: "gray", type: "cracked", hits: "1"};
			
			break;
		case 20:
			returnValue = {color: "brown", type: "cracked", hits: "1"};
			
			break;
		case 21:
			returnValue = {color: "lightblue", type: "cube", hits: "2"};

			break;
		case 22:
			returnValue = {color: "darkblue", type: "cube", hits: "2"};

			break;
		case 23:
			returnValue = {color: "lightgreen", type: "cube", hits: "2"};
			
			break;
		case 24:
			returnValue = {color: "darkgreen", type: "cube", hits: "2"};
			
			break;
		case 25:
			returnValue = {color: "purple", type: "cube", hits: "2"};
			
			break;
		case 26:
			returnValue = {color: "red", type: "cube", hits: "2"};
			
			break;
		case 27:
			returnValue = {color: "orange", type: "cube", hits: "2"};
			
			break;
		case 28:
			returnValue = {color: "yellow", type: "cube", hits: "2"};
			
			break;
		case 29:
			returnValue = {color: "gray", type: "cube", hits: "2"};
			
			break;
		case 30:
			returnValue = {color: "brown", type: "cube", hits: "none"}; // Indestructible
			
			break;
	}

	return returnValue;

}

// Get a random number to use as index for a powerup from the list
function getPowerup() {

	returnValue = {event: "none"};

	let powerupYesNo = Math.random();

	if (powerupYesNo >= 0.5) {
		returnValue = assignPower();
	}

	return returnValue;
}

// Assign the powerup based on the random number generated using weighted random assignment
function assignPower() {

	let returnValue = 0;

	let min = -1; 
	let max = 12;  
	
	let randomPowerup = Math.floor(Math.random() * (+max - +min)) + +min; 
	
    if (randomPowerup <=5) {

		returnValue = powerupTranslator(0);

	} else if ((randomPowerup > 5) && (randomPowerup < 7)) {

		min = 1;
		max = 3;

		randomPowerup = Math.floor(Math.random() * (+max - +min)) + +min; 

		returnValue = powerupTranslator(randomPowerup);

	} else if (randomPowerup >= 7) {

		min = 3;
		max = 12;

		randomPowerup = Math.floor(Math.random() * (+max - +min)) + +min; 

		returnValue = powerupTranslator(randomPowerup);
	}

	return returnValue;
}

// Update the duration of the powerup assigned to the paddle
function updatePowerupDuration(paddle, dt) {

	paddle.powerupProperties.time_left -= (1 * dt);
}

// Get the powerup that is to be assigned based on the random number generated and the
// weighted random selection that was made
function implementPowerup(event, paddle, projectiles) {

	let returnValue = {"score": 0, "increaseLives": false, "reflect": false, "superBall": false};

	switch (event) {
		case "plus_50":

			scoreCollectSound.play();

			returnValue.score = 50;

			break;
		case "plus_100":

			scoreCollectSound.play();

			returnValue.score = 100;

			break;
		case "plus_250":

			scoreCollectSound.play();

			returnValue.score = 250;

			break;
		case "plus_500":

			scoreCollectSound.play();

			returnValue.score = 500;

			break;
		case "slow":

			timerPlayed = false;
			slowDownSound.play();
			
			paddle.powerupProperties.type = "slow";
			paddle.powerupProperties.duration = 10;
			paddle.powerupProperties.time_left = paddle.powerupProperties.duration;

			for (let p of projectiles) {
				p.projectile.speed /= 2;
			}

			break;
		case "fast":

			timerPlayed = false;
			speedUpSound.play();

			paddle.powerupProperties.type = "fast";
			paddle.powerupProperties.duration = 10;
			paddle.powerupProperties.time_left = paddle.powerupProperties.duration;

			for (let p of projectiles) {
				p.projectile.speed *= 2;
			}

			break;
		case "three_balls":

			paddle.powerupProperties.type = "three_balls";
			paddle.powerupProperties.duration = 10;
			paddle.powerupProperties.time_left = paddle.powerupProperties.duration;

			let destinationUnitVector = {x: 0, y: 0};
			let tempProjectileList = [];
			
			for (let p in projectiles) {
				projectiles.hasOwnProperty(p) && (tempProjectileList[p] = projectiles[p]);
			}

			for (let p of tempProjectileList) {
				destinationUnitVector = normalizeVector(p.projectile.fwd.x, p.projectile.fwd.y);
				destinationUnitVector = normalizeVector(destinationUnitVector.x, destinationUnitVector.y + 100);

				createProjectile(
					{x: p.projectile.x, y: p.projectile.y}, 
					{x: destinationUnitVector.x * 100, y: destinationUnitVector.y * 100}
				);

				destinationUnitVector = normalizeVector(p.projectile.fwd.x, p.projectile.fwd.y);
				destinationUnitVector = normalizeVector(destinationUnitVector.x + 100, destinationUnitVector.y);

				createProjectile(
					{x: p.projectile.x, y: p.projectile.y}, 
					{x: destinationUnitVector.x * 100, y: destinationUnitVector.y * 100}
				);
			}

			break;
		case "super_ball":

			timerPlayed = false;

			paddle.powerupProperties.type = "super_ball";
			paddle.powerupProperties.duration = 5;
			paddle.powerupProperties.time_left = paddle.powerupProperties.duration;

			returnValue.superBall = true;

			break;
		case "bottom_bounce":

			timerPlayed = false;

			paddle.powerupProperties.type = "bottom_bounce";
			paddle.powerupProperties.duration = 10;
			paddle.powerupProperties.time_left = paddle.powerupProperties.duration;

			returnValue.reflect = true;

			break;
		case "shrink":

			timerPlayed = false;
			shrinkSound.play();

			paddle.powerupProperties.type = "shrink";
			paddle.powerupProperties.duration = 10;
			paddle.powerupProperties.time_left = paddle.powerupProperties.duration;
			
			paddle.width /= 2;			

			break;
		case "grow":

			timerPlayed = false;
			growSound.play();

			paddle.powerupProperties.type = "grow";
			paddle.powerupProperties.duration = 10;
			paddle.powerupProperties.time_left = paddle.powerupProperties.duration;

			paddle.width *= 2;

			break;
		case "extra_life":

			gainLifeSound.play();

			returnValue.increaseLives = true;

			break;
	}

	return returnValue;
}

// Translate the powerup number to the text that is assigned to the paddle
function powerupTranslator(attribute) {

	let returnValue = null;

	switch (attribute) {
		case 0:
			returnValue = {event: "plus_50"};

			break;
		case 1:
			returnValue = {event: "plus_100"};

			break;
		case 2:
			returnValue = {event: "plus_250"};

			break;
		case 3:
			returnValue = {event: "plus_500"};
			
			break;
		case 4:
			returnValue = {event: "slow"};
			
			break;
		case 5:
			returnValue = {event: "fast"};
			
			break;
		case 6:
			returnValue = {event: "three_balls"};
			
			break;
		case 7:
			returnValue = {event: "super_ball"};
			
			break;
		case 8:
			returnValue = {event: "bottom_bounce"};
			
			break;
		case 9:
			returnValue = {event: "shrink"};
			
			break;
		case 10:
			returnValue = {event: "grow"};
			
			break;
		case 11:
			returnValue = {event: "extra_life"};

			break;
	}

	return returnValue;
}
