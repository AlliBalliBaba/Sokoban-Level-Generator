// the idea behind this pathfinding algorithm is to traverse the least amount of walls
// additionally the player will always take the longest available free path when choosing a box

const wallCost = 100; //the cost for traversing a wall
var pathCost = 1; //the cost for traversing an unoccupied node
var playerPathCost = -1; //the player cost for traversing an unoccupied node
const boxCost = 10000; //the cost for traversing an occupied node

class Pathfinder {

    constructor(Level, startX, startY, endX, endY) {
        this.level = Level;
        this.nodes = this.level.nodes;
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.open = [];
        this.closed = [];
    }

    //return path and cost, cost of player-path and box-path can differ
    returnPath(isBox) {
        this.open.push(this.nodes[this.startX][this.startY]);
        while (this.open.length != 0) {
            var thisNode = this.open.shift();

            if (thisNode.x == this.endX && thisNode.y == this.endY) {
                this.open.push(thisNode);
                return this.sumPath(thisNode);
            } else {
                thisNode.closed = true;
                this.closed.push(thisNode);
                this.checkNeighbor(thisNode.x + 1, thisNode.y, thisNode, isBox);
                this.checkNeighbor(thisNode.x - 1, thisNode.y, thisNode, isBox);
                this.checkNeighbor(thisNode.x, thisNode.y + 1, thisNode, isBox);
                this.checkNeighbor(thisNode.x, thisNode.y - 1, thisNode, isBox);
            }
        }
        console.log("no path found");
        return this.sumPath(thisNode);
    }

    //recreate the path starting from the last node
    sumPath(endNode) {
        var path = [];
        var cost = endNode.cost;
        while (endNode.parent != null) {
            path.unshift(endNode);
            endNode = endNode.parent;
        }
        this.resetNodes();
        return [path, cost]
    }

    //check a neighboring node
    checkNeighbor(x, y, parent, isBox) {
        if (checkBoundaries(this.nodes, x, y)) {
            var thisNode = this.nodes[x][y];
            if (!thisNode.closed && !thisNode.checked) {
                thisNode.cost = this.calculateCost(thisNode, parent, isBox);
                thisNode.f = thisNode.cost + Math.abs(x - this.endX) + Math.abs(y - this.endY);
                thisNode.parent = parent;
                thisNode.checked = true;
                addToSortedArray(this.open, thisNode, fComparer);
            } else if (!thisNode.closed) {
                var cost = this.calculateCost(thisNode, parent, isBox);
                if (cost < thisNode.cost && thisNode.parent.parent != null) {
                    thisNode.cost = cost;
                    thisNode.f = thisNode.cost + Math.abs(x - this.endX) + Math.abs(y - this.endY);
                    thisNode.parent = parent;
                }
            }
        }
    }

    //calculate the cost for a  node 
    calculateCost(node, parent, isBox) {
        var tempCost = 0;
        if (node.occupied) {
            tempCost = parent.cost + boxCost;
        } else {
            if (isBox) {
                tempCost = (node.wall ? parent.cost + wallCost : parent.cost + pathCost);
            } else {
                tempCost = (node.wall ? parent.cost + wallCost : parent.cost + playerPathCost);
            }
        }
        // if the path is calculated for a box, the player path also has to be included
        // the player has to walk around the box when changing directions
        // there are always 2 ways to walk around the box for each of the 8 situations:
        if (isBox && parent.parent != null) {
            var cost1 = 0;
            var cost2 = 0;

            if (node.x - 1 == parent.x && node.x - 2 != parent.parent.x) {
                //case 1: node is right of parent
                if (node.y - 1 == parent.parent.y) {
                    //case 1.1: node is up right of parent.parent
                    cost1 = this.nodeCost(node.x - 2, node.y) + this.nodeCost(node.x - 2, node.y - 1)
                    cost2 = this.nodeCost(node.x, node.y - 1) + this.nodeCost(node.x, node.y + 1) + this.nodeCost(node.x - 1, node.y + 1) +
                        this.nodeCost(node.x - 2, node.y + 1) + this.nodeCost(node.x - 2, node.y);
                } else {
                    //case 1.2: node is down right of parent.parent
                    cost1 = this.nodeCost(node.x - 2, node.y) + this.nodeCost(node.x - 2, node.y + 1)
                    cost2 = this.nodeCost(node.x, node.y - 1) + this.nodeCost(node.x, node.y + 1) + this.nodeCost(node.x - 1, node.y - 1) +
                        this.nodeCost(node.x - 2, node.y - 1) + this.nodeCost(node.x - 2, node.y);;
                }
            } else if (node.x + 1 == parent.x && node.x + 2 != parent.parent.x) {
                //case 2: node is left of parent
                if (node.y - 1 == parent.parent.y) {
                    //case 2.1: node is up left of parent.parent
                    cost1 = this.nodeCost(node.x + 2, node.y) + this.nodeCost(node.x + 2, node.y - 1);
                    cost2 = this.nodeCost(node.x, node.y - 1) + this.nodeCost(node.x, node.y + 1) + this.nodeCost(node.x + 1, node.y + 1) +
                        this.nodeCost(node.x + 2, node.y + 1) + this.nodeCost(node.x + 2, node.y);
                } else {
                    //case 2.2: node is down left of parent.parent
                    cost1 = this.nodeCost(node.x + 2, node.y) + this.nodeCost(node.x + 2, node.y + 1);
                    cost2 = this.nodeCost(node.x, node.y - 1) + this.nodeCost(node.x, node.y + 1) + this.nodeCost(node.x + 1, node.y - 1) +
                        this.nodeCost(node.x + 2, node.y - 1) + this.nodeCost(node.x + 2, node.y);;
                }
            } else if (node.y - 1 == parent.y && node.y - 2 != parent.parent.y) {
                //case 3: node is above parent
                if (node.x - 1 == parent.parent.x) {
                    //case 3.1: node is right up of parent.parent  
                    var cost1 = this.nodeCost(node.x, node.y - 2) + this.nodeCost(node.x - 1, node.y - 2);
                    var cost2 = this.nodeCost(node.x - 1, node.y) + this.nodeCost(node.x + 1, node.y) + this.nodeCost(node.x + 1, node.y - 1) +
                        this.nodeCost(node.x + 1, node.y - 2) + this.nodeCost(node.x, node.y - 2);
                } else {
                    //case 3.2: node is left up of parent.parent  
                    var cost1 = this.nodeCost(node.x, node.y - 2) + this.nodeCost(node.x + 1, node.y - 2);
                    var cost2 = this.nodeCost(node.x - 1, node.y) + this.nodeCost(node.x + 1, node.y) + this.nodeCost(node.x - 1, node.y - 1) +
                        this.nodeCost(node.x - 1, node.y - 2) + this.nodeCost(node.x, node.y - 2);;
                }
            } else if (node.y + 1 == parent.y && node.y + 2 != parent.parent.y) {
                //case 4: node is under parent
                if (node.x - 1 == parent.parent.x) {
                    //case 4.1: node is right down of parent.parent
                    var cost1 = this.nodeCost(node.x, node.y + 2) + this.nodeCost(node.x - 1, node.y + 2);
                    var cost2 = this.nodeCost(node.x - 1, node.y) + this.nodeCost(node.x + 1, node.y) + this.nodeCost(node.x + 1, node.y + 1) +
                        this.nodeCost(node.x + 1, node.y + 2) + this.nodeCost(node.x, node.y + 2);
                } else {
                    //case 4.2: node is left down of parent.parent
                    var cost1 = this.nodeCost(node.x, node.y + 2) + this.nodeCost(node.x + 1, node.y + 2);
                    var cost2 = this.nodeCost(node.x - 1, node.y) + this.nodeCost(node.x + 1, node.y) + this.nodeCost(node.x - 1, node.y + 1) +
                        this.nodeCost(node.x - 1, node.y + 2) + this.nodeCost(node.x, node.y + 2);;
                }
            }
            tempCost += (cost1 < cost2 ? cost1 : cost2);
        } else if (isBox) {
            if (node.x - 1 == parent.x) {
                tempCost += this.nodeCost(node.x - 2, node.y);
            } else if (node.x + 1 == parent.x) {
                tempCost += this.nodeCost(node.x + 2, node.y);
            } else if (node.y - 1 == parent.y) {
                tempCost += this.nodeCost(node.x, node.y - 2);
            } else if (node.y + 1 == parent.y) {
                tempCost += this.nodeCost(node.x, node.y + 2);
            }

        }

        //for optimizing prefer used nodes
        if (node.used) {
            tempCost -= 5;
        }
        return tempCost;
    }

    //calculate the cost of a position
    nodeCost(x, y) {
        if (checkBoundaries(this.nodes, x, y)) {
            var node = this.nodes[x][y];
            if (node.occupied) {
                return boxCost;
            } else {
                return (node.wall ? wallCost : playerPathCost);
            }
        } else {
            return boxCost;
        }
    }

    //reset the level's nodes for further pathfinding
    resetNodes() {
        this.open.forEach(function(node) {
            node.checked = false;
            node.closed = false;
            node.parent = null;
            node.cost = 0;
        })
        this.closed.forEach(function(node) {
            node.checked = false;
            node.closed = false;
            node.parent = null;
            node.cost = 0;
        })
    }
}

class Node {
    //initialize each node as an unoccupied wall
    constructor(X, Y) {
        this.x = X;
        this.y = Y;
        this.f = 0; //path-cost-estimation
        this.cost = 0; //path-cost
        this.closed = false; //variable for pathfinding
        this.checked = false; //variable for pathfinding
        this.wall = true; //check if node has a wall
        this.occupied = false; //check if node is occupied(for pathfinding)
        this.parent = null; //node parent for pathfinding
        this.hasBox = false; //check if node has a box
        this.used = false; //variable for optimizing
    }
}