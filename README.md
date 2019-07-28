# Sokoban-Level-Generator
A random level generator for the classic game **Sokoban**. 
Test it out here:  https://alliballibaba.github.io/Sokoban-Level-Generator/

![alt text](https://github.com/AlliBalliBaba/Sokoban-Level-Generator/blob/master/assets/example.png)

## The generator
The principle behind the **generator** is to solve a level with randomly placed boxes, while removing the least amount of walls. This is achieved with a pathfinding algorithm, that assigns a small cost to a free node and a high cost to a node with a wall. To prevent the level from being unsolvable, nodes blocked by a box are assigned a very high cost. 
Additionally, to make the levels more interesting, free nodes for the player path are assigned a negative cost, which is supposed to force the player to always take the "longest" path.

## The optimizer
The **optimizer** tries to randomly solve the generated level in many different ways. Free spaces, that are not used when solving can be made into a wall again. Even though the optimizer is not necessary to generate interesting levels, it can be used to make a level more difficult. Adding walls can sometimes make the solution to a level more obvious though.
I've also tried to make the optimizer solve the level for all possible button-to-box combination. Unfortunately the the number of box-to-button combinations grows with **n!**, where **n** is the number of boxes in the level (reminder: 10! = 3628800). This means that solving for all combinations only really makes sense for a low amount of boxes.

## Improvements
The main problem with the generator is that it cannot really distinguish if a level is difficult or not. Occasionally very easy levels with an obvious solution are being created, which partially depends on the initial box placement and can't really be prevented using the generator alone. It might be interesting to create an algorithm, that can generate levels for a set difficulty.
