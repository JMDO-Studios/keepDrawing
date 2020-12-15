##### KeepDrawing!
##KeepDrawing
A drawing game by Jeff Garber, Mark Guinn, Oscar Sanchez, and Doug Miller

##Motivation
We wanted to build a fun, interactive game using handtracking technology in a 3D environment.

##Installation
To run locally:
npm install
npm run start-dev

##Tech/framework used
Handtrack.js
Babylon
Twilio
Socket.io
Resemble.js
React
Express
Axios

##Play the game at 
https://keepdrawing.herokuapp.com/

##Instructions
SetUp Instructions:
  When instructed, enter a username and press submit
  Once there enough players you will automatically go to the game

Gameplay Instruction:
  There are two players on a team
  The game is timed
  Teams consist of a Clue Giver and a Drawer
  Roles switch after each image
  Use hand motions to draw images on the canvas
  The Clue Giver will describe to their teammate what to draw
  Use the buttons to start or stop drawing, erase, and clear
  The Clue Giver can submit their attempt to be scored and move on
  The closer your drawing is to the clue, the more points you will receive
  The team with the most points when the timer runs out is the winner