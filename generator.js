//generates the paths between boxes and buttons in a level by removing walls

function generatePaths(lvl) {
    var steps = 0;
    //create ghostBoxes for solving
    var ghostBoxes = copyBoxes(lvl, false);
    //push the ghostBoxes towards the buttons
    while (lvl.solveCounter > 0) {
        //calculate the paths from all boxes to their buttons
        var boxPaths = CalcualteBoxPaths(lvl, ghostBoxes);

        //calculate the player paths to all boxes and choose the lowest cost path
        var playerPaths = CalcualtePlayerPaths(lvl, ghostBoxes, boxPaths);
        var bestPath = playerPaths[1];
        var playerPath = playerPaths[0][bestPath][0];
        var boxPath = boxPaths[bestPath][0];

        //remove all walls on the player's path
        for (var i = 0; i < playerPath.length; i++) {
            playerPath[i].wall = false;
            if (playerPath[i].occupied) {
                lvl.trash = true;

            }
        }
        //push the box into the solving direction
        var thisbox = ghostBoxes[bestPath];
        var currentNode = boxPath[0];
        var diffX = currentNode.x - thisbox.x;
        var diffY = currentNode.y - thisbox.y;
        var stop = 0;

        //if the box-path is longer than 1, push until there is a turn
        if (boxPath.length > 1) {
            for (var i = 1; i < boxPath.length; i++) {
                var nextNode = boxPath[i];
                if (diffX == nextNode.x - currentNode.x && diffY == nextNode.y - currentNode.y) {
                    currentNode = nextNode;
                } else {
                    stop = i - 1;
                    break;
                }
            }
        }
        //remove all walls on the box's path
        for (var i = 0; i <= stop; i++) {
            boxPath[i].wall = false;
        }
        //set new player and box positions
        lvl.nodes[thisbox.x][thisbox.y].occupied = false;
        thisbox.setPosition(boxPath[stop].x, boxPath[stop].y)
        lvl.nodes[thisbox.x][thisbox.y].occupied = true;
        lvl.setPlayerPos(thisbox.x - diffX, thisbox.y - diffY)

        //check if the moved box is on the button
        if (thisbox.x == thisbox.solveButton.x && thisbox.y == thisbox.solveButton.y) {
            thisbox.placed = true;
            lvl.solveCounter--;
            ghostBoxes.splice(bestPath, 1);
        }
        steps++;
        if (steps > 4000) {
            lvl.trash = true;
            break;
        }
    }
    //reset player position
    lvl.setPlayerPos(lvl.playerstartX, lvl.playerstartY);
    px = lvl.playerX;
    py = lvl.playerY;
}


function copyBoxes(lvl, used) {
    var newBoxes = [];
    for (var i = 0; i < lvl.boxes.length; i++) {
        newBoxes.push(new Box(lvl.boxes[i].x, lvl.boxes[i].y, lvl.boxes[i].solveButton));
        lvl.nodes[lvl.boxes[i].x][lvl.boxes[i].y].occupied = true;
        lvl.nodes[lvl.boxes[i].x][lvl.boxes[i].y].used = used;
    }
    return newBoxes;
}


//calculate all boxpaths and return them in an array
function CalcualteBoxPaths(lvl, ghostBoxes) {
    var boxPaths = [];
    for (var i = 0; i < ghostBoxes.length; i++) {
        var thisbox = ghostBoxes[i];
        lvl.nodes[thisbox.x][thisbox.y].occupied = false;
        var solver = new Pathfinder(lvl, thisbox.x, thisbox.y, thisbox.solveButton.x, thisbox.solveButton.y)
        boxPaths.push(solver.returnPath(true));
        lvl.nodes[thisbox.x][thisbox.y].occupied = true;
    }
    return boxPaths;
}

//return all player paths and the index of the lowest cost one
function CalcualtePlayerPaths(lvl, ghostBoxes, boxPaths) {
    var playerPaths = [];
    var bestPath = -1;
    var lowestCost = 100000000;
    for (var i = 0; i < ghostBoxes.length; i++) {
        var newX = ghostBoxes[i].x;
        var newY = ghostBoxes[i].y;
        if (boxPaths[i][0][0].x == ghostBoxes[i].x + 1) {
            newX -= 1;
        } else if (boxPaths[i][0][0].x == ghostBoxes[i].x - 1) {
            newX += 1;
        } else if (boxPaths[i][0][0].y == ghostBoxes[i].y + 1) {
            newY -= 1;
        } else {
            newY += 1;
        }
        var solver = new Pathfinder(lvl, lvl.playerX, lvl.playerY, newX, newY);
        playerPaths.push(solver.returnPath(false));
        if (playerPaths[i][1] < lowestCost) {
            lowestCost = playerPaths[i][1];
            bestPath = i;
        }
    }
    return ([playerPaths, bestPath]);

}