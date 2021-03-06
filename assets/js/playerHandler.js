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
			isLocked: false,
			cookieID: undefined
            
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
			
			if (this._settings.localStorageID == undefined) {
				console.log('NEED LOCALSTORAGE ID')
			}
        },
        
		// Cache DOM nodes for performance
		_build: function () {
			
			this.$_element = $(this._element);
			
			this.localStorageItem = 'songsListened' + plugin._settings.localStorageID;
			
			if (localStorage.getItem(plugin.localStorageItem) === null) {
				this.storedSongs = [];
			} else {
				this.storedSongs = localStorage.getItem(plugin.localStorageItem).split(',')
			}
			
			
            this._buildPlaylist();
            this._buildArtistPanel();
			this._setPlaylistSongListened();

			if (this._settings.isLocked == false) {
				this._buildMediasElement();
            	this._buildProgressBar();
			} else {
				this.lockPlayer();
			}
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
				.append($('<p/>', { id: 'player_trackname_part' }))
				.append($('<p/>', { id: 'player_credits_place', class: 'text-theme-f' })
					.append($('<span/>'))
				)
				.append($('<p/>', { id: 'player_credits_text', class: 'text-theme-f' })
					.append($('<span/>'))
				)
				.append($('<p/>', { id: 'player_credits_voiceActor', class: 'text-theme-f' })
					.append($('<span/>'))
				)
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
						text: 'Retour ?? la liste de lecture',
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
						text: 'Arr??te la balado',
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
					.append($('<div/>', { id: 'songLock' }))
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
			this.$_elements.body = $('body');
            this.$_elements.ul_playlist = $('#playlist-list'); // list of songs
            
			this.$_elements.player = $('#player');
			this.$_elements.trackName = this.$_elements.player.find('h2');
			this.$_elements.trackNamePart = this.$_elements.player.find('#player_trackname_part');
			this.$_elements.trackCreditsPlace = this.$_elements.player.find('#player_credits_place span');
			this.$_elements.trackCreditsText = this.$_elements.player.find('#player_credits_text span');
			this.$_elements.trackCreditsVoiceActor = this.$_elements.player.find('#player_credits_voiceActor span');
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
			this.$_elements.songLock = this.$_elements.player.find('#songLock');
			
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
			this._newVideoSrc = document.createElement('source');
			this._newVideo.loop = true;
			this._newVideo.controls = false;
			this._newVideo.setAttribute('playsinline', true);
			this._newVideo.setAttribute('muted', true);
			
			this._newVideo.appendChild(plugin._newVideoSrc);
			// this._newVideo.setAttribute('preload', true);
            
            this.$_elements.artistVideo.append(this._newVideo);

            // Audio
            this._newAudio = new Audio();
			
			$(this._newAudio).on('ended', function() {
				// plugin.$_playlistEl.closest('li').addClass('listened');
				// $(plugin._newAudio).off('ended');
				plugin.skip();
				
			});

        },
		
		_setPlaylistSongListened: function() {
		
			this.$_elements.ul_playlist.find('li').each(function(i) {
				
				var $this = $(this);
				
				if ($.inArray(JSON.stringify(i), plugin.storedSongs) != -1) {
					
					$this.addClass('listened');
					
				}
				
			});
			
			console.log(this.storedSongs);
		},
        
        //
        _songListened: function(trackIndex) {
            
            this.$_elements.ul_playlist.find('li').eq(trackIndex).addClass('listened');
			
			// Get the existing data
			var existing = localStorage.getItem(plugin.localStorageItem);

			// If no existing data, create an array
			// Otherwise, convert the localStorage string to an array
			existing = existing ? existing.split(',') : [];
			
			if($.inArray(JSON.stringify(trackIndex), existing) != -1) {
				
				console.log("is in array");
				
			} else {
				
				// Add new data to localStorage Array
				existing.push(trackIndex);

				// Save back to localStorage
				localStorage.setItem(plugin.localStorageItem, existing.toString());
				
				this.storedSongs = localStorage.getItem(plugin.localStorageItem).split(',');

				console.log(this.storedSongs);
			} 

			

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
						.append($('<span/>', { class: 'songName text-theme-d', text: value.name }))
						.append($('<span/>', { class: 'name_part text-theme-e', text: value.name_part }))
						
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
				this.$_elements.trackNamePart.text(this._settings.tracks[trackIndex].name_part);
                this.$_elements.trackCreditsPlace.text(this._settings.tracks[trackIndex].credits_place);
				this.$_elements.trackCreditsText.text(this._settings.tracks[trackIndex].credits_text);
				this.$_elements.trackCreditsVoiceActor.text(this._settings.tracks[trackIndex].credits_voiceActor);
                this.$_elements.trackDesc.text(this._settings.tracks[trackIndex].desc);
                this.$_elements.trackDuration.text(this._settings.tracks[trackIndex].tracktime);
                
				if (this._settings.isLocked == false) {
					// Video
					this._newVideoSrc.setAttribute('src', this._settings.tracks[trackIndex].videoUrl);
					this._newVideo.load();
					// console.log(this._newVideoSrc);
					
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

				}
                
                
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
			
			console.log(skipToSongIndex)
            
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
		
		lockPlayer: function() {
			this.$_elements.body.addClass('zone-locked');
		}
		
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