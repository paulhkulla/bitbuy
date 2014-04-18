/**************************************************************************
 * HTML5 Video Background
 * @info: http://www.codegrape.com/item/html5-video-background/1306
 * @version: 1.0 (29.03.2012)
 * @requires: jQuery v1.7 or later (tested on 1.11.0)
 * @author: flashblue - http://www.codegrape.com/user/flashblue
**************************************************************************/

;(function($) {
	$.fn.videoBG = function(options) {
		
		//Default variables
		var defaults = {
			autoplay:true,
			loop:true,
			muted:false,
			
			//Video volume between 0 - 1
			videoVolume:1,
			
			//Aspect ratio
			aspectRatio:3, 		//0:Normal, 1:Aspect, 2:Full, 3:Scale
			
			//Video Type
			mp4:false,
			webm:false,
			flv:false,
			ogg:false,
			
			//Mobile Video Type
			mp4Mobile:false,
			webmMobile:false,
			flvMobile:false,
			oggMobile:false,
			
			//Pattern
			pattern:"",
			patternOpacity:1,
			
			//Go to URL on video ended - You must set "loop:false" on top to run video ended event handler
			videoEndURL:"",
			
			//Video on finish function
			onFinish:function() {}
		};
		
		//Settings
		var options = $.extend({}, defaults, options);		
		
		//HTML5
		var isHTML5 = false;
		
		//Mobile
		var isMobile = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i) ? true : false;
		
		//Mobile videos
		if (options.mp4 && !options.mp4Mobile) {options.mp4Mobile = options.mp4;}
		if (options.webm && !options.webmMobile) {options.webmMobile = options.webm;}
		if (options.flv && !options.flvMobile) {options.flvMobile = options.flv;}
		if (options.ogg && !options.oggMobile) {options.oggMobile = options.ogg;}
		
		//Video on finish
		var onFinish = typeof(options.onFinish)=="function" ? options.onFinish : function() {};
		
		//Variables
		var win = $(window);
		var winW, winH;		
		var container = $(this);
		var video, objVideo;
		var videoW=0, videoH=0;
		var videoMask = $('<div class="video-bg-mask" />');
		var videoHolder = $('<div class="video-bg-holder" id="video-bg-holder" />');
		var videoPattern = $('<div class="video-pattern" />');
		var videoPreloader = $('<div class="video-preloader" />');
		var hidden = false;
		var intervalId = null;
		
		//Append video on finish
		container.onFinish = onFinish;
		
		//Video mask
		container.prepend(videoMask);
		
		//Video holder
		videoMask.prepend(videoHolder);	
		
		//Window resize handler
		win.resize(resizeVideo);
		
		if (Modernizr.video && (options.mp4 || options.webm || options.ogg)) {			
			//HTML5 video
			createHTML5();
		} else {
			createHTML5();
		}		
		
		//Create HTML5 video tag
		function createHTML5() {
			var src = "", type = "", error = false;
			
			//Video type
			if (Modernizr.video.h264 && options.mp4) {
				src = !isMobile ? options.mp4 : options.mp4Mobile; 
				type = "video/mp4";
			} else if (Modernizr.video.ogg && options.ogg) {
				src = !isMobile ? options.ogg : options.oggMobile; 
				type = "video/ogg";
			} else if (Modernizr.video.webm && options.webm) {
				src = !isMobile ? options.webm : options.webmMobile; 
				type = "video/webm";
			} else {
				error = true;	
			}
			
			//Preloader
			videoMask.append(videoPreloader);
			
			//Video tag
			if (!error) {
				var attr =' preload="'+(isMobile ? "auto" : "metadata")+'"';
				if (options.autoplay) {
					attr += ' autoplay="autoplay"';
				}	
				if (options.loop) {
					attr += ' loop="loop"';
				}	
							
				var videoCode = '<video class="video-container" \
									width="100%" height="100%" \
									src="'+src+'" type="'+type+'\
									"'+attr+'\
								 />';
								 
				videoHolder.html(videoCode);
				objVideo = videoHolder.find(".video-container");
				video = objVideo[0];
				
				//Set video volume
				video.volume = !options.muted ? options.videoVolume : 0;						
				
				//Video event listeners
				video.addEventListener("ended", videoEnded, false);
				video.addEventListener("loadedmetadata", videoMetadata, false);
				video.addEventListener("loadstart", videoWaiting);
				video.addEventListener("play", videoPlaying);
				
				//Load video
				if(!isMobile) {
					video.load();
				} else {
					//Show video holder
					videoHolder.show();
					
					//Create fake play button
					videoPlayClick(function() {
						video.load();
					});
				}
				
				//HTML5
				isHTML5 = true;					
			}			
		}
		
		//Video play button for mobile
		function videoPlayClick(func) {
            var $a = $('<a href="#" id="videoPlayClick"></a>');
                
			$a.bind("click", function(e) {
				e.preventDefault();
				func();
			});

            $("body").append($a);

            var evt, el = $("#videoPlayClick").get(0);

            if (document.createEvent) {
                evt = document.createEvent("MouseEvents");
                if (evt.initMouseEvent) {
                    evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                    el.dispatchEvent(evt);
                }
            }

            $(el).remove();
        }
		
		//Video meta data
		function videoMetadata(e) {
			video.removeEventListener("loadedmetadata", videoMetadata, false);
			
			intervalId = setInterval(
				function() {
					//Video dimensions
					videoW = video.videoWidth;
					videoH = video.videoHeight;
					
					if (videoW!=100 || videoH!=100) {
						clearInterval(intervalId);
						
						//Pattern
						if (options.pattern!="") {
							createPattern();
						}
						
						//Resize video
						resizeVideo();
						
						//Show video holder
						videoHolder.show();
						
						//Play video
						if(isMobile) {
							video.play();
						}	
					}
				}
			, 100);
		}
		
		//Video ended
		function videoEnded(e) {
			//Redirect to URL
			if (options.videoEndURL!="") {
				goToUrl();
			}
			
			//On finish function
			container.onFinish.call(this);
		}
		
		//Video waiting
		function videoWaiting(e) {
		}
		
		//Video playing
		function videoPlaying(e) {
			videoMask.fadeIn(1000);
		}
		
		//Pattern
		function createPattern() {
			videoPattern.css({"background-image":"url("+options.pattern+")", "opacity":options.patternOpacity});
			videoMask.append(videoPattern);
		}
		
		//Create Flash video player
		function createFlash() {
			var src = "", error = false;
			if (options.mp4) {
				src = !isMobile ? options.mp4 : options.mp4Mobile; 				
			} else if (options.flv) {
				src = !isMobile ? options.flv : options.flvMobile; 				
			} else {
				error = true;	
			}			
			if (!error) {
				//Resize video
				resizeVideo();
				
				//Create video SWF
				var flashvars = {
					videoUrl:"../"+src,
					fullSizeView:(options.aspectRatio+1),
					defaultVolume:options.videoVolume,
					pattern:options.pattern,
					patternAlpha:options.patternOpacity,
					loop:options.loop,
					muted:options.muted,
					videoEndURL:options.videoEndURL				
				};
				var params = {
					scale:"noscale",
                    allowFullScreen:"true",
					menu:"false",
                    bgcolor:"#000000",
					wmode:"transparent"
                };
                var attributes = {
                    name: "video-bg-swf"
                };
				swfobject.embedSWF("flash/videobg.swf", "video-bg-holder", "100%", "100%", "9", null, flashvars, params, attributes, callbackFlash);
				
				//Show video holder
				videoHolder.show();
			}
		}
		
		//Callback Flash
		function callbackFlash(e) {
			video = document.getElementById(e.id);
		}
		
		//Go to URL
		function goToUrl() {
			window.location = options.videoEndURL;
		}
		
		//Resize video
		function resizeVideo(e) {
			winW = win.width();
			winH = win.height();
			
			var xScale = winW/videoW,
			yScale = winH/videoH, 
			scale=1, w=0, h=0, x=0, y=0;	
			
			switch (options.aspectRatio) {
				case 0:	//Normal
					if (winW<videoW || winH<videoH) {
						scale = Math.min(xScale, yScale);						
					}					
					w = Math.ceil(videoW*scale);
					h = Math.ceil(videoH*scale);					
					x = Math.ceil((winW-w)/2);
					y = Math.ceil((winH-h)/2);
					break;	
				case 1:	//Aspect
					scale = Math.min(xScale, yScale);
					w = Math.ceil(videoW*scale);
					h = Math.ceil(videoH*scale);
					x = Math.ceil((winW-w)/2);
					y = Math.ceil((winH-h)/2);		
					break;
				case 2:	//Full
					w = winW;
					h = winH;
					x = 0;
					y = 0;		
					break;
				case 3:	//Scale
				default:
					scale = Math.max(xScale, yScale);
					w = Math.ceil(videoW*scale);
					h = Math.ceil(videoH*scale);
					x = Math.ceil((winW-w)/2);
					y = Math.ceil((winH-h)/2);
					break;
			}
			
			if (isHTML5) {
				objVideo.css({"width":w+"px", "height":h+"px"});
				videoHolder.css({"left":x+"px", "top":y+"px"});
				if (options.pattern!="") {
					videoPattern.css({"left":x+"px", "top":y+"px", "width":w+"px", "height":h+"px"});	
				}
			} else {
				videoHolder.css({"width":winW+"px", "height":winH+"px"});
			}	
		}
		
		/********************************
		    - JS callback functions -
		********************************/
		
		//Play - Pause
		function isPlaying() {
			if(isHTML5) {
				return !video.paused;
			} else {
				return video.isPlaying();
			}
		}
		
		videoBg_play = function() {
			if(isHTML5) {
				video.play();
			} else {
				video.resume();
			}
		};
		
		videoBg_pause = function() {
			video.pause();
		};
		
		videoBg_toggle_play = function() {
			if(isPlaying()) {
				videoBg_pause();
			} else {
				videoBg_play();
			}
		};	
		
		//Rewind
		videoBg_rewind = function() {
			if(isHTML5) {
				video.currentTime = 0;
			} else {
				video.rewind();
			}
		};
		
		//Mute - Unmute
		function isMuted() {
			if(isHTML5) {
				return !(video.volume);
			} else {
				return video.isMute();
			}
		}
		
		videoBg_mute = function() {
			if(isHTML5) {
				video.volume = 0;
			} else {
				video.mute();
			}
		};
		
		videoBg_unmute = function() {
			if(isHTML5) {
				video.volume = options.videoVolume;
			} else {
				video.unmute();
			}
		};
		
		videoBg_toggle_sound = function() {
			if(isMuted()) {
				videoBg_unmute();
			} else {
				videoBg_mute();
			}
		};
		
		//Show - Hide
		videoBg_show = function() {
			videoBg_play();
			videoMask.stop().fadeTo(600, 1);
			hidden = false;
		};
		
		videoBg_hide = function() {
			videoBg_pause();
			videoMask.stop().fadeTo(600, 0);
			hidden = true;
		};		
		
		videoBg_toggle_hide = function() {
			if(hidden) {
				videoBg_show();
			} else {
				videoBg_hide();
			}
		};
				
	};
		
})(jQuery);
