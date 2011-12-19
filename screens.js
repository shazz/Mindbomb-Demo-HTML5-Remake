/* -----

	Screen Objects
		
	------	*/

var TLBLoader = me.ScreenObject.extend({
	/*---
	
		constructor
		
		---*/
	init : function() 
	{
		// call the parent constructor
		this.parent(true);
		
		// background image
		this.backgroundImg = me.loader.getImage("loader");		
		
		// font
		this.loader_font = new me.BitmapFont("loader_font", {x:32,y:18});
       		this.loader_font.set("left");

		// setup a callback
		me.loader.onProgress = this.onProgressUpdate.bind(this);

	},
	
	/* ---
		onReset (called by the engine) function
	   ----*/
	
	onResetEvent : function()
	{
		// flag to know if we need to refresh the display
		this.invalidate = false;

		// load progress in percent
		this.loadPercent = 0;
	},
	
	// reset the scroller
	scrollover : function()
	{

	},

	
	// make sure the screen is refreshed every frame 
	onProgressUpdate : function(progress) {
		this.loadPercent = progress;
		this.invalidate = true;
	},

	// make sure the screen is refreshed at every change 
	update : function() 
	{
		if (this.invalidate === true) {
			// clear the flag
			this.invalidate = false;
			// and return true
			return true;
		}
		// else return false
		return false;
	},

	/*---
	
		draw function
	  ---*/

	draw : function(context) 
	{
		// display the background
		context.drawImage(this.backgroundImg, 0 ,0);	
		
		this.loader_font.draw(context, "NOW LOADING",	160, 80-18);
		this.loader_font.draw(context, "THE MAIN MENU",	126, 102-18);
		this.loader_font.draw(context, "CODING BY MANIKIN",	64, 150-18);
		this.loader_font.draw(context, "ALL GRAPHIX AND",	96, 174-18);
		this.loader_font.draw(context, "THE MEGADETH FONT",	64, 198-18);
		this.loader_font.draw(context, "BY SPAZ",	224, 224-18);
		this.loader_font.draw(context, "MUSIC BY MAD MAX",	64, 270-18);
		this.loader_font.draw(context, "USE ARROW KEYS AND",	32, 320-18);
		this.loader_font.draw(context, "SPACE TO ENTER DEMOS",	0, 342-18);
		
	},
	
	/*---
	
		called by the engine when switching state the loader
	  ---*/
	
	onDestroyEvent : function()
	{
		// "nullify" all objects
		this.backgroundImg = loader_font = null;
	
  	},


});
