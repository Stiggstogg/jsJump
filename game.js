// canvas
var canvas = document.getElementById("gameCanvas");        // get canvas by ID
var ctx = canvas.getContext("2d");                                  // get context
let width = canvas.width;                                           // get width of the canvas TODO: What happens if the window is resized during playing?
let height = canvas.height;                                         // get height of the canvas TODO: What happens if the window is resized during playing?

// game states
var gameRunning = false;            // is game running?
var gameStarted = false;            // is game started?

// geek mode
var geek = {
    mode: true,                     // if this is true stats (e.g. FPS) and console entries are shown
    x: width*0.01,                  // x position of the text on the screen
    y: height*0.05,                 // x position of the text on the screen
    color: "rgb(255, 255, 255)",    // color of the text
    font: "12px Arial",             // style of the text
};

// Game Physics Variables
var gravity = 0.833;           // gravity (width/s^2)


// Create game objects
// --------------------
var playerSize = 0.03;
var player = new PlayerCharacter(width*0.01, height-width*playerSize, width*playerSize, "rgb(255, 255, 255", 0.167);

// Event listeners
var keyDown = {
    left: false,
    right: false,
    up: false,
};

document.onkeydown = function(event) {
    let keyPressed = event.key;
    if (keyPressed == "ArrowRight"){
        player.speedHoriz = player.maxSpeed*width;
        keyDown.right = true;
        if (keyDown.up) {
            player.jump();
        }
    } else if (keyPressed == "ArrowLeft") {
        player.speedHoriz = -player.maxSpeed * width;
        keyDown.left = true;
        if (keyDown.up) {
            player.jump();
        }
    } else if ((keyPressed == "ArrowUp" || keyDown.up)  && player.onGround) {
        player.jump();
        keyDown.up = true;
    }
}

document.onkeyup = function(event) {
    let keyPressed = event.key;
    if (keyPressed == "ArrowRight") {
        keyDown.right = false;
        if (keyDown.left) {
            player.speedHoriz = -player.maxSpeed*width;
        } else {
            player.speedHoriz = 0;
        }
        if (keyDown.up) {
            player.jump();
        }
    } else if (keyPressed == "ArrowLeft") {
        keyDown.left = false;
        if (keyDown.right) {
            player.speedHoriz = player.maxSpeed*width;
        } else {
            player.speedHoriz = 0;
        }
        if (keyDown.up) {
            player.jump();
        }
    } else if (keyPressed = "ArrowUp") {
        keyDown.up = false;
    }
}

// update: Update the game logic
// -------------------------------

var update = function (updateStep) {    // always include updateStep in your code, as this is the time passed between two updates
    player.x += player.speedHoriz*updateStep/1000;

    // gravity slows down player vertical speed
    if (!player.onGround) {
        player.speedVert += -gravity*width*updateStep/1000;
    } else {
        player.speedVert = 0;
    }

    // set player vertical position
    player.y -= player.speedVert*updateStep/1000;

    // check if player is on ground
    if (height <= player.y + player.size) {
        player.onGround = true;
        player.y = height-player.size;
    }

};

// draw: Draw the game into the screen
// ------------------------------------

var draw = function () {
    ctx.clearRect(0,0,width,height);                              // Clear context

    // draw FPS
    if (geek.mode) {
        ctx.fillStyle = geek.color;                                      // set color
        ctx.font = geek.font;                                            // set font
        ctx.fillText("FPS: " + Math.round(fps), geek.x, geek.y);    // draw text
    }

    // draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);
};

// Main game loop
// ----------------

// static variables
let maxFPS = 60;                // maximum FPS on which the game runs (default: 60)
let timestep = 1000 / 60;       // timestepof the update function, (ms) (default: 1000 / 60, reduce for performance intensive ganes))
let maxUpdateSteps = 240;       // maximum number of update steps between two frames (default: 240)

// dynamic variables
var delta = 0;                  // delta between two frames (ms)
var lastFrameTimeMs = 0;        // time when the last frame was painted (ms)
var fps = maxFPS;               // calculated fps (exponential moving average)
var fpsThisSecond = 0;          // current FPS of this second
var lastFpsUpdate = 0;          // Last fps update
var frameID;                    // frame ID to cancel the animation

// main game loop
var gameLoop = function (timestamp) {

    // Define the frame rate (throttle the frame rate)
    if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {     // update and draw only if the time needed for the maximum FPS was passed
        frameID = window.requestAnimationFrame(gameLoop);
        return;
    }
    delta += timestamp - lastFrameTimeMs;                   // time elapsed between this and the last frame
    lastFrameTimeMs = timestamp;                             // save the time of the current frame as the last frame time

    // update FPS (every second)
    if (timestamp > lastFpsUpdate + 1000) {
        fps = 0.25 * fpsThisSecond + (1 - 0.25) * fps;      // compute new FPS (0.25: "decay" parameter, weighing of the most recent FPS.

        lastFpsUpdate = timestamp;                          // set the FPS update time to the current timestamp
        fpsThisSecond = 0;                                  // reset the number of frames for this second
    }
    fpsThisSecond++;                                        // increment the number of frames drawn in this second

    // update: Perform updates depending on the timestep set and the time elapsed between this and the last frame
    var numUpdateSteps = 0;
    while (delta >= timestep) {
        update(timestep);                                   // run the update according to the timestep
        delta -= timestep;                                  // remove the timestep from the delta (to calculate how many time is left from the delta and if an additional update is needed), if delta < timestep the remaining time will update in the next frame
        numUpdateSteps++;                                   // increase the number of update steps performed

        // sanity check: If too many updates need to be done between two frames call the corresponding function, this avoids "spiral of death" or happens when user changes the tab
        if (numUpdateSteps >= maxUpdateSteps) {
            tooManyUpdates();                               // function which should be called in case too many updates are needed
            break;
        }
    }

    draw(); // draw on the screen
    frameID = window.requestAnimationFrame(gameLoop);                 // start the next frame
}

// Too many updates: called by the mainLoop
var tooManyUpdates = function() {
    delta = 0;                                              // reset delta to 0, basically sets game back to the stage where it was left
    if (geek.mode) {
        console.log("Too many updates! Either game is not performing or another tab was open.");
    }
}

// Start function to start the loop
function start() {
    if (!gameStarted) {                 // only start if it isn't yet started to avoid requesting multiple frames
        gameStarted = true;             // set start to true
        // Dummy frame to get timestamps and initial drawing right
        frameID = window.requestAnimationFrame(function(timestamp){
            draw();                     // initial drawing
            gameRunning = true;          // set game state to running
            lastFrameTimeMs = timestamp; // set the last frame time to initial value
            lastFpsUpdate = timestamp;   // set the last fps time to initial value
            fpsThisSecond = 0;           // reset the number of FPS for this second

            // Actually start the main loop
            frameID = window.requestAnimationFrame(gameLoop);
        });
    }
}

// Stop function to stop the loop
function stop() {
    gameRunning = false;
    gameStarted = false;
    window.cancelAnimationFrame(frameID);
}

// Events
// TODO: Check here for variable gameRunning! To pause EventHandlers when not used

// Start the game
start();