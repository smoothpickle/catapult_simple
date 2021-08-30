/*
	Plugin Name: Player handler for Demain j'étais ici.
	Description: It's really custom, so yeah
*/
/*
	The semi-colon before the function invocation is a safety net against concatenated scripts and/or other plugins which may not be closed properly.
	"undefined" is used because the undefined global variable in ECMAScript 3 is mutable. (ie. it can be changed by someone else). Because we don't pass a value to undefined when the anonymous function is invoked, we ensure that undefined is truly undefined.
	Note: In ECMAScript 5 undefined can no longer be modified.
	"window" and "document" are passed as local variables rather than global. This (slightly) quickens the resolution process.
*/
; (function ($, window, document, undefined) {
	/*
	The purpose of "use strict" is to indicate that the code should be executed in "strict mode". With strict mode, you can not, for example, use undeclared variables.
	*/
	"use strict";
	/*
		Store the name of the plugin in the "PLUGIN_NAME" variable. This variable is used in the "Plugin" constructor below, as well as in the plugin wrapper to construct the key for the "$.data" method.
		More: http://api.jquery.com/jquery.data/
	*/
	let plugin;
	const PLUGIN_NAME = 'playerizer';
	/*
		The "Plugin" constructor, builds a new instance of the plugin for the DOM node(s) that the plugin is called on.
		For example, "$('selector').pluginName();" creates a new instance of pluginName for the given selector.
	*/
	function Plugin(element, options) {
		/*
			Provide local access to the DOM node(s) that are called the plugin, as well local access to the pluginName and default options.
        */
		this._element    = element;
		this._pluginName = PLUGIN_NAME;
		this._defaults   = $.fn[PLUGIN_NAME].defaults;
		/*
			The "$.extend" method merges the contents of two or more objects, and stores the result in the first object. The first object is empty so that we don't alter the default options for future instances of the plugin.
			More: http://api.jquery.com/jquery.extend/
        */
		this._settings 	 = $.extend({
			
			zone: "Zone verte",
			parentContainer: $(this._element).parent(),
			_currentTrack: "",
			isLocked: false,
			els: {},
			_howler: {}
			
		}, this._defaults, options);
		/*
			The "_init" method is the starting point for the plugin logic.
			Calling the _init method here in the "Plugin" constructor function allows us to store all methods (including the _init method) in the plugin's prototype.
        */
		this._init();
	}
	// Avoid Plugin.prototype conflicts
	$.extend(Plugin.prototype, {
		// Initialization logic
		_init: function () {
            /*
                Create additional methods below and call them via "this.myFunction(arg1, arg2)", ie: "this._build();".
                Note: You can access the DOM node(s), pluginName, default plugin options and custom plugin options for a each instance of the plugin by using the variables "this._element", "this._pluginName", "this._defaults" and "this._settings" created in the "Plugin" constructor function (as shown in the _build
                method below).
            */
		    plugin = this;
			this._build();
			this._bindEvents();
			
			// console.log(trackDataObj['Zone rouge'])
		},
		// Cache DOM nodes for performance
		_build: function () {
            /*
				Create variable(s) that can be accessed by other plugin functions. For example, "this.$_element = $(this._element);" will cache a jQuery reference to the element that initialized the plugin.
				Cached variables can then be used in other methods.
            */
			this.$_element = $(this._element);
			this._tracks = trackDataObj[this._settings.zone];
			
			this.isSongPlaying = false;
			
			this._buildAudioElement();
			this._buildPlaylist();
			this._createArtistPanel();
			this._buildVideoElement();
			this._buildProgressBar();
		},
		
		_buildVideoElement: function() {
			var _this = this;
			
			this._newVideo = document.createElement("video");
			// this._newVideo.autoplay = true;
			this._newVideo.loop = true;
			this._newVideo.controls = false;
			this._settings.els.artistVideo.append(this._newVideo);
		},
		
		_buildAudioElement: function() {
			var _this = this;
			
			this._newAudio = new Audio();
			$(this._newAudio).on('ended', function() {
				_this._handleStopSound();
			});
		},
		
		_buildPlaylist: function() {
			// Build list with songs from obj
			var _this = this;
			var _el = this.$_element;
			var tracks_data = this._tracks;
			var tracks = "";
			
			this._settings.playlistUrlArr = [];
			
			_el.append($('<ul>', {class: 'playlist'}));
			
			var _playlist = _el.find('ul');
			
			$.each( tracks_data, function( key, value ) {
				
				_playlist.append(
					$('<li/>').append($('<a/>', {
						href: value.url,
						'data-track': key,
						text: value.name,
						click: function(e) {
							e.preventDefault();
							
							plugin._settings._currentTrack = tracks_data[key];
							plugin._onClickTrack($(this));
						}
					}))
				);
				
				plugin._settings.playlistUrlArr.push(value.url)
				
			});
			
			//console.log(this._settings.playlistUrlArr);
		},
		
		_buildProgressBar: function() {
			var _this = this;
			
			const audio = this._newAudio;
			const start = this._settings.els.playerTime_Start;
			const end = this._settings.els.playerTime_End;
			const progressBar = this._settings.els.playerProgressBar;
			const now = this._settings.els.playerTime_Now;

			function conversion (value) {
				let minute = Math.floor(value / 60);
				minute = minute.toString().length === 1 ? ('0' + minute) : minute;
				let second = Math.round(value % 60);
				second = second.toString().length === 1 ? ('0' + second) : second;
				return `${minute}:${second}`;
			}

			audio.onloadedmetadata = function () {
				end.text(conversion(audio.duration));
				start.text(conversion(audio.currentTime));
			}

			progressBar.on('click', function (event) {
				let coordStart = this.getBoundingClientRect().left;
				let coordEnd = event.pageX;
				let p = (coordEnd - coordStart) / this.offsetWidth;
				// now.style.width = p.toFixed(3) * 100 + '%';
				now.css({width: p.toFixed(3) * 100 + '%'});
				
				// console.log(now);

				audio.currentTime = p * audio.duration;
				audio.play();
				
				_this._hidePlayBtn();
			});

			setInterval(() => {
				start.text(conversion(audio.currentTime));
				// now.style.width = audio.currentTime / audio.duration.toFixed(3) * 100 + '%';
				now.css({width: audio.currentTime / audio.duration.toFixed(3) * 100 + '%'});
			}, 1000);
			
		},
		
		_onClickTrack: function(el) {
			
			console.log('clicked track');
			
			// $('html').addClass('player-is-active');
			el.closest('li').addClass('listened');
				
			this._updateArtistPanel();

		},
		
		_createArtistPanel: function() {
			
			// var currentTrack = this._tracks[this._settings._currentTrack];
			
			// console.log(currentTrack);
			
			$('body').append(
				$('<div/>', {
					id: 'player'
				})
				.append($('<div/>', { id: 'artistPlayerContainer' })
					.append($('<div/>', { id: 'artistVideo' }))
				)
				.append($('<div />', {
					id: 'artistInfoPanel'
				})
				.append($('<div/>', {class: 'inner'})
				.append($('<h2/>'))
				.append($('<p/>', { id: 'player_credits', class: 'text-theme-a' }))
				.append($('<p/>', { id: 'player_desc', class: 'text-theme-b' }))
				)
			)
			.append($('<div/>', { id: 'artistPlayer' })
				.append($('<div/>', { id: 'playerProgressBarContainer' })
					.append($('<div/>', { id: 'playerSongName' }))
					.append($('<div/>', { id: 'playerProgressBarWrapper' })
						.append($('<div/>', { id: 'playerTime_Start' }))
						.append($('<div/>', { id: 'playerProgressBar' })
							.append($('<div/>', { id: 'playerTime_Now' }))
						)
					)
					.append($('<div/>', { id: 'playerTime_End' }))
				)
				.append($('<div/>', { id: 'playerControls' })
					.append($('<button/>', {
						id: 'btnPlaylist',
						text: 'Retour à la liste de lecture',
						click: function(e) {
							e.preventDefault();
							console.log('Click back to playlist');
							plugin._hideArtistPanel();
						}
					}))
					.append($('<button/>', { 
						id: 'btnPlay',
						text: 'Jouer la balado',
						click: function() {
							
							// plugin.playSound();
							plugin._handlePlaySound();
						}
					}))
					.append($('<button/>', { 
						id: 'btnStop',
						text: 'Arrête la balado',
						click: function() {
							
							// plugin.stopSound();
							plugin._handleStopSound();
						}
					}))
					.append($('<div/>', { 
						id: 'playerLoadingIcon',
						class: 'radar radar-color-alt'
					})
						.append($('<div/>', { class: 'wave wave1' }))
						.append($('<div/>', { class: 'wave wave2' }))
						.append($('<div/>', { class: 'wave wave3' }))
					)
					.append($('<button/>', {
						id: 'btnNext',
						text: 'Jouer la prochaine la balado'
					}))
					.append($('<p/>', { id: 'player_duration', class: 'text-theme-a' }))
				)
				.append($('<button/>', { 
					id: 'btnToggleCollapsePlayer',
					click: function() {
						plugin.toggleCollapsePlayer();
					}
				}))
			));
			
			this._assignElements();
		},
		
		_assignElements: function() {
			// assign all elements so we can reuse it later on
			
			this._settings.els.html = $('html');
			this._settings.els.player = $('#player');
			this._settings.els.trackName = this._settings.els.player.find('h2');
			this._settings.els.trackCredits = this._settings.els.player.find('#player_credits');
			this._settings.els.trackDesc = this._settings.els.player.find('#player_desc');
			this._settings.els.trackDuration = this._settings.els.player.find('#player_duration');
			
			this._settings.els.artistPlayerContainer = this._settings.els.player.find('#artistPlayerContainer');
			this._settings.els.artistVideo = this._settings.els.player.find('#artistVideo');
			
			this._settings.els.artistPlayer = this._settings.els.player.find('#artistPlayer');
			this._settings.els.playerProgressBarContainer = this._settings.els.player.find('#playerProgressBarContainer');
			
			this._settings.els.playerSongName = this._settings.els.player.find('#playerSongName');
			this._settings.els.playerProgressBar = this._settings.els.player.find('#playerProgressBar');
			
			this._settings.els.playerTime_End = this._settings.els.player.find('#playerTime_End');
			this._settings.els.playerTime_Start = this._settings.els.player.find('#playerTime_Start');
			this._settings.els.playerTime_Now = this._settings.els.player.find('#playerTime_Now');
			
			this._settings.els.playerControls = this._settings.els.player.find('#playerControls');
			this._settings.els.btnPlaylist = this._settings.els.player.find('#btnPlaylist');
			this._settings.els.btnPlay = this._settings.els.player.find('#btnPlay');
			this._settings.els.btnStop = this._settings.els.player.find('#btnStop');
			this._settings.els.btnNext = this._settings.els.player.find('#btnNext');
			
			this._settings.els.btnToggleCollapsePlayer = this._settings.els.player.find('#btnToggleCollapsePlayer');
			
			this._settings.els.loadingIcon = this._settings.els.player.find('#playerLoadingIcon');
			
			this._settings.els.loadingIcon.hide();
			this._settings.els.btnStop.hide();
			
		},
		
		_updateArtistPanel: function() {
			var _this = this;
			
			this._areMediasReady = false;
			this._videoReady = false;
			this._audioReady = false;
			
			if (this.isSongPlaying == true) {
				this._settings.els.btnStop.hide();
				this._settings.els.btnPlay.show();
			}
			
			var currentTrack = this._settings._currentTrack;
			
			console.log(currentTrack);

			// Assign Current track values
			this._settings.els.trackName.text(currentTrack.name);
			this._settings.els.trackCredits.text(currentTrack.credits);
			this._settings.els.trackDesc.text(currentTrack.desc);
			this._settings.els.trackDuration.text(currentTrack.tracktime);
			
			// Video
			$(this._newVideo).attr('src', currentTrack.videoURL);
			this._newVideo.load();
			// this._newVideo.onloadeddata = function() {
			// 	console.log('video is loaded');
			// 	_this._videoReady = true;
			// 	_this._checkIfMediasAreReady();
			// }
			
			$(this._newVideo).on('canplaythrough', function() {
				console.log('video is loaded');
				_this._videoReady = true;
				$(_this._newVideo).off('canplaythrough');
				//_this._checkIfMediasAreReady();
			});
			
			// Audio
			this._newAudio.src = currentTrack.url;
			// this._newAudio.onloadeddata = function() {
			// 	console.log('audio is ready');
			// 	_this._audioReady = true;
			// 	_this._checkIfMediasAreReady();
			// }
			
			$(this._newAudio).on('canplay', function() {
				console.log('audio is loaded');
				_this._audioReady = true;
				$(_this._newAudio).off('canplay');
				//_this._checkIfMediasAreReady();
			});
			
			
			// Player
			this._settings.els.playerSongName.text(currentTrack.name);
			this._settings.els.playerTime_Now.css({'width': '0%'});
			
			console.log(this._audioReady, this._videoReady);
			
			// if (this._audioReady == true && this._videoReady == true ) {
			// 	console.log('GO')
			// 	_this._showArtistPanel();
			// }
			
			this._showArtistPanel();
		},
		
		_checkIfMediasAreReady: function() {
			var _this = this;
			
			if (this._audioReady == true && this._videoReady == true) {
				console.log('Medias are ready')
				this._areMediasReady = true;
				// this.playSound();
			}
		},
		
		_showArtistPanel: function() {
			var _this = this;
			console.log(this._settings.els.artistPlayer)
			
			this._settings.els.html.addClass('show-artistPanel');
			
			this._settings.els.btnToggleCollapsePlayer.fadeOut(300);
			
			this._settings.parentContainer.fadeOut(300, function() {
				
				_this._settings.els.player.fadeIn(300, function() {

				});
			});

		},
		
		_hideArtistPanel: function() {
			var _this = this;
			
			this._settings.els.html.removeClass('show-artistPanel');
			this._settings.els.html.removeClass('song-is-playing');
			

			this._settings.els.player.fadeOut(300, function() {

				_this._settings.parentContainer.fadeIn(300, function() {

				});
			});
			
		},
		
		playSound: function() {
			var _this = this;
			
			console.log('Play sound');
			this.isSongPlaying = true;
		
			// this._settings.els.html.addClass('song-is-playing');
			
			this._newVideo.play();
			this._newAudio.play();

			this._hidePlayBtn();
		},
		
		_handlePlaySound: function() {
			var _this = this;

			this._settings.els.html.addClass('song-is-playing');
			
			this._settings.els.btnToggleCollapsePlayer.fadeIn(300);
			
			this.playSound();
			
		},
		
		stopSound: function() {
			
			console.log('Stop sound');
			this.isSongPlaying = false;
			
			this._newVideo.pause();
			this._newAudio.pause();
			
			this._hideStopBtn();
		},
		
		_handleStopSound: function() {
			var _this = this;
			
			this._settings.els.html.removeClass('song-is-playing');
			this._settings.els.html.removeClass('player-is-collapse');
			
			this._settings.els.btnToggleCollapsePlayer.hide();
			
			this.stopSound();
			
		},
		
		_hidePlayBtn: function() {
			this._settings.els.btnPlay.hide();
			this._settings.els.btnStop.show();
		},
		
		_hideStopBtn: function() {
			this._settings.els.btnStop.hide();
			this._settings.els.btnPlay.show();
		},
		
		toggleCollapsePlayer: function() {
			var _this = this;
			
			this._settings.els.html.toggleClass('player-is-collapse');
		},
		
		// Bind events that trigger methods
		_bindEvents: function () {
            /*
				Bind event(s) handlers that trigger other functions, ie: "plugin.$_element.on('click', function() {});".
				Note the use of the cached variable we created in the _build method.
                All events are namespaced, ie: ".on('click'+'.'+this._pluginName', function() {});".
                This allows us to unbind plugin-specific events using the _unbindEvents method below.
            */
			// plugin.$_element.on('click' + '.' + plugin._pluginName, function () {
            //     /*
            //         Use the "call" method to call the function. ie: "_someOtherFunction", the "this" keyword refers to the plugin instance, not the event handler.
            //         More: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call
            //     */
			// 	plugin._someOtherFunction.call(plugin);
			// });
		},
		// Unbind events that trigger methods
		_unbindEvents: function () {
            /*
                Unbind all events in our plugin's namespace that are attached to "this.$_element".
            */
			this.$_element.off('.' + this._pluginName);
		},
		// Remove plugin instance completely
		_destroy: function () {
            /*
                The _destroy method unbinds all events for the specific instance of the plugin, then removes all plugin data that was stored in the plugin instance using jQuery's .removeData method.
                Since we store data for each instance of the plugin in its instantiating element using the $.data method (as explained in the plugin wrapper below), we can call methods directly on the instance outside of the plugin initialization, ie: $('selector').data('plugin_myPluginName')._someOtherFunction();
                Consequently, the _destroy method can be called using: $('selector').data('plugin_myPluginName')._destroy();
            */
			this._unbindEvents();
			this.$_element.removeData();
		},
        /*
			"_someOtherFunction" is an example of a custom method in your plugin. Each method should perform a specific task. For example, the _build method exists only to create variables for other methods to access. The _bindEvents method exists only to bind events to event handlers that trigger other methods.
			Creating custom plugin methods this way is less confusing (separation of concerns) and makes your code easier to test.
        */
		// Create custom methods
		_someOtherFunction: function () {
			console.log('Function is called.');
			this._callback();
		},
		// Callback methods
		_callback: function () {
			// Cache onComplete option
			let onComplete = this._settings.onComplete;
			if (typeof onComplete === "function") {
                /*
                    Use the "call" method so that the onComplete callback function the "this" keyword refers to the
                    specific DOM node that called the plugin.
                    More: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call
                */
				onComplete(this._element);
			}
		}
	});
    /*
        Create a lightweight plugin wrapper around the "Plugin" constructor, preventing against multiple instantiations.
        More: http://learn.jquery.com/plugins/basic-plugin-creation/
    */
	$.fn[PLUGIN_NAME] = function (options) {
		this.each(function () {
			if (!$.data(this, "plugin_" + PLUGIN_NAME)) {
                /*
                    Use "$.data" to save each instance of the plugin in case the user wants to modify it. Using "$.data" in this way ensures the data is removed when the DOM element(s) are
                    removed via jQuery methods, as well as when the user leaves the page. It's a smart way to prevent memory leaks.
                    More: http://api.jquery.com/jquery.data/
                */
				$.data(this, "plugin_" + PLUGIN_NAME, new Plugin(this, options));
			}
		});
        /*
            "return this;" returns the original jQuery object. This allows additional jQuery methods to be chained.
        */
		return this;
	};
    /*
        Attach the default plugin options directly to the plugin object. This allows users to override default plugin options globally, instead of passing the same option(s) every time the plugin is initialized.
        For example, the user could set the "property" value once for all instances of the plugin with
        "$.fn.PLUGIN_NAME.defaults.property = 'myValue';". Then, every time plugin is initialized, "property" will be set to "myValue".
        More: http://learn.jquery.com/plugins/advanced-plugin-concepts/
    */
	$.fn[PLUGIN_NAME].defaults = {
		property  : 'value',
		onComplete: null
	};
})(jQuery, window, document);