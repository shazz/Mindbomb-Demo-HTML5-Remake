/* -----

	Screen Objects
		
	------	*/

var todoScreen = me.ScreenObject.extend({
	/*---
	
		constructor
		
		---*/
	init : function() {
		// call the parent constructor
		this.parent(true);
		
		// init canvas and offscreen canvas
		this.maincanvas=new canvas(me.video.getScreenCanvas()); // reuse melonJS main canvas	
		this.distlogocanvas = new canvas(392,220);
		this.scrollcanvas = new canvas(640,100);
		
		this.logoTLB = new image(me.loader.getImage('BigSprite'));
		this.logoTLB.draw(this.distlogocanvas,0,0);		
		
		this.logofxparam=[
			{value: 0, amp: 30, inc:0.03, offset: -0.05},
			{value: 0, amp: 30, inc:0.01, offset:  0.08}
	      	];
	      	this.logofx=new FX(this.distlogocanvas,this.maincanvas,this.logofxparam);
	      	
		this.scrollfxparam=[
			{value: 0, amp: 30, inc:0.03, offset: -0.05},
			{value: 0, amp: 100, inc:0.01, offset: -0.04}
	      	];
	      	this.scrollfx=new FX(this.scrollcanvas,this.maincanvas,this.scrollfxparam);	      	
		
		this.font = new image(me.loader.getImage('LoaderFonts'));
		this.font.initTile(32,18,32);
		
		this.scrolltext = new scrolltext_horizontal();
		this.scrolltext.scrtxt="THIS SCREEN HAS NOT YET BEEN IMPLEMENTED ! JOIN THE CREW !!!!    ";
		this.scrolltext.init(this.scrollcanvas,this.font,3);


		
	},
	
	/* ---
		onReset (called by the engine) function
	   ----*/
	
	onResetEvent : function()
	{
		
		// use requestAnimFrame
		me.sys.useNativeAnimFrame = false;
		
		this.maincanvas.fill('#000000');
		
		// play menu song
		//me.audio.playTrack("case4two");
	},
	

	// make sure the screen is refreshed at every change 
	update : function() 
	{
		// if press ESC
		if (me.input.isKeyPressed('exit'))
		{
			// go back to menu
			me.state.change(me.state.PLAY);
		}
		return true;
	},

	/*---
	
		draw function
	  ---*/

	draw : function(context) 
	{
		
		this.maincanvas.fill('#000000');
		this.scrollcanvas.clear();
		
		this.logofx.siny(180,60);
		
		this.scrolltext.draw(0);
		this.scrollfx.siny(0,200);
		

		//this.logoTLB.draw(this.maincanvas,0,0);
			
	},
	
	/*---
	
		called by the engine when switching state
	  ---*/
	
	onDestroyEvent : function()
	{
		// stop the current track
		me.audio.stopTrack();
	}


});
