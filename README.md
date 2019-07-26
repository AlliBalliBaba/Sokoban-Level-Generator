# Sokoban-Level-Generator
A random level generator for the classic game **Sokoban**. Test it out here:  https://alliballibaba.github.io/Sokoban-Level-Generator/

##The generator
The principle behind the **generator** is to solve a level with randomly placed boxes, while removing the least amount of walls. 
This is achieved with a **pathfinding algorithm**, that assigns a small cost to a free node and a high cost to a node with a wall.
To prevent the level from being unsolvable, nodes blocked by a box are assigned a very high cost.
Additionally, to make the levels more interesting, free nodes for the player path are assigned a negative cost, which is supposed
to force the player to always take the "longest" path

##The optimizer
The **optimizer** tries to solve the generated level for all possible box to button combinations. Free spaces, that are not used when
solving can be made into a wall again. Unfortunately the computational cost of this algorithm grows with **n!**, where **n** is the
number of boxes in the level. The optimizer is not necessary to generate interesting levels and sometimes adding walls makes
the solution to a level more obvious