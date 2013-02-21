var bot,processMessage,isEmpty,stringTo,directions,direction;

function init(_bot,_processMessage,_isEmpty,_stringTo)
{
	bot=_bot;
	processMessage=_processMessage;
	isEmpty=_isEmpty;
	stringTo=_stringTo;
// 	directions=[new vec3(0,0,1),new vec3(0,0,-1),new vec3(1,0,0),new vec3(-1,0,0)];
// 	direction=directions[0];
}


function jump(u,done)
{
	bot.setControlState('jump', true);
	bot.setControlState('jump', false);
	setTimeout(done,400);// change this
}

function up(u,done) // change this a bit ?
{
	
	  //if(bot.heldItem===null) {done(true);return;} // replace this with something checking whether the bot has a block to build ?
  bot.setControlState('jump', true);
  var targetBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
  var jumpY = bot.entity.position.y + 1;
  bot.on('move', placeIfHighEnough);
  
  function placeIfHighEnough() {
    if (bot.entity.position.y > jumpY) {
      //bot.placeBlock(targetBlock, vec3(0, 1, 0));
      //dirty
	  processMessage(u,"sbuild r0,-1,0",function(){ // this is very wrong, solve it somehow (doesn't take into account the parameter of the callback as in achieve)
		bot.setControlState('jump', false);
		bot.removeListener('move', placeIfHighEnough);
		setTimeout(done,400);// could (should ?) be replaced my something checking whether the bot is low enough/has stopped moving
	  });
    }
  }
}

function center(p)
{
	return p.floored().offset(0.5,0,0.5);
}

function scalarProduct(v1,v2)
{
	return v1.x*v2.x+v1.y*v2.y+v1.z*v2.z;
}

function norm(v)
{
	return Math.sqrt(scalarProduct(v,v));
}

function isFree(pos)
{
	return isEmpty(pos) && isEmpty(pos.offset(0,1,0));
}

function move(s,u,done)
{
	var goalPosition=stringTo.stringToPosition(s,u);// floor ?
	goalPosition=center(goalPosition);
	bot.lookAt(goalPosition.offset(0,bot.entity.height,0));
	bot.setControlState('forward', true);
	var arrive=setInterval((function(goalPosition,done){return function()
	{
		if(/*scalarProduct(goalPosition.minus(bot.entity.position),d)<0 || */goalPosition.distanceTo(bot.entity.position)<0.3 || !isFree(goalPosition)/*(norm(bot.entity.velocity)<0.01)*/)
		{
			bot.setControlState('forward', false);
			clearInterval(arrive);
			done();// maybe signal an error if the goal position isn't free (same thing for move to)
		} else bot.lookAt(goalPosition.offset(0,bot.entity.height,0));
	}})(goalPosition,done),50);	
}


function moveTo(s,u,done)
{
	var goalPosition=stringTo.stringToPosition(s,u);
	if(goalPosition!=null && isFree(goalPosition))
	{
		if(goalPosition.distanceTo(bot.entity.position)>=1)
		{
			bot.navigate.to(goalPosition);//use callback here ?
			bot.once("stop",done);
		}
		else done();
	} else done();
}

function stopMoveTo(u,done)
{
	bot.navigate.stop();
	done();
}




// function chercherDirection()
// {
// 	var i;
// 	while(1)
// 	{
// 		i=Math.floor(Math.random()*4);
// 		if(isFree(i)) {return i;}
// 	}
// 	return directions[i];
// }
// 
// function conditionAvancer(dejaEssaye)
// {
// 	return false;
// }
// 
// function avancer()
// {
// 	if(!isFree(direction))
// 	{
// 		direction=chercherDirection();
// 	}
// 	e=move(direction.x,direction.y,direction.z);
// 	return e;
// }

module.exports={
		jump:jump,
		up:up,
		move:move,
		moveTo:moveTo,
		stopMoveTo:stopMoveTo,
		init:init
};