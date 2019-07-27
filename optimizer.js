// optimize the level by solving it in different ways and removing unnecessary free spots
// repeatably optimizing can have different results, since there is a randomness to optimizing algorithm
// performance increases with n!, where n is the number of boxes (reminder: 10! =  3628800)
// this alogorithm is only recommended if there are few boxes

function optimizeLvl(lvl) {
    var boxPermutations = findPermutations(lvl.boxes, lvl.buttons);
    var maxUnnecessary = [];
    var minDestroyWall = [];
    var bestPath = 0;
    var steps = 0;
    lvl.playerX = lvl.playerstartX;
    lvl.playerY = lvl.playerstartY;

    //solve the level for all possible box-button combinations
    for (var n = 0; n < boxPermutations.length; n++) {

        //free the button positions
        for (var j = 0; j < lvl.buttons.length; j++) {
            lvl.nodes[lvl.buttons[j].x][lvl.buttons[j].y].occupied = false;
            lvl.nodes[lvl.buttons[j].x][lvl.buttons[j].y].used = true;
        }
        //create ghostboxes for solving
        var ghostboxes = [];
        for (var j = 0; j < boxPermutations[n].length; j++) {
            ghostboxes.push(new Box(boxPermutations[n][j][0].x, boxPermutations[n][j][0].y, boxPermutations[n][j][1]));
            lvl.nodes[ghostboxes[j].x][ghostboxes[j].y].occupied = true;
            lvl.nodes[ghostboxes[j].x][ghostboxes[j].y].used = true;
        }

        //solve level for this permutation
        var solveCounter = ghostboxes.length;
        var destroyWall = [];
        var trash = false;
        while (solveCounter > 0) {
            //calculate the paths from all boxes to their buttons
            var boxPaths = [];
            for (var i = 0; i < solveCounter; i++) {
                var thisBox = ghostboxes[i];
                lvl.nodes[thisBox.x][thisBox.y].occupied = false;
                var solver = new Pathfinder(lvl, thisBox.x, thisBox.y, thisBox.solveButton.x, thisBox.solveButton.y)
                boxPaths.push(solver.returnPath(true));
                lvl.nodes[thisBox.x][thisBox.y].occupied = true;
            }

            //calculate the player paths to all boxes and choose a RANDOM free path
            var playerPaths = [];
            var goodPaths = [];
            for (var i = 0; i < solveCounter; i++) {
                var newX = ghostboxes[i].x;
                var newY = ghostboxes[i].y;
                if (boxPaths[i][0][0].x == ghostboxes[i].x + 1) {
                    newX -= 1;
                } else if (boxPaths[i][0][0].x == ghostboxes[i].x - 1) {
                    newX += 1;
                } else if (boxPaths[i][0][0].y == ghostboxes[i].y + 1) {
                    newY -= 1;
                } else {
                    newY += 1;
                }
                var solver = new Pathfinder(lvl, lvl.playerX, lvl.playerY, newX, newY);
                playerPaths.push(solver.returnPath(false));
                if (playerPaths[i][1] < 1) {
                    goodPaths.push(i);
                }
            }
            bestPath = (goodPaths.length != 0 ? goodPaths[randomInt(0, goodPaths.length)] : randomInt(0, playerPaths.length));
            var playerPath = playerPaths[bestPath][0];
            var boxPath = boxPaths[bestPath][0];


            // mark all nodes, that the player visited
            for (var i = 0; i < playerPath.length; i++) {
                playerPath[i].used = true;
                if (playerPath[i].wall) {
                    destroyWall.push(playerPath[i]);
                }
            }

            //push the box into the solving direction until there is a turn
            var thisBox = ghostboxes[bestPath];
            var currentNode = boxPath[0];
            var diffX = currentNode.x - thisBox.x;
            var diffY = currentNode.y - thisBox.y;
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

            //mark nodes on the box's path
            for (var i = 0; i <= stop; i++) {
                boxPath[i].used = true;
                if (boxPath[i].wall) {
                    destroyWall.push(boxPath[i]);
                }
            }

            //set and mark new player and box positions
            lvl.nodes[thisBox.x][thisBox.y].occupied = false;
            thisBox.setPosition(boxPath[stop].x, boxPath[stop].y);
            lvl.nodes[thisBox.x][thisBox.y].occupied = true;
            lvl.nodes[thisBox.x][thisBox.y].used = true;

            lvl.setPlayerPos(thisBox.x - diffX, thisBox.y - diffY);
            lvl.nodes[lvl.playerX][lvl.playerY].used = true;

            //check if the moved box is on the button
            if (thisBox.x == thisBox.solveButton.x && thisBox.y == thisBox.solveButton.y) {
                thisBox.placed = true;
                solveCounter--;
                ghostboxes.splice(bestPath, 1);
            }
            steps++;
            if (steps > 10000) {
                trash = true;
                break;
            }
        }

        //reset player position
        lvl.setPlayerPos(lvl.playerstartX, lvl.playerstartY)
        px = lvl.playerX;
        py = lvl.playerY;
        lvl.nodes[lvl.playerX][lvl.playerY].used = true;

        //check if a node is unnecessary;
        var unnecessary = [];
        for (var i = 0; i < lvl.nodes.length; i++) {
            for (var j = 0; j < lvl.nodes[0].length; j++) {
                if (!lvl.nodes[i][j].wall && !lvl.nodes[i][j].used) {
                    unnecessary.push(lvl.nodes[i][j]);
                }
                lvl.nodes[i][j].used = false;
                lvl.nodes[i][j].occupied = false;
            }
        }
        if (!trash && unnecessary.length - destroyWall.length > maxUnnecessary.length - minDestroyWall.length) {
            maxUnnecessary = unnecessary;
            minDestroyWall = destroyWall;
            per = n;
        }
    }

    //remove the unnecessary free spaces
    for (var i = 0; i < maxUnnecessary.length; i++) {
        maxUnnecessary[i].wall = true;
    }
    for (var i = 0; i < minDestroyWall.length; i++) {
        minDestroyWall[i].wall = false;
    }
    console.log(String(maxUnnecessary.length) + " walls removed, " + String(minDestroyWall.length) + " walls added")
}