//p5 function when key is pressed
function keyPressed() {
    if (active) {
        if (keyCode === LEFT_ARROW) {
            goLeft();
        } else if (keyCode === RIGHT_ARROW) {
            goRight();
        } else if (keyCode === UP_ARROW) {
            goUp();
        } else if (keyCode === DOWN_ARROW) {
            goDown();
        } else if (keyCode === BACKSPACE) {
            revertStep();
        }
    }
    if (keyCode === ENTER && (win || !inGame)) {
        newLevel();
    }
}

//p5 function when key is typed
function keyTyped() {
    if (key === 'z') {
        revertStep();
    }
}

function goRight() {
    var x = currentLvl.playerX;
    var y = currentLvl.playerY;
    CheckPositions(x, y, x + 1, y, x + 2, y)
}

function goLeft() {
    var x = currentLvl.playerX;
    var y = currentLvl.playerY;
    CheckPositions(x, y, x - 1, y, x - 2, y)
}

function goUp() {
    var x = currentLvl.playerX;
    var y = currentLvl.playerY;
    CheckPositions(x, y, x, y - 1, x, y - 2)
}

function goDown() {
    var x = currentLvl.playerX;
    var y = currentLvl.playerY;
    CheckPositions(x, y, x, y + 1, x, y + 2)
}

//check the position for walls and boxes, move the player to the position
function CheckPositions(prevX, prevY, x, y, nextX, nextY) {
    var nodes = currentLvl.nodes;
    if (checkBoundaries(currentLvl.nodes, x, y) && !nodes[x][y].wall) {

        //check if new position has a box
        if (!nodes[x][y].hasBox) {
            //move player
            currentLvl.setPlayerPos(x, y);
            addActivity(prevX, prevY, null);
            addActivity(x, y, null);
            //save previous positions
            savePosition(prevX, prevY, null, 0, 0);
        } else if (checkBoundaries(currentLvl.nodes, nextX, nextY) && !nodes[nextX][nextY].wall && !nodes[nextX][nextY].hasBox) {
            //move player
            currentLvl.setPlayerPos(x, y);
            addActivity(prevX, prevY, null);
            addActivity(x, y, null);
            //move box
            var box = getBox(x, y);
            box.setPosition(nextX, nextY);
            box.placed = getButton(nextX, nextY);
            nodes[x][y].hasBox = false;
            nodes[nextX][nextY].hasBox = true;
            addActivity(nextX, nextY, box);
            //save previous positions
            savePosition(prevX, prevY, box, x, y);
            if (box.placed) { checkWin(); }
        }
    }
    document.getElementById("optimizeButton").style.visibility = "hidden";
}

//revert the last step
function revertStep() {
    if (currentLvl.savedPositions.length != 0) {
        var positions = currentLvl.savedPositions.pop();
        //set player position
        currentLvl.setPlayerPos(positions[0], positions[1]);
        px = currentLvl.playerX;
        py = currentLvl.playerY;
        //set box position
        if (positions[2] != null) {
            var thisBox = positions[2];
            currentLvl.nodes[thisBox.x][thisBox.y].hasBox = false;
            thisBox.placeExactly(positions[3], positions[4]);
            thisBox.placed = getButton(thisBox.x, thisBox.y);
            currentLvl.nodes[thisBox.x][thisBox.y].hasBox = true;
        }
    }
    drawAll();
}

//refresh the drawing at a node for 30 frames
function addActivity(x, y, box) {
    activeSpots.push([30, x, y, box]);
}

//save box and player positions for reverting
function savePosition(playerX, playerY, box, boxX, boxY) {
    currentLvl.savedPositions.push([playerX, playerY, box, boxX, boxY])
}

//return the box object at a position
function getBox(x, y) {
    for (var i = 0; i < currentLvl.boxes.length; i++) {
        if (currentLvl.boxes[i].x == x && currentLvl.boxes[i].y == y) {
            return currentLvl.boxes[i];
        }
    }
    return null;
}

//check if a button is at a position
function getButton(x, y) {
    for (var i = 0; i < currentLvl.boxes.length; i++) {
        if (currentLvl.buttons[i].x == x && currentLvl.buttons[i].y == y) {
            return true;
        }
    }
    return false;
}

//check if all boxes are placed
function checkWin() {
    var allplaced = true;
    for (var i = 0; i < currentLvl.boxes.length; i++) {
        if (!currentLvl.boxes[i].placed) {
            allplaced = false;
        }
    }
    if (allplaced) {
        counter = 8;
        win = true;
        currentLvl.savedPositions = [];
    }
}