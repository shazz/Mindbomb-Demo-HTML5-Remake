	/* -----
	Object Entities	
	------	*/

	/********************************************************************************/
	/*										*/
	/*			a player entity						*/
	/*										*/
	/********************************************************************************/
	var MainEntity = me.ObjectEntity.extend(
	{	

		init:function (x, y, settings)
		{
			// define this here, since not defined in tiled
			settings.image = "sprites";
			settings.spritewidth = 64;
			settings.spriteheight = 64;
			
			// call the constructor
			this.parent(x, y, settings);
			
			// set h/v velocity
			// y velocity will be the falling speed
			// x velocity will be used when climbing
			this.setVelocity(4, 8);
			
			// don't use it here
			//this.setMaxVelocity(4, 4);
			
			// add friction only for x vel
			this.setFriction(0.5, 0);
						
			// set the display to follow our position on both axis
			me.game.viewport.follow(this.pos);
			
			// walking animation
			this.addAnimation ("walk",  [1,2,3,4,5,6,7]);
			
			// climbing animation
			this.addAnimation ("climb",  [16,17,18,19,20]);
			
			// falling
			this.addAnimation ("falling",  [23]);
			
			// falling
			this.addAnimation ("waiting",  [0]);			
			
			// set default one
			this.setCurrentAnimation("walk");
			
			// adjust animation timing
			this.animationspeed = me.sys.fps / 40;
			
			// adjust collisionbox
			this.updateColRect(8, 48, -1, -1);
			// some debugging stuff
			//me.debug.renderHitBox = true;
			
		},
	
		
		/* -----

			update the player pos
			
		------			*/
		update : function ()
		{
			// manage all inputs !	
			if (me.input.isKeyPressed('left'))
			{
				// we must allow him to go on x axis
				// while on a ladder, right ?
				if(!this.falling || this.onladder)
				{
					this.vel.x -= this.accel.x * me.timer.tick;
					// flip the sprite
					this.flipX(true);
				}
			}
			else if (me.input.isKeyPressed('right'))
			{
				if(!this.falling || this.onladder)
				{
					this.vel.x += this.accel.x * me.timer.tick;
					// unflip the sprite
					this.flipX(false);
				}
			}
		
			if (me.input.isKeyPressed('up'))
			{	
				if(this.onladder)
				{
					// doClimb is for pussies... ;)
					this.vel.y = -this.accel.x * me.timer.tick;
				}
			}
			else if (me.input.isKeyPressed('down'))
			{	
				if(!this.falling || this.onladder)
				{
					// i use accel.x here so that we have the 
					// same velocity when walking & climbing
					this.vel.y = this.accel.x * me.timer.tick;
				}
			}
			// else if on ladder cancel velocity
			else if (this.onladder) {
				this.vel.y = 0;
			}
			
			// cancel x vel, in this case
			if(this.falling && !this.onladder) {
				this.vel.x = 0;
			}
			
			// check & update player movement
			this.updateMovement();
			
			// check resulting vel, and if we are using the correct animation
			if (this.onladder && (me.input.keyStatus('up') || me.input.keyStatus('down'))) 
			{	
				if (this.vel.y!=0 && !this.isCurrentAnimation("climb"))
				{
				 	this.setCurrentAnimation("climb");
				}
			}
			else if (!this.onladder)
			{
				// stand
				if (this.vel.x==0&&this.vel.y==0) {
					if (!this.isCurrentAnimation("waiting"))
					{
					 	this.setCurrentAnimation("waiting");
					}
				}
				// walk 
				else if (this.vel.x!=0) {
					if (!this.isCurrentAnimation("walk"))
					{
					 	this.setCurrentAnimation("walk");
					}
				}
				// fall
				else if (this.vel.y!=0) {
					if (!this.isCurrentAnimation("falling"))
					{
					 	this.setCurrentAnimation("falling");
					}
				}
			} 
			
			

			// check if entity is moving
			if (this.vel.x!=0||this.vel.y!=0)
			{
				this.parent(this);
				return true;
			}
			// if not true waiting sprite is not displayed :)
			// should add some "hadSpeed" flag 
			return true;
		}

	});