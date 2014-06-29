function init() {
    document.addEventListener("deviceready", onDeviceReady, false);
}


function onDeviceReady() {
//  startRatchet();
}

	var ytEmbed = {

		ytQuery : 0,
		cl : 0,
		callback : {},
		cfg : {},
		player : false,
	
		/**
		* Main Init Method
		*/
		init : function(cfg) {

			this.cfg = cfg || {};
					//this.message('Loading YouTube videos. Please wait...');
	
					//create a javascript element that returns our JSONp data.
					var script = document.createElement('script');
					script.setAttribute('id', 'jsonScript');
					script.setAttribute('type', 'text/javascript');
					
					//a counter
					this.ytQuery++;
					
					//settings
					if(!this.cfg.paging){
						this.cfg.paging = true;
					}					
					if(!this.cfg.results){
						this.cfg.results = 10;
					}
					if(!this.cfg.start){
						this.cfg.start = 1;
					}
					if(!this.cfg.order){
						this.cfg.orderby = 'relevance';
						this.cfg.sortorder = 'descending';
					}
					if(!this.cfg.thumbnail){
						this.cfg.thumbnail = 200;
					}
					if(!this.cfg.height){
						this.cfg.height = 390;
					}
					if(!this.cfg.width){
						this.cfg.width = 640;
					}

					this.cfg.orderby = 'published';
					this.cfg.sortorder = 'ascending';				
					
					script.setAttribute('src', 'http://gdata.youtube.com/feeds/api/users/'+this.cfg.q+'/uploads?max-results='+this.cfg.results+'&start-index='+this.cfg.start+'&alt=jsonc&v=2&format=5&callback=ytEmbed.callback['+this.ytQuery+']&orderby='+this.cfg.orderby+'&sortorder='+this.cfg.sortorder);
						
					cfg.mC = this.ytQuery;
					this.callback[this.ytQuery] = function(json){ ytEmbed.listVideos(json,cfg); }
					
								
					//attach script to page, this will load the data into our page and call the funtion ytInit[ytQuery]
					document.getElementsByTagName('head')[0].appendChild(script);
		},
		
	
		/**
		* Build videos (static)
		*/	
		listVideos : function(json,cfg){
			this.cfg = cfg;
			if(!this.cfg.player){
				this.cfg.player = 'embed';
			}
			if(!this.cfg.layout){
				this.cfg.layout = 'full';
			}
		
			var div = document.getElementById(this.cfg.block);
			
			var children = div.childNodes;		
			for(var i = children.length; i > -1; i--){
				if(children[i] && (children[i].className.indexOf("error") !== -1 || children[i].tagName ==="UL")){/* is error message or result list */
					div.removeChild(children[i]);
				}
			}
			
			//div.innerHTML = ''; //clear ul
			if(json.error){
				this.message('An error occured:<br>'+json.error.message);
			}else if(json.data && json.data.items){
				var ul = document.createElement('ul');
				ul.className = 'ytlist';
				
				var playlist ="";
				
				for (var i = 0; i < json.data.items.length; i++) {
					var entry = json.data.items[i];
					
					//playlist need this
					if(entry.video){
						//add playlist title data.title
						//add tags on the bottom
						entry = entry.video;	
					}
					
					if(entry.id){
						playlist += entry.id+",";	
					}
					
					var li = document.createElement('li');			
				
					//a link to our javascript overlay function
					var a = document.createElement('a');
					a.className = 'clip';
								
					if(this.cfg	.player == 'embed' && (!entry.accessControl || entry.accessControl.embed == "allowed")){
						a.style.cursor = 'pointer';
						
						if(a.addEventListener){  
							a.addEventListener('click', this.playVideo.bind(this, {'id': entry.id, 'cfg': cfg}), false);
						}else if(a.attachEvent){  
							a.attachEvent('onclick', this.playVideo.bind(this, {'id': entry.id, 'cfg': cfg}));  
						}
					}else{
						a.setAttribute('href', entry.player["default"]);
					}
					
					var span = document.createElement('span');
					a.appendChild(span);
					var img = document.createElement('img');
					img.setAttribute('src',(entry.thumbnail ? entry.thumbnail.hqDefault : ''));
					span.appendChild(img);
					var em = document.createElement('em');
					span.appendChild(em);					
					
					//uploaded
					if(this.cfg.layout == 'thumbnails'){
						li.className = 'small';
						li.appendChild(a);
					}else{
						//this.cfg.layout = full
						li.innerHTML = '<table cellspacing="0" cellpadding="0" border="0"><tr><td valign="top" rowspan="2"></td><td valign="top"><h3>'+entry.title+'</h3><span>'+this.formatDescription(entry.description)+'</span></td><td valign="top" style="width: 150px" class="meta"><div>';
						li.firstChild.firstChild.firstChild.firstChild.appendChild(a);
					}
					ul.appendChild(li);
				}

				//for fixed to bottom videos
				if(this.cfg.position == "fixed_bottom"){
					div.style.position = "fixed";
					div.style.bottom = '0px';
					div.style.left = '0px';
					//document bottom add X (height) pixels margin
				}
				
				//playlist
				if(this.cfg.playlist == true){
					this.cfg.playerVars.playlist = playlist.substr(0,playlist.length - 1);
				}
				
					//set settings
					if(json.data.items && json.data.items[0].video){
						ytPlayerParams.videoId = json.data.items[0].video.id;	
					}else if(json.data.items){
						ytPlayerParams.videoId = json.data.items[0].id;
					}
					
					//other settings
					if(this.cfg.playerVars){
						ytPlayerParams.playerVars = this.cfg.playerVars;
					}
					
					this.player = this.createPlayer(this.cfg);
				
			}
		},
		/**
		* Create the inline player supporting html5 and flash through iframe
		*/		
		createPlayer : function(cfg){
			var div = document.getElementById(cfg.block);
			
			var hold = document.createElement('div');
			hold.className = 'ytPlayer';
			
			var iframe = document.createElement('iframe');
			iframe.setAttribute('id', cfg.block+'Player');
			iframe.setAttribute('width', cfg.width);
			iframe.setAttribute('height', cfg.height);
			iframe.setAttribute('frameBorder', '0');
			iframe.setAttribute('src', 'http://www.youtube.com/embed/'+ytPlayerParams.videoId);//controlbar set
			
			hold.appendChild(iframe);
			div.insertBefore(hold,div.firstChild);
			
			return iframe;			
		},
		
		/**
		* Format description (description to snippet) (read more expand)
		*/	
		formatDescription : function(ds){
			if(ds){
				if(ds.length > 255){
					return ds.substr(0,252)+'...';
				}else{
					return ds;
				}
			}else{
				return "No description available.";
			}
		},

		/**
		* Play video (static)
		*/	
		playVideo : function(data){
			if(data.cfg.parent){
				var player = document.getElementById(data.cfg.parent+"Player");
			}else{
				var player = document.getElementById(data.cfg.block+"Player");
			}
			
			if(!player){
				ytPlayerParams.videoId = data.id;
				ytPlayerParams.autoplay = 1;
				
				this.createPlayer(data.cfg);
			}else{
				player.setAttribute('src', 'http://www.youtube.com/embed/'+data.id);	 
			}
		},
		
		/**
		* Messages log
		*/
		message : function(msg) {
			if(!ytEmbed.cfg.block){
				//attach message to body?
			}else{
				document.getElementById(ytEmbed.cfg.block).innerHTML = '<div class="error">'+msg+'</div>';
			}
		}
	};
	
	/**
	 * Using the embed player
	 */
	var ytPlayer;
	var ytPlayerParams = {
		autoplay: 0,
		modestbranding : 1,
		events: {
				'onReady': ytEmbed.onPlayerReady,
				'onStateChange': ytEmbed.onPlayerStateChange
			}
	};