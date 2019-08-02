class GameCharacter {
    constructor (x, y, size, color) {
        this.x = x;                                 // x position
        this.y = y;                                 // y position
        this.size = size;                           // size of the character (square) in px
        this.color = color;                         // color of the square
        this.speedHoriz = 0;                        // Horizontal speed in px/s
        this.speedVert = 0;                         // Vertical speed in px/s
    }

    // add horizontal speed
    addHorizSpeed (hSpeed) {
        this.speedHoriz += hSpeed * width;          // speed is added (multiplied by width to convert from width/s to px/s)
    }

    // set the players x and y position based on the time step and the speed
    setPosition (step) {
        this.x += this.speedHoriz*step/1000;        // add increment to the x position (speed multiplied by the incremental time step)
        this.y -= this.speedVert*step/1000;         // substract increment to the y position (substraction means up as y position 0 lies at the top of the canvas)
    }
}

class PlayerCharacter extends GameCharacter{
    constructor (x, y, size, color, maxSpeed) {
        super(x, y, size, color);
        this.maxSpeed = maxSpeed;                   // Horizontal maximum speed in width/s
        this.jumpSpeed = maxSpeed*3;                // Vertical maximum speed in width/s
        this.onGround = true;
    }

    // add vertical speed
    addVertSpeed (vSpeed) {
        this.speedVert += vSpeed * width;           // speed is added (multiplied by width to convert from width/s to px/s)
    }

    // player jumps
    jump () {
        if (this.onGround) {                        // only jump if the player stands on the ground
            this.addVertSpeed (this.jumpSpeed);     // add vertical jump speed
            this.onGround = false;                  // player stands now not on ground anymore
        }
    }
}