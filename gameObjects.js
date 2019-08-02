class GameCharacter {
    constructor (x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
    }

    move(x,y) {
        this.x += x;
        this.y += y;
    }

    moveVertically(x) {
        this.x += x;
    }

    moveHorizontally(y) {
        this.y += y;
    }
}

class PlayerCharacter extends GameCharacter{
    constructor (x, y, size , color, maxSpeed) {
        super(x, y, size, color);
        this.speedHoriz = 0;                        // Horizontal speed in px/s
        this.speedVert = 0;                         // Vertical speed in px/s
        this.maxSpeed = maxSpeed;                   // Horizontal maximum speed in width/s
        this.jumpSpeed = maxSpeed*3;                  // Vertical maximum speed in width/s
        this.onGround = true;
    }

    jump () {
        if (this.onGround) {
            this.speedVert = this.jumpSpeed * width;
            this.onGround = false;
        }
    }
}