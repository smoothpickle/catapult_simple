/*
	Plugin Name: Name of the plugin.
	Description: Brief description about plugin.
*/
; (function ($, window, document, undefined) {
	"use strict";
	let plugin;
	const PLUGIN_NAME = 'playerizer';
	function Plugin(element, options) {
		this._element    = element;
		this._pluginName = PLUGIN_NAME;
		this._defaults   = $.fn[PLUGIN_NAME].defaults;
		this._settings 	 = $.extend({
            
            tracks: [],
            parentContainer: $(this._element).parent(),
            
        }, this._defaults, options);
		this._init();
	}
	// Avoid Plugin.prototype conflicts
	$.extend(Plugin.prototype, {
        
		// Initialization logic
		_init: function () {
			plugin = this;
            
            this._handleErrors();
			this._build();

		},
        
        //
        _handleErrors: function() {
            if (this._settings.tracks.length <= 0) {
                console.log('NO TRACKS');
            }
        },
        
		// Cache DOM nodes for performance
		_build: function () {
			this.$_element = $(this._element);
            
            this._buildPlaylist();
            this._buildArtistPanel();
            this._buildMediasElement();
            this._buildProgressBar();
		},
        
        //
        _buildProgressBar: function() {
			
			var audio = this._newAudio;
			var start = this.$_elements.playerTime_Start;
			var end = this.$_elements.playerTime_End;
			var progressBar = this.$_elements.playerProgressBar;
			var now = this.$_elements.playerTime_Now;

			function conversion (value) {
				var minute = Math.floor(value / 60);
				minute = minute.toString().length === 1 ? ('0' + minute) : minute;
				var second = Math.round(value % 60);
				second = second.toString().length === 1 ? ('0' + second) : second;
				return `${minute}:${second}`;
			}

			audio.onloadedmetadata = function () {
				end.text(conversion(audio.duration));
				start.text(conversion(audio.currentTime));
			}

			progressBar.on('click', function (event) {
				var coordStart = this.getBoundingClientRect().left;
				var coordEnd = event.pageX;
				var p = (coordEnd - coordStart) / this.offsetWidth;
                
				now.css({width: p.toFixed(3) * 100 + '%'});

				audio.currentTime = p * audio.duration;
				audio.play();
				
				plugin.$_elements.btnPlay.hide();
                plugin.$_elements.btnStop.show();
			});

			setInterval(() => {
				start.text(conversion(audio.currentTime));
				// now.style.width = audio.currentTime / audio.duration.toFixed(3) * 100 + '%';
				now.css({width: audio.currentTime / audio.duration.toFixed(3) * 100 + '%'});
			}, 1000);
            
        },
        
        //
        _buildArtistPanel: function() {
            
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
                             if(!e.detail || e.detail == 1) { 
                                console.log('Click back to playlist');
							    plugin.hideArtistPanel();
                            } else { 
                                return false; 
                            }	
						}
					}))
					.append($('<button/>', { 
						id: 'btnPlay',
						text: 'Jouer la balado',
						click: function(e) {
                            e.preventDefault();
                             if(!e.detail || e.detail == 1) { 
                                console.log('Click play button');
							    plugin._onClickPlayButton();
                            } else { 
                                return false; 
                            }
						}
					}))
					.append($('<button/>', { 
						id: 'btnStop',
						text: 'Arrête la balado',
						click: function(e) {
							e.preventDefault();
                            console.log('Click stop button');
							plugin._onClickStopButton();
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
						text: 'Jouer la prochaine la balado',
						click: function() {
							plugin.skip();
						}
					}))
					.append($('<p/>', { id: 'player_duration', class: 'text-theme-a' }))
				)
				.append($('<button/>', { 
					id: 'btnToggleCollapsePlayer',
					click: function() {
                        console.log('toggleCollapsePlayer');
						plugin.toggleCollapsePlayer();
					}
				}))
			));
            
            this._assignElements();
        },
        
        // assign all elements so we can reuse it later on
        _assignElements: function() {
            
            this.$_elements = {};
			
			this.$_elements.html = $('html');
            this.$_elements.ul_playlist = $('#playlist-list'); // list of songs
            
			this.$_elements.player = $('#player');
			this.$_elements.trackName = this.$_elements.player.find('h2');
			this.$_elements.trackCredits = this.$_elements.player.find('#player_credits');
			this.$_elements.trackDesc = this.$_elements.player.find('#player_desc');
			this.$_elements.trackDuration = this.$_elements.player.find('#player_duration');
			
			this.$_elements.artistPlayerContainer = this.$_elements.player.find('#artistPlayerContainer');
			this.$_elements.artistVideo = this.$_elements.player.find('#artistVideo');
			
			this.$_elements.artistPlayer = this.$_elements.player.find('#artistPlayer');
			this.$_elements.playerProgressBarContainer = this.$_elements.player.find('#playerProgressBarContainer');
            
            this.$_elements.artistInfoPanel = this.$_elements.player.find('#artistInfoPanel');
			
			this.$_elements.playerSongName = this.$_elements.player.find('#playerSongName');
			this.$_elements.playerProgressBar = this.$_elements.player.find('#playerProgressBar');
			
			this.$_elements.playerTime_End = this.$_elements.player.find('#playerTime_End');
			this.$_elements.playerTime_Start = this.$_elements.player.find('#playerTime_Start');
			this.$_elements.playerTime_Now = this.$_elements.player.find('#playerTime_Now');
			
			this.$_elements.playerControls = this.$_elements.player.find('#playerControls');
			this.$_elements.btnPlaylist = this.$_elements.player.find('#btnPlaylist');
			this.$_elements.btnPlay = this.$_elements.player.find('#btnPlay');
			this.$_elements.btnStop = this.$_elements.player.find('#btnStop');
			this.$_elements.btnNext = this.$_elements.player.find('#btnNext');
			
			this.$_elements.btnToggleCollapsePlayer = this.$_elements.player.find('#btnToggleCollapsePlayer');
			
			this.$_elements.loadingIcon = this.$_elements.player.find('#playerLoadingIcon');
			
			this.$_elements.loadingIcon.hide();
			this.$_elements.btnStop.hide();
			this.$_elements.btnNext.hide();
			
		},
        
        //
        _buildMediasElement: function() {
            
            // Video
            this._newVideo = document.createElement('video');
			this._newVideo.loop = true;
			this._newVideo.controls = false;
			this._newVideo.setAttribute('playsinline', true);
			this._newVideo.setAttribute('muted', true);
            
            this.$_elements.artistVideo.append(this._newVideo);

            // Audio
            this._newAudio = new Audio();
			$(this._newAudio).on('ended', function() {
                plugin.$_playlistEl.closest('li').addClass('listened');
                plugin.skip();
			});

        },
        
        //
        _songListened: function(trackIndex) {
            
            this.$_elements.ul_playlist.find('li').eq(trackIndex).addClass('listened');
            
        },
        
        _checkIfMediasAreReady: function() {
			
			if (this._audioReady == true && this._videoReady == true) {
                
				console.log('Medias are ready');
				this._areMediasReady = true;
                
                this.$_elements.loadingIcon.hide();
                this.$_elements.btnPlay.show();

			}
		},
        
        // Here we add markup for the playlist
        _buildPlaylist: function() {
            // console.log(trackDataObj[0]);
            
            this._currentTrackIndex;
            this._clickcount = 0;
            
            var list = $('<ul/>', {class: 'playlist', id: 'playlist-list'});
            
            $.each(this._settings.tracks, function(key, value) {
                list.append(
                    $('<li/>').append($('<a/>', {
						href: value.audioUrl,
						'data-track': key,
						text: value.name,
						click: function(e) {
                            e.preventDefault();
                            plugin._clickcount++;
                            if (plugin._clickcount == 1) {
                                console.log('Click on track');
                                plugin.$_playlistEl = $(this);
                                plugin._onClickTrack(key);
                            }
                            
                            
						}
					})
                        .append($('<span/>', { class: 'dot-pulse-container' })
                            .append($('<span/>', { class: 'dot-pulse'}))
                        )
                    )
                );
            });
            
            this.$_element.append(list);
        },
        
        // Event after click on track on playlist.
        _onClickTrack: function(trackIndex) {
            
            this._areMediasReady = false;
			this._videoReady = false;
			this._audioReady = false;
            
            this._oldTrackIndex = this._currentTrackIndex;
            this._currentTrackIndex = trackIndex;
            
            if (this._oldTrackIndex != this._currentTrackIndex) {
                
                this.$_elements.btnPlay.hide();
                this.$_elements.btnStop.hide();
                this.$_elements.loadingIcon.show();
                
                this.$_elements.trackDuration.show();
                this.$_elements.btnNext.hide();
                this.$_elements.btnToggleCollapsePlayer.hide();
                this.$_elements.playerProgressBarContainer.hide();

                this.$_elements.html.removeClass('song-is-playing');
                this.$_elements.ul_playlist.find('a').removeClass('is-playing');
                
            }
            
            this.showPlayer();
            this.updateArtistPanel(plugin._currentTrackIndex);
            this.openArtistPanel();
            
        },

        //
        _onClickPlayButton: function() {
            
            this.$_elements.btnPlay.hide();
            this.$_elements.btnStop.show();

            this.$_elements.html.addClass('song-is-playing');
            this.$_elements.ul_playlist.find('a').removeClass('is-playing');
            this.$_elements.ul_playlist.find('a').eq(plugin._currentTrackIndex).addClass('is-playing');
            
            this.$_elements.btnToggleCollapsePlayer.fadeIn(300);
			this.$_elements.playerProgressBarContainer.fadeIn(300);
			
			this.$_elements.trackDuration.hide();
			this.$_elements.btnNext.show();
            
            this.playSong();
        },
        
        _onClickStopButton: function() {
            
            this.$_elements.btnStop.hide();
            this.$_elements.btnPlay.show();
            
            this.$_elements.html.removeClass('song-is-playing');
            this.$_elements.ul_playlist.find('a').removeClass('is-playing');
            
            this.$_elements.btnToggleCollapsePlayer.hide();
			this.$_elements.playerProgressBarContainer.hide();
			this.$_elements.trackDuration.show();
			this.$_elements.btnNext.hide();
            
            this.stopSong();
        },
        
        //
        updateArtistPanel: function(trackIndex) {
            
            if (this._oldTrackIndex == this._currentTrackIndex) {
                console.log('same track');
                
            } else {
            
                // Assign Current track values
                this.$_elements.trackName.text(this._settings.tracks[trackIndex].name);
                this.$_elements.trackCredits.text(this._settings.tracks[trackIndex].credits);
                this.$_elements.trackDesc.text(this._settings.tracks[trackIndex].desc);
                this.$_elements.trackDuration.text(this._settings.tracks[trackIndex].tracktime);
                
                // Video
                this._newVideo.src = this._settings.tracks[trackIndex].videoUrl;
                this._newVideo.load();
                
                $(this._newVideo).on('canplaythrough', function() {
                    console.log('video is loaded');
                    plugin._videoReady = true;
                    $(plugin._newVideo).off('canplaythrough');
                    plugin._checkIfMediasAreReady();
                });
                
                // Audio
                this._newAudio.src = this._settings.tracks[trackIndex].audioUrl;
                this._newAudio.load();
                
                $(this._newAudio).on('canplay', function() {
                    console.log('audio is loaded');
                    plugin._audioReady = true;
                    $(plugin._newAudio).off('canplay');
                    plugin._checkIfMediasAreReady();
                });
                
                // Player
                this.$_elements.playerSongName.text(this._settings.tracks[trackIndex].name);
                this.$_elements.playerTime_Now.css({'width': '0%'});
            }   
        },
        
        //
        skip: function() {

            var skipToSongIndex = parseInt(this._currentTrackIndex) + 1;
            
            if (skipToSongIndex == parseInt(this._settings.tracks.length)) {
                // If we reach end of tracks, go back to first.
                skipToSongIndex = 0;
            }
            
            this._songListened(this._currentTrackIndex);
            this._onClickTrack(skipToSongIndex);
            
        },
        
        //
        playSong() {
            
            this.isSongPlaying = true;
			
			this._newVideo.play();
			this._newAudio.play();

        },
        
        //
        stopSong() {
            
            this.isSongPlaying = false;
			
			this._newVideo.pause();
			this._newAudio.pause();
            
        },
        
        //
        openArtistPanel: function() {
            
            console.log('Open artist panel');
            this.$_elements.html.addClass('show-artistPanel');
            
            this._settings.parentContainer.fadeOut(300, function() {
				plugin.$_elements.player.fadeIn(300);
			});
        
        },
        
        hideArtistPanel: function() {
            
            this._clickcount = 0;
            
            console.log('Close artist panel');
            this.$_elements.html.removeClass('show-artistPanel');
			
			this.$_elements.player.fadeOut(300, function() {
				plugin._settings.parentContainer.fadeIn(300);
			});
            
        },
        
        toggleCollapsePlayer: function() {
            this.$_elements.html.toggleClass('player-is-collapse');
        },
        
        hidePlayer: function() {
            this.$_elements.html.addClass('player-is-collapse');
        },
        
        showPlayer: function() {
            this.$_elements.html.removeClass('player-is-collapse');
        },
		
	});
	//Plugin wrapper
	$.fn[PLUGIN_NAME] = function (options) {
		this.each(function () {
			if (!$.data(this, "plugin_" + PLUGIN_NAME)) {
				$.data(this, "plugin_" + PLUGIN_NAME, new Plugin(this, options));
			}
		});
		return this;
	};
	$.fn[PLUGIN_NAME].defaults = {
		property  : 'value',
		onComplete: null
	};
})(jQuery, window, document);