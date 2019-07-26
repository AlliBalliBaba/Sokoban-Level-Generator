//generates the paths between boxes and buttons in a level by removing walls

function generatePaths(lvl) {
    var steps = 0;
    //create ghostboxes for solving
    for (var i = 0; i < lvl.boxes.length; i++) {
        lvl.ghostboxes.push(new Box(lvl.boxes[i].x, lvl.boxes[i].y, lvl.boxes[i].solveButton));
        lvl.nodes[lvl.boxes[i].x][lvl.boxes[i].y].occupied = true;
    }
    //push the ghostboxes towards the buttons
    while (lvl.solveCounter > 0) {
        //calculate the paths from all boxes to their buttons
        var boxPaths = [];
        for (var i = 0; i < lvl.solveCounter; i++) {
            var lvlBox = lvl.ghostboxes[i];
            lvl.nodes[lvlBox.x][lvlBox.y].occupied = false;
            var solver = new Pathfinder(lvl, lvlBox.x, lvlBox.y, lvlBox.solveButton.x, lvlBox.solveButton.y)
            boxPaths.push(solver.returnPath(true));
            lvl.nodes[lvlBox.x][lvlBox.y].occupied = true;
        }
        //calculate the player paths to all boxes and choose the lowest cost path
        var playerPaths = [];
        var bestPath = -1;
        var lowestCost = 100000000;
        for (var i = 0; i < lvl.solveCounter; i++) {
            var newX = lvl.ghostboxes[i].x;
            var newY = lvl.ghostboxes[i].y;
            if (boxPaths[i][0][0].x == lvl.ghostboxes[i].x + 1) {
                newX -= 1;
            } else if (boxPaths[i][0][0].x == lvl.ghostboxes[i].x - 1) {
                newX += 1;
            } else if (boxPaths[i][0][0].y == lvl.ghostboxes[i].y + 1) {
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
        var playerPath = playerPaths[bestPath][0];

        //if playerPath endpoint is blocked, scrap the level
        if (playerPath.length != 0) {
            var endnode = playerPath[playerPath.length - 1];
            if (lvl.nodes[endnode.x][endnode.y].occupied) {
                lvl.trash = true;
            }
        }

        //remove all walls on the player's path
        for (var i = 0; i < playerPath.length; i++) {
            playerPath[i].wall = false;
        }
        //push the box into the solving direction until there is a turn
        var lvlBox = lvl.ghostboxes[bestPath];
        var boxPath = boxPaths[bestPath][0];
        lvl.nodes[lvlBox.x][lvlBox.y].occupied = false;
        var currentNode = boxPath[0];
        var diffX = currentNode.x - lvlBox.x;
        var diffY = currentNode.y - lvlBox.y;
        var stop = 0;
        //if the path is longer than 1, check for a turn
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
        lvlBox.x = boxPath[stop].x;
        lvlBox.y = boxPath[stop].y;
        lvl.playerX = lvlBox.x - diffX;
        lvl.playerY = lvlBox.y - diffY;
        lvl.nodes[lvlBox.x][lvlBox.y].occupied = true;

        //check if the moved box is on the button
        if (lvlBox.x == lvlBox.solveButton.x && lvlBox.y == lvlBox.solveButton.y) {
            lvlBox.placed = true;
            lvl.solveCounter--;
            lvl.ghostboxes.splice(bestPath, 1);
        }
        steps++;
        if (steps > 4000) {
            lvl.trash = true;
            break;
        }
    }
    //reset player position
    lvl.playerX = lvl.playerstartX;
    lvl.playerY = lvl.playerstartY;
    px = lvl.playerX;
    py = lvl.playerY;
}