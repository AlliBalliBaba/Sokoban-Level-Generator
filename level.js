class Level {
    constructor(xSize, ySize, NumBoxes) {
        this.xSize = xSize;
        this.ySize = ySize;
        this.buttons = [];
        this.boxes = [];
        this.ghostboxes = [];
        this.blockSize = canvasX / xSize;
        this.solveCounter = NumBoxes;
        this.savedPositions = [];
        this.trash = false;

        //initialize nodes for pathfinding
        this.nodes = Array2d(xSize, ySize, null);
        for (var i = 0; i < this.nodes.length; i++) {
            for (var j = 0; j < this.nodes[0].length; j++) {
                this.nodes[i][j] = new Node(i, j);
            }
        }
        //randomly place boxes and buttons
        this.defineAllowedSpots();
        this.placeObjects(NumBoxes);
    }

    placeObjects(numBoxes) {
        //place buttons
        for (var i = 0; i < numBoxes; i++) {
            var pos = this.randomSpot();
            if (pos != null) {
                this.buttons.push(new Button(pos[0], pos[1]))
            }
        }
        //place boxes
        for (var i = 0; i < numBoxes; i++) {
            var pos = this.randomSpot();
            if (pos != null) {
                this.boxes.push(new Box(pos[0], pos[1], this.buttons[i]))
                this.nodes[pos[0]][pos[1]].hasBox = true;
            }
        }
        //place player
        var pos = this.randomSpot();
        if (pos == null) {
            pos = [this.buttons[0].x, this.buttons[0].y];
        }
        this.setPlayerPos(pos[0], pos[1]);
        this.playerstartX = this.playerX;
        this.playerstartY = this.playerY;
    }

    //write all nodes, where placement is allowed into a list
    defineAllowedSpots() {
        this.allowedSpots = [];
        for (var i = 2; i < this.nodes.length - 2; i++) {
            for (var j = 2; j < this.nodes[0].length - 2; j++) {
                this.allowedSpots.push(this.nodes[i][j]);
            }
        }
    }

    //return a random unoccupied spot and remove the wall
    randomSpot() {
        if (this.allowedSpots.length != 0) {
            var rand = randomInt(0, this.allowedSpots.length);
            var x = this.allowedSpots[rand].x;
            var y = this.allowedSpots[rand].y;
            this.allowedSpots.splice(rand, 1);
            this.nodes[x][y].wall = false;
            if (this.blockaded(x, y)) {
                return this.randomSpot();
            } else {
                return [x, y];
            }
        } else {
            return null;
        }
    }

    //randomly remove walls from the level
    rip(amount) {
        for (var i = 0; i < amount; i++) {
            if (this.allowedSpots.length != 0) {
                this.randomSpot();
            }
        }
    }

    setPlayerPos(X, Y) {
        this.playerX = X;
        this.playerY = Y;
    }

    //check if a spot is blockaded by boxes
    blockaded(X, Y) {
        if (this.nodes[X + 1][Y].hasBox) {
            if ((this.nodes[X + 1][Y + 1].hasBox && this.nodes[X][Y + 1].hasBox) || (this.nodes[X + 1][Y - 1].hasBox && this.nodes[X][Y - 1].hasBox)) {
                return true;
            }
        }
        if (this.nodes[X - 1][Y].hasBox) {
            if ((this.nodes[X - 1][Y - 1].hasBox && this.nodes[X][Y - 1].hasBox) || (this.nodes[X - 1][Y + 1].hasBox && this.nodes[X][Y + 1].hasBox)) {
                return true;
            }
        }
        return false;
    }
}

class Box {
    constructor(X, Y, button) {
        this.x = X;
        this.y = Y;
        this.px = this.x;
        this.py = this.y;
        this.placed = false;
        this.solveButton = button;
    }

    setPosition(X, Y) {
        this.x = X;
        this.y = Y;
    }

    placeExactly(X, Y) {
        this.x = X;
        this.y = Y;
        this.px = this.x;
        this.py = this.y;
    }
}

class Button {
    constructor(X, Y) {
        this.x = X;
        this.y = Y;
    }
}