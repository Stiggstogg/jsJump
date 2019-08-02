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
var playerSize = 0.03;          // relative size of the player square (in fraction of the width)
var player = new PlayerCharacter(width*0.01, height-width*playerSize, width*playerSize,
    "rgb(255, 255, 255", 0.167);            // create the player character

// Event listeners
// --------------------
var keyDown = {
    left: false,
    right: false,
    up: false,
};

// key down events (fires as long as the key is pressed and no other key is pressed)
document.onkeydown = function(event) {
    let keyPressed = event.key;
    if (keyPressed == "ArrowRight" && !keyDown.right){          // only do this is key is not already pressed (only the first time the key is pressed)
        keyDown.right = true;                                   // set trigger for key to true
        player.addHorizSpeed(player.maxSpeed);                  // add horizontal speed (moving right)
    } else if (keyPressed == "ArrowLeft" && !keyDown.left) {    // only do this is key is not already pressed (only the first time the key is pressed)
        keyDown.left = true;                                    // set trigger for key to true
        player.addHorizSpeed(-player.maxSpeed);                 // substract horizontal speed (moving left)
    } else if (keyPressed == "ArrowUp") {                       // do this for as long as the key is pressed (no influence as continuous jumping should be possible)
        keyDown.up = true;                                      // set trigger for key to true
    }
};

// key up events (fires only once when the key is released)
document.onkeyup = function(event) {
    let keyPressed = event.key;
    if (keyPressed == "ArrowRight") {
        keyDown.right = false;                                  // set the trigger for this key to false
        player.addHorizSpeed(-player.maxSpeed);                 // substract the horizontal speed added before when the key was pressed (stop moving right)
    } else if (keyPressed == "ArrowLeft") {
        keyDown.left = false;                                   // set the trigger for this key to false
        player.addHorizSpeed(player.maxSpeed);                  // add the horizontal speed added before when the key was pressed (stop moving left)
    } else if (keyPressed = "ArrowUp") {
        keyDown.up = false;                                     // set the trigger for this key to false
    }
};

// update: Update the game logic
// -------------------------------

var update = function (updateStep) {    // always include updateStep in your code, as this is the time passed between two updates

    // gravity slows down players vertical speed when he isn't on the ground
    if (!player.onGround) {
        player.addVertSpeed(-gravity*updateStep/1000);      // substract vertical speed based on the gravity
    } else {
        player.speedVert = 0;                                       // set vertical speed to 0 if the player stands on the ground
    }

    // Check if jump button is pressed (continuous jumping is possible therefor this is checked in the game loop)
    if (keyDown.up) {
        player.jump();                                              // perform the jump method (checks also if player is on the ground)
    }

    // set players new x and y position
    player.setPosition(updateStep);                                 // set the players new x and y position based on the horizontal and vertical speeds

    // check if player is on ground
    if (height <= player.y + player.size) {
        player.onGround = true;                                     // set the trigger for standing on the ground to true
        player.y = height-player.size;                              // set the y-Position to the ground (avoids that the player is standing slightly below the ground)
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