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
			_currentTrack: ""
			
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
			
			this._buildPlaylist();
			this._createPlayer();
		},
		
		_buildPlaylist: function() {
			// Build list with songs from obj
			
			var _this = this.$_element;
			var tracks_data = this._tracks;
			var tracks = "";
			
			_this.append($('<ul>', {class: 'playlist'}));
			
			var _playlist = _this.find('ul');
			
			$.each( tracks_data, function( key, value ) {
				
				_playlist.append(
					$('<li/>').append($('<a/>', {
						href: value.url,
						'data-track': key,
						text: value.name,
						click: function(e) {
							e.preventDefault();
							
							plugin._settings._currentTrack = plugin._tracks[key];
							plugin._onClickTrack($(this));
						}
					}))
				);
				
			});
			
			
		},
		
		_onClickTrack: function(el) {
			
			console.log('clicked track');
			
			// $('html').addClass('player-is-active');
			el.closest('li').addClass('listened');
				
			this._updatePlayer();
			
			
		
		},
		
		_createPlayer: function() {
			
			// var currentTrack = this._tracks[this._settings._currentTrack];
			
			// console.log(currentTrack);
			
			$('body').append(
				$('<div/>', {
					id: 'player'
				}).append($('<div/>', {class: 'inner'})
				.append($('<h2/>'))
				.append($('<p/>', { id: 'player_credits', class: 'text-theme-a' }))
				.append($('<p/>', { id: 'player_desc', class: 'text-theme-b' }))
				.append($('<button/>', {
					id: 'btn_playlist',
					text: 'Retour à la liste de lecture',
					click: function(e) {
						e.preventDefault();
						console.log('Click back to playlist');
						plugin._hidePlayerContainer();
					}
				}))
				.append($('<button/>', { 
					id: 'btn_play',
					text: 'Jouer la balado',
					click: function(e) {
						e.preventDefault();
						console.log('Clicked play button');
						// plugin._constructPlay();
					}
				}))
				.append($('<p/>', { id: 'player_duration', class: 'text-theme-a' }))
				)
			);
		},
		
		_updatePlayer: function() {
			
			var currentTrack = this._settings._currentTrack;
			
			console.log(currentTrack);
			
			var _player = $('#player');
			
			// Assign Current track values
			_player.find('h2').text(currentTrack.name);
			_player.find('#player_credits').text(currentTrack.credits);
			_player.find('#player_desc').text(currentTrack.desc);
			_player.find('#player_duration').text(currentTrack.tracktime);
			
			this._showPlayerContainer();

		},
		
		_showPlayerContainer: function() {
			$('html').addClass('player-is-active');
			
			this._settings.parentContainer.fadeOut(300);
		},
		
		_hidePlayerContainer: function() {
			
			$('html').removeClass('player-is-active');
			
			this._settings.parentContainer.fadeIn(300);
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