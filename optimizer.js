// optimize the level by solving it in different ways and removing unnecessary free spots
// repeatably optimizing yields different results, since there is a randomness to the algorithm

const optPathCost = 4; //optimizer box path cost
const optPlayerCost = 4; //optimizer player path cost

function optimizeLvl(lvl, iterations) {

    var maxUnnecessary = [];
    var minDestroyWall = [];
    var bestPath = 0;
    var steps = 0;
    lvl.playerX = lvl.playerstartX;
    lvl.playerY = lvl.playerstartY;

    //make the playerpathcost positive
    var tempPlayerCost = playerPathCost;
    playerPathCost = optPlayerCost;
    //free the button positions
    for (var j = 0; j < lvl.buttons.length; j++) {
        lvl.nodes[lvl.buttons[j].x][lvl.buttons[j].y].occupied = false;
        lvl.nodes[lvl.buttons[j].x][lvl.buttons[j].y].used = true;
    }

    //solve the level randomly and check if nodes weren't visited
    for (var n = 0; n < iterations; n++) {

        //create ghostBoxes for solving
        var ghostBoxes = copyBoxes(lvl, true);

        //solve the level
        var solveCounter = ghostBoxes.length;
        var destroyWall = [];
        var trash = false;
        while (solveCounter > 0) {
            //randomly set pathcost for the boxes to negative in order to simulate nondirectional pushing of the boxes
            var tempCost = pathCost;
            pathCost = randomInt(-2, optPathCost);

            //calculate the paths from all boxes to their buttons
            var boxPaths = CalcualteBoxPaths(lvl, ghostBoxes);
            pathCost = tempCost;

            //calculate the player paths to all boxes and choose a RANDOM free path
            var playerPaths = CalcualtePlayerPaths(lvl, ghostBoxes, boxPaths)[0];
            var bestPath = randomInt(0, playerPaths.length);
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
            var thisBox = ghostBoxes[bestPath];
            var currentNode = boxPath[0];
            var diffX = currentNode.x - thisBox.x;
            var diffY = currentNode.y - thisBox.y;

            //if the path is longer than 1, check for a turn
            var stop = 0;
            if (boxPath.length > 1) {
                for (var i = 1; i < boxPath.length; i++) {
                    var nextNode = boxPath[i];
                    if (true == false && diffX == nextNode.x - currentNode.x && diffY == nextNode.y - currentNode.y) {
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
            lvl.setPlayerPos(thisBox.x - diffX, thisBox.y - diffY);


            //check if the moved box is on the button
            if (thisBox.x == thisBox.solveButton.x && thisBox.y == thisBox.solveButton.y) {
                thisBox.placed = true;
                solveCounter--;
                ghostBoxes.splice(bestPath, 1);
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
    playerPathCost = tempPlayerCost;
    console.log(String(maxUnnecessary.length) + " walls added, " + String(minDestroyWall.length) + " walls removed")
}

// optimize the level for all possible button-to-box combinations
// this algorithm scales with n!, it should only be used with a low number of boxes
function optimizeLvl2(lvl, iterations) {
    var boxPermutations = findPermutations(lvl.boxes, lvl.buttons);
    var tempBoxes = copyBoxes(lvl, false);

    for (var i = 0; i < boxPermutations.length; i++) {
        var thisPermutation = boxPermutations[i];
        for (var j = 0; j < thisPermutation.length; j++) {
            lvl.boxes[j] = new Box(thisPermutation[j][0].x, thisPermutation[j][0].y, thisPermutation[j][1])
        }
        optimizeLvl(lvl, iterations);
    }
    lvl.boxes = tempBoxes;
}


function lowCost(value) {
    return value[1] < 50;
}