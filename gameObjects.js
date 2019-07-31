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
        this.speedHoriz = 0;
        this.speedVert = 0;
        this.jump = false;
        this.maxSpeed = maxSpeed;                   // Horizontal speed in px/s
        this.jumpSpeed = maxSpeed*3;                  // Vertical speed in px/s
        this.onGround = true;
    }
}