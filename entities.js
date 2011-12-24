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
			this.setVelocity(5, 8);
			
			// don't use it here
			//this.setMaxVelocity(4, 4);
			
			// add friction only for x vel
			this.setFriction(0.4, 0);
			
			// after a door, replace the guy!
			if (jsApp.entityPos != null) 
			{
				this.pos.x = jsApp.entityPos.x;
				this.pos.y = jsApp.entityPos.y;
			}			
						
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
	
			// change default camera dead zone, bad fix
			me.game.viewport.setDeadzone(this.width / 6, (this.height-64));			
			
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
				if(!this.falling)
				{
					this.vel.x -= this.accel.x * me.timer.tick;
					// flip the sprite
					this.flipX(true);
				}
			}
			else if (me.input.isKeyPressed('right'))
			{
				if(!this.falling)
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
			
			// check for collision with sthg
			me.game.collide(this);
			// actually we can also check here when we collide with 
			// doors, by checking the object return by the function.			
			
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
	
	/*****************************************
	 *										 *
	 *			a door entity				 *
	 *										 *
	 *****************************************/
	var DoorEntity = me.InvisibleEntity.extend(
	{	
		init:function (x, y, settings)
		{
			// call the constructor
			this.parent(x, y, settings);
			
			// settings.demo_name was defined in Tiled
			this.demo_name = settings.demo_name;
		},	

		// collision notification, something (obj) touched the door !
		onCollision : function (res, obj)
		{
			if (me.input.isKeyPressed('enter'))
			{
				// save the player last pos
				
				// if screen exists, go for it !
				jsApp.entityPos = obj.pos.clone();
				if(!eval("jsApp.ScreenID." + this.demo_name + "==undefined"))
				{
					me.state.change(this.demo_name);
				}
				else
				{
					me.state.change(jsApp.ScreenID.TODO);
				}
			}
		},
		
	});	
	
	/*****************************************
	 *										 *
	 *			an overlay entity				 *
	 *										 *
	 *****************************************/
	var OverlayObject = me.InvisibleEntity.extend({
    
		init: function(x, y) 
		{
			// call the parent constructor
			this.parent(x, y, {width:me.game.currentLevel.realwidth, height:me.game.currentLevel.realheight});
			
			// CODEF CODE
			
			// reuse melonJS main canvas
			this.maincanvas = new canvas(me.video.getScreenCanvas());
			
			this.sprites = new Array();
			this.spritesPosX = new Array();
			this.spritesPosY = new Array();
			this.x_speed = 0.05;
			this.y_speed = 0.05;


			this.nbSprites = 8;
			this.spritesPosX[0]=160+(0*32);
			this.spritesPosX[1]=160+(1*32);
			this.spritesPosX[2]=160+(2*32);
			this.spritesPosX[3]=160+(3*32);
			this.spritesPosX[4]=160+(6*32);
			this.spritesPosX[5]=160+(7*32);
			this.spritesPosX[6]=160+(8*32);
			this.spritesPosX[7]=160+(9*32);
			
			var interspace = 0.3;
			for(var i=0;i<4;i++)
			{
				this.spritesPosY[i]=interspace*(i+1);
			}
			for(var i=4;i<this.nbSprites;i++)
			{
				this.spritesPosY[i]=interspace*i;
			}			
			this.sprites[0] = new image(me.loader.getImage("sprite_l"));
			this.sprites[1] = new image(me.loader.getImage("sprite_o"));
			this.sprites[2] = new image(me.loader.getImage("sprite_s"));
			this.sprites[3] = new image(me.loader.getImage("sprite_t"));
			this.sprites[4] = new image(me.loader.getImage("sprite_b"));
			this.sprites[5] = new image(me.loader.getImage("sprite_o"));
			this.sprites[6] = new image(me.loader.getImage("sprite_y"));
			this.sprites[7] = new image(me.loader.getImage("sprite_s"));
					
			this.logo = new image(me.loader.getImage("menulogo"));					
					
			this.y_origin = 280;
			this.y_amplitude = 60;
			this.y_angFreq = 1.16;
			
			this.font = new image(me.loader.getImage("fonts"));
			this.font.initTile(64,64,32);
			this.scrolltext = new scrolltext_horizontal();
			this.scrolltext.scrtxt="           WHO SAID MEGA DEMO?   WHERE I CAN'T SEE IT!   THE LOST BOYS IN A STATE OF IMMENSE PROUDNESS (LOOK AT THAT ILLITERATE ENGLISH!) PRESENT THEIR MIND BOMB DEMO!!! THIS DEMO WAS COMPLETED ON THE 18TH APRIL 1990 IN DEN BOSCH HOLLAND BY MANIKIN OF THE LOST BOYS AIDED AND ABBETTED BY THE DIGITAL INSANITY CORPORATION!!. FIRST AN IMMENSE APOLOGY TO AENIGMATICA. I AM REALLY SORRY BUT A COMBINATION OF LACK OF SPACE AND TIME MEANT THAT I COULDN'T GET YOUR SCREENS ONTO THE DEMO! I AM INCREDIBLY SORRY!. AND NOW THE SCROLL WRITTEN AT AN EARLIER DATE IN MANCHESTER ENGLAND!!!  THE TIME IS 12:33AM ON THE 18TH FEBRUARY 1990 AND NOW THAT WE ARE THOROUGHLY PISSED OFF WITH PLAYING CHAOS STRIKES BACK WE DECIDED TO GET OFF OUR ARSES AND WRITE THE MAIN MENU SCROLL.  THIS IS MANIKIN, SAMMY JOE WITH 2 TOTAL WEIRDO FRIENDS WHO LIVE WITH MANIKIN IN MANCHESTER (IAN AND SIMON!!). WE HAVE SPENT THE LAST EVENING (DAY!) PLAYING THAT FUCKING GAME AND WE ARE NOW HALF DRUNK (!!) AND IN THE MOOD FOR SPURIOUS  BULLSHIT (MANIKIN BEING AN EXPERT AT THIS!). THE ONLY REASON THAT THE OTHER TWO NON LOST BOYS ARE HERE IS THAT THEY HAVE HAD TO SPEND THE LAST 4 MONTHS LISTENING TO THE ST KEYCLICK SO I GUESS THEY DESERVE SOME INVOLVMENT! (HAVE YOU EVER TRIED GETTING TO SLEEP AT 3AM, WHEN ALL YOU CAN HEAR IS BEEP, BEEP, FUCKING BEEP ?). ANYWAY NOW SOME MORE SERIOUS SHIT. THE DEMO IS PROBABLY THE BIGGEST EVER PRODUCED ON THE ST. IT HAS AT LEAST 20 SCREENS, MOSTLY BY THE LOST BOYS, WITH SPECIAL GUEST SCREENS BY DIGITAL INSANITY, FOXX AND ANDY THE ARFLING (BBC). SPECIAL THANKS MUST GO TO IAN, PHIL AND SIMON (THEY'RE PESTERING ME TO PUT THIS IN!) FOR INVALUABLE CONSTRUCTIVE CRITISM (OH TIM THATS FUCKING CRAP THAT IS!! DO IT LIKE THIS). WE ARE CURRENTLY HALF WAY THROUGH A BOTTLE OF VODKA (WODKA IF YOUR GERMAN!) SO IF THE SPELLING DETERIORATES DURING THE SCROLL DON'T BLAM MEE ...???! I GUESS WE SHOULD BE DOING THE  GREETINGS ABOUT NOW BUT THATS BLOODY BORING SO YOU'LL HAVE TO WAIT A BIT. WE SHOULD ACTUALLY HAVE BEEN AT THE NIGHTBREED COPY PARTY BUT THEY CANCELLED IT SO WE DECIDED TO GET PISSED INSTEAD (PRIORITIES RIGHT THERE I THINK!).   WELL TOMORROW (19TH) IS MY (MANIKIN'S) BIRTHDAY (19 AT LAST!) AT THIS MOMENT IT IS SPAZ'S BIRTHDAY (HE IS 16 NOW!) AND AT THIS VERY MOMENT HE IS PROBABLY ROLLING AROUND IN A DRUNKEN STUPOR AT HIS PARTY (AFTER HALF A PINT OF TIZER!!) , (DOGCOCK) THAT FOR THE LESS WELL EDUCATED WAS A COMMENT FROM THE NORTHERN TWATLANDS (LUV MANIKIN). (BETTER THAN BEING A SOUTHERN, SHANDY DRINKIN PIECE OF SHITE. LUV IAN ...) (THIS IS GETTING A BIT AREAIST ISN'T IT,  LUV SIMON, ALTHOUGH I HAVE TO AGREE BEING A PROFESSIONAL NORTHERNER MYSELF)  (DEUTSCHLAND UBER ALLES, LUV SAMMY JOE)  WHO WON THE WAR SHITBREATH, LUV MANIKIN, IAN AND SIMON. END OF CONVERSATION!!!!!!  OK ENOUGH OF THAT SHIT, THE LOST BOYS ARE NOW ONLY A 3 MEMBER CREW, THAT BEING SAMMY JOE, SPAZ AND MANIKIN, SPROG HAS NOW LEFT THE LOST BOYS TO PERSUE THE FULL TIME JOB OF BEING A SMALL LONG HAIRED HEAVY METAL FREAK!!! ( HE ACTUALLY DIED IN A CAR CRASH IN SWEDEN, LIKE CLIFF BURTON??? ). SPAZ HAS DONE MOST OF THE GRAPHICS IN THIS DEMO, ALL CODING ON ALL LOST BOYS SCREENS IS BY MANIKIN, SAMMY JOE LOOKED AFTER ALL THE OTHER INTERESTS OF  THE LOST BOYS CORPORATION ( SOUNDS GOOD HUH!!). THAT BEING THE LOST BOYS PUBLIC DOMAIN LIBRARY (ADDRESS ELSEWHERE!!)  WELL I GUESS THAT YOU HAVE NOW WAITED LONG ENOUGH SO NOW IT IS TIME FOR THE GREETINGS:-  WELL ALMOST TIME FOR THE GREETINGS FIRST WE HAVE AN APPEAL TO MAKE. THIS GOES TO ALL DEMO WRITERS, IF IN STOS, ASSEMBLER, GFA, OR ANY OTHER LANGUAGE. WE WANT YOUR DEMOS!!!  IT SOMETIMES SEEMS TO TAKE US MONTHS TO GET HOLD OF DEMOS.  WE ALWAYS RETURN DISKS USUALLY WITH SOMETHING NICE ON THEM AND WE WILL ALSO SPREAD YOUR PRODUCTS FURTHER AS WELL, SO PLEASE LET US HAVE THE FRUITS OF YOUR LOINS ( OR EVEN YOUR COMPUTERS!!!)   AND NOW BY POPULAR DEMAND.  FIRST OF ALL THE VERY SPECIAL GREETINGS. MEGA GREETING AND MEGA THANKS GO TO CIA OF GALTAN 6 FOR SAVING MY LIFE AND MY MENU AND FOR AIDING AND ABETTING THE CRIME OF THE CENTURY!!!, HOMEBOY (S.T.M. A VERY GOOD SOFTWARE SUPPLIER!!), STEFAN POSTHUMA AND RICHARD KARSMAKERS ( 2 OF THE ZANIEST GUYS EVER TO GRACE THE EARTH. SEE YOU SOON GUYS, WE ARE LOOKING FORWARD TO IT!!)  (FOR A SPECIAL LITTLE MESSAGE FROM RICK THE DICK LOOK AT TRACK 81 WITH DISK MONITOR!!), TEX (THE OLD MEN OF THE DEMO WORLD! QUITE AN ACHIEVMENT WHEN YOUR ALL UNDER 25! A SPECIAL GREETING TO THE INCREDIBLY BIG ONE! HI ES!), THE CAREBEARS (YOUR CUDDLY DEMOS WERE THE BEST, BUT WE THINK THAT WE HAVE BEATEN YOU, UNLESS YOU KNOW BETTER! AND OF COURSE YOU DO SO NOW I WAIT WITH BAITED BREATH FOR YOUR NEXT DEMO. ALSO MANY THANKS FOR YOUR HELP NICK!!!), PETER NEWCOMBE ( FOR SUPPORT BEYOND THE CALL OF DUTY, IE THE PC 	SHOW STAND, AND FOR BEING ONE OF THE MOST GENUINELY NICE GUYS WE HAVE EVER HAD THE PLEASURE OF MEETING!), CAMY MAERTENS AND SIMON RUSH AT BUDGIE UK (GREAT IDEA GUYS, MAKING MONEY FROM DEMOS, WE BELIEVE IT CAN BE DONE!!!), ALL THE GUYS AT THALION SOFTWARE ESPECIALLY HOLGER (SEE YOU SOON, AND THANKS FOR THE JOB ,IT IS A CHANCE IN A MILLION!!), MUG (MIKE YOU TOO ARE ONE OF THE NICEST BLOKES WE HAVE EVER MET, THANKS FOR YOUR FRIENDSHIP!!), THE REPLICANTS (WE BELIVE THAT YOUR DISK SPREADING METHOD IS THE FUNNIEST EVER, MAYBE YOU SHOULD BE THE TRANS-GRANDE-VITESSE CREW!!!), FOXX ( YET ANOTHER PERSON WITH WHOM I AM GREATLY LOOKING FORWARD TO MEETING UP WITH!!), ANDY THE ARFLING , PHIL AND CRISPY NOODLE ( YOU ARE THE ONLY OTHER LONDON CREW WITH ANY STYLE, THANKS (ANDY) FOR THE SCREEN AND CRISPY FOR THE WICKED MUSIC!! AND PHIL FOR THE WICKED WIT. BY THE WAY WHAT IS YOUR  CREW TOTAL FOR WRITTEN OFF CARS NOW!!!), SEWER RAT OF SEWERSOFT ( THE FURTHEST CONTACT WE GOT FROM THE DEF DEMO!! I THINK AUSTRALIA IS ABOUT AS FAR AS IT IS LIKELY TO GET!!!), OVERLANDERS ( YOUR DEMO MENUS ARE VERY GOOD, ) BUT WE TRUST THAT THIS WILL NOT BE APPEARING IN THEM !!!), AUTOMATION ( FOR THE BEST GAMES COMPACTS ON THE ST, IN PARTICULAR TO VAPOUR FOR HACKING CHAOS AND HENCE ALMOST CAUSING THE DOWNFALL OF CIVILIZATION AS WE KNOW IT!),  NEWLINE ( WHEN IS YOUR BIG ALLIANCE DEMO COMING OUT??), TREVOR 'THE PERVE' ( THE DREAM WEAVERS ), HACKATARIMAN (ANOTHER MEGA SOFTWARE SUPPLIER FROM ENGLAND! I THINK YOU SHOULD BE NEAR THE START OF THIS LIST OOOPS! ), SOME OF THE INNER CIRCLE (ST SQUAD, NICE TWISTER! DYNAMIC DUO, NICE DEMOS, GIZMO OF ELECTRONIC IMAGES, LONG TIME NO HEAR GUY!) , HARVEY LODDER ( GOOD PD DEMOS.), THE SKUNK (THANKS FOR THE DISKS AND THE USE OF THE MEGA ST AT 16 BIT FAIR!! AND FOR ALL YOUR SUPPORT, HOPE THIS SELLS WELL FOR BOTH OUR SAKES!), 16-32 BIT PD LIBRARY (THANKS FOR THE  DISKS AND THE SUPPORT!), PAGE 6 (LES ELLINGHAM AND YOUR CHARMING WIFE FOR PUTTING UP WITH OUR CONSTANT USE OF YOUR ST AT THE 16 BIT FAIR!), SOUTH WEST SOFTWARE LIBRARY, ROUND TABLE PD, ST CLUB, OLIVER (FROM GENEVA, NICE HOLIDAY LAST SUMMER, THANKS LUV SAMMY JOE!), DYLAN, MATTY, DEREK ( YOU HAVE THE BEST DOPE DEREK THANKS FOR MAKING MY BIRTHDAY A HIGH POINT!), VOLKER (AMIGA GUYS ARE NOT ALL BAD!), HENNING (THE GUARDIAN ANGEL AND ALL HIS FRIENDS), N.HAAS (SHADOW FAX), OBERJE (NICE NEW YEAR DEMO GUY!!), LES PLAYER ( FROM GFA DATA MEDIA UK, THANKS FOR THE TRANSLATION JOBS! YOU MAKE GREAT  PRODUCTS!), MICRODEAL (IN PARTICULAR JOHN SYMES AND ROB POVEY, QUARTET IS SIMPLY THE BEST 4 TRACK WE HAVE EVER SEEN!!!), MJS, THE GARLIC EATERS (GOOD DEMO), NIGHTBREED (SHAME YOU PARTY DID NOT COME OFF BUT WE DID AT LEAST GET OUR MAIN  SCROLL WRITTEN INSTEAD!!), THE BATS CREW (LATEST CONTACTS IN ISRAEL, GOOD DEMO!), KRUZ CREW (YEAH, THE FINS!!!), THE EQUALIZER, PIXEL TWINS, MPH, PREDATORS, JOHN PASS (DEMO CLUB!), WHACK, S.C.WEDGE, THE CONSTELLATIONS (THANKS FOR ALL THE FRENCH DEMOS ANDROMEDA.), AENIGMATICA (AGAIN I AM REALLY SORRY!),, DAD AND FRIENDS (NO NOT MY FATHER, THERE FROM FRANCE!!), THE ALIENS, MAX HEADROOM (LADDIE!!), AXESS, ALEX NGUYEN, AGGRESSION (XENIT AND LANCELOT!), WATCHMAN, POMPEY PIRATES       WELL THAT JUST ABOUT COVERS ALL OF OUR IMMEDIATE FRIENDS AND CONTACTS (I'M PRAYING WE HAVE NOT FORGOTTEN ANYONE!!) NOW SOME GREETINGS TO PEOPLE WE DON'T (IN ALL CASES) KNOW, BUT DO GREATLY ADMIRE!        SYNC (GREAT SCREEN ON SOWATT), OMEGA (ANOTHER GREAT SCREEN ON SOWATT, BEST SINUS DOTS I HAVE SEEN!, AND NEW YEAR DEMO 2 IS EXCELLENT!), MEDWAY BOYS (NICE COMPACTS, I AM GLAD YOU LIKE OUR ONE PLANE SCROLLER FONT OMEN!!),  ALL MEMBERS OF THE UNION NOT COVERED IN THE BIT ABOVE (LEVEL 16, DELTAFORCE, SOFTRUNNER GROUP ETC ), XXX INTERNATIONAL, FLEXIBLE FRONT, 2 LIFE CREW, NO CREW, VISION, NORDIC CODERS, FUSION, BLACK MONOLITH CREW, GIGABYTE CREW,  BOSS, COPY SERVICE STUTTGART (SORRY WE COULD NOT MAKE YOUR COPY PARTY LAST YEAR, IT SOUNDED FUN!), TNT CREW (EXCELLENT DEMOS AND AS FOR NO SECOND PRIZE WELL YOU NEARLY BLEW MY HEAD OFF!), PAULO SIMOES (NICE DEMO, HAVE YOU DONE ANY MORE!), THE ART MACHINE, STCS,  MCA,  STEVE BAK, JOHN M PHILLIPS, ALEX HERBERT, THE BULLFROG TEAM, THE SAN DIEGO COMPUTER CLUB           WELL I THINK THAT JUST ABOUT COVERS EVERY OWNER OF AN ST IN THE WORLD!! IF YOUR NOT HERE PARTICULARLY IF YOU THINK YOU SHOULD BE THEN I AM REALLY SORRY BUT DON'T BLAME ME I HAVE JUST SPENT OVER AN HOUR TRYING TO REMEMBER EVERYONE!!  WE HAVE HAD A REQUEST FROM A GOOD FRIEND OF OURS (S.T.M.) TO GREET A FEW OF HIS FRIENDS SO HERE GOES...-  ALLAN IN SUFFOLK, MARG AND BILLY BIZ, ROBBIE G!, PAUL RENE AND LYNDA DUBOIS    HOPE THATS OK STAN!!!    AND NOW FOR THAT OTHER OLD FAVOURITE THE FUCKING GREETINGS, THEY GO TO   GRIFF OF THE RESISTANCE, FOR SOMEONE WHO'S BALLS HAVEN'T DROPPED YET YOU SURE ARE A LITTLE WANKER, YOUR SCREEN WAS SUCH A TOTAL PIECE OF RIPPED SHIT THAT WE DECIDED NOT TO INCLUDE IT, I DON'T LIKE BEING SLAGGED OFF PARTICULARLY BY SOMEONE WHO HAS NO ORIGINAL IDEAS AND A TOTAL LACK OF STYLE AND I ALSO DON'T LIKE PEOPLE WHO SPREAD UNFINISHED COPIES OF MY SCREENS WHEN SPECIFICALLY ASKED NOT TOO, YOU  REALLY ARE THE SHITTIEST LITTLE KID I HAVE EVER MET.   MORE FUCKS GO TO THE PHANTOM, THE PROFESSIONAL DEMO WRITER!!, JOHN SYMES CAN'T HAVE SEEN YOUR DEMO BEFORE HE PAID YOU BECAUSE IF HE HAD THEN HE WOULD PROBABLY HAVE DIED LAUGHING JUST LIKE WE DID! AS FOR YOUR CLAIM TO HAVE GOT SYNC SCROLLING WORKING IN GFA BASIC, ANDY THE ARFLING AND I NEARLY DIED LAUGHING AT YOU!. GO ON A DIET YOU FAT BASTARD!!  LOVE MANIKIN, SAMMY JOE AND SPAZ OF THE LOST BOYS!!!       AND THAT COVERS THE FUCKING GREETINGS, BELIEVE ME THESE 2 GUYS REALLY DESERVE EVERYTHING THEY GET, I QUITE LOOK FORWARD TO SEEING WHAT THEY HAVE TO SAY TO US IN THEIR NEXT 'DEMOS'.   WELL THAT WAS PROBABLY THE LONGEST GREETINGS LIST YET SEEN IN A DEMO, SOME 8K OR DO I THINK!!!      IF YOU WISH TO CONTACT THE LOST BOYS ABOUT PD OR ANYTHING ELSE THEN OUR ADDRESS IS AS FOLLOWS   THE LOST BOYS,   22 O X F O R D   R O A D,   T E D D I N G T O N,  M I D D X,  T W 1 1   O P Z,  ENGLAND THIS WILL NOW BE REPEATED AGAIN.     THE LOST BOYS,   22 O X F O R D   R O A D,   T E D D I N G T O N,  M I D D X,  T W 1 1   O P Z,  ENGLAND.    IF YOU WANT MORE INFORMATION ABOUT THE LOST BOYS PD LIBRARY THEN READ ALL ABOUT IT IN THE LOST BOYS PD SCREEN ON THIS DEMO!! AND NOW A LITTLE ADDED EXTRA, WE RECENTLY RECEIVED A LETTER FROM JUST ABOUT THE MOST UNBELIEVABLE PLACE EVER. JUST TAKE A GUESS WHERE IT CAME FROM.     SPAIN          NO, RUN OF THE MILL           INDIA        BORING IN COMPARISON         NO THE LETTER CAME FROM OF ALL PLACES   MOSCOW IN THE U.S.S.R.  WE WERE SO TOTALLY FLABBERGASTED BY THIS THAT WE ALL SIMULTANEOUSLY FELL OFF OUR CHAIRS. SO AN ABSOLUTELY ENORMOUS MEGA- GIGA GREETING GOES TO DENIS ZUBKOW.  WE REALLY COULD NOR HAVE BEEN MORE SURPRISED IF YOU HAD TRIED. IT MADE OUR YEAR!!!     WELL NOW AFTER A SHORT BREAK ( ABOUT 2 MONTHS!!) THE DATE IS NOW FRIDAY 13TH APRIL 1990, THE MINDBOMB DEMO IS ALL BUT FINISHED AND TOMORROW I (MANIKIN) AM GOING TO HOLLAND TO VISIT STEFAN POSTHUMA (DIGITAL INSANITY) AND TOGETHER  WE WILL GO TO THALION SOFTWARE WHERE THIS DEMO WILL BE WELL AND TRULY FINISHED AMIDST MUCH DRINKING AND BEING MERRY IN MY PART!!  ALSO AT THALION THIS WEEK ARE ALL MEMBERS OF TCB AND TEX PLUS VARIOUS OTHER PERSONS OF DISTINCTION IN THE DEMO WORLD SO I THINK THIS IS A VERY GOOD PLACE TO COMPLETE THIS PROJECT.  AND NOW A SMALL ANNOUNCEMENT ON BEHALF OF THE DELTA FORCE. THERE WILL BE A COPY PARTY AT THE BEGINNING OF JUNE NEAR STUTTGART IN WEST GERMANY. CONTACT THEM IF YOU WANT DETAILS!!!  WELL DUE TO THE FACT THAT WE HAVE ALMOST NO MEMORY LEFT AT ALL THIS MAIN SCROLL TEXT WILL HAVE TO END JUST ABOUT NOW, THE SPURIOUS BULLSHIT WILL HOWEVER BE CONTINUING IN THE OTHER SCREENS ON THIS DEMO SO IF YOU LIKE READING THIS KIND  OF CRAP THEN YOU'L HAVE TO SWAP SCREENS AND READ IT SOMEWHERE ELSE.   LETS WRAP!!!   ";
			this.scrolltext.init(this.maincanvas,this.font,12);

			// END CODEF CODE
		},
		
		update : function() 
		{
			return true;
		},
		
		
		draw: function(context) 
		{
			// CODEF CODE
			for (var counter = 0; counter < this.nbSprites; counter++)
			{
				this.spritesPosX[counter] += this.x_speed;
				this.spritesPosY[counter] += this.y_speed;

				this.sprites[counter].draw(
					this.maincanvas, 
					this.spritesPosX[counter], 
					this.y_origin + this.y_amplitude*Math.cos(this.spritesPosY[counter]*this.y_angFreq) );
			}
			
			this.maincanvas.contex.fillStyle = "#000000";
			this.maincanvas.contex.fillRect (0, 0, 640, 24); 
			this.maincanvas.contex.fillRect (0, 390, 640, 390+56); 
			this.scrolltext.draw(390+8);
			
			this.logo.draw(this.maincanvas,256,28);
			
			// END CODEF CODE
		}
	  
	});
	