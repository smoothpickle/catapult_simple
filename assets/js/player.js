var albumData = {
  tracks: [
    {
        id: ":1:",
        title: "Station St-Laurent",
        coord1: "48°51'12.2″N",
        coord2: "2°20'55.7″E",
        credit: "Ludovic Longprés Roxane Myre",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec massa rutrum, condimentum erat id, lacinia quam. Duis et tincidunt metus. Sed semper urna nisi.",
        mp3_link: "./assets/mp3/zone-rouge/piste1.mp3"
    },
  ]
};

var trackData = "";

albumData.tracks.forEach(function(item, idx) {
  //console.log(item.mp3_link);
  trackData +=
    '<p><a href="' +
    item.mp3_link +
    '" class="jouele">' +
    item.title +
    "</a></p>";
});

//$(".jouele-playlist").html(trackData);

var elms = [
  "track",
  "timer",
  "duration",
  "playBtn",
  "pauseBtn",
  "prevBtn",
  "nextBtn",
  "playlistBtn",
  "volumeBtn",
  "progress",
  "bar",
  "loading",
  "playlist",
  "list",
  "volume",
  "barEmpty",
  "barFull",
  "sliderBtn"
];
elms.forEach(function(elm) {
  window[elm] = document.getElementById(elm);
});
var Player = function(playlist) {
  this.playlist = playlist;
  this.index = 0;
  track.innerHTML = "1. " + playlist[0].title;
  playlist.forEach(function(song) {
    var div = document.createElement("div");
    div.className = "list-song";
    div.innerHTML = song.title;
    div.onclick = function() {
      player.skipTo(playlist.indexOf(song));
    };
    list.appendChild(div);
  });
};
Player.prototype = {
  play: function(index) {
    var self = this;
    var sound;
    index = typeof index === "number" ? index : self.index;
    var data = self.playlist[index];
    if (data.howl) {
      sound = data.howl;
    } else {
      sound = data.howl = new Howl({
        src: [
          data.mp3_link
          //"./audio/" + data.file + ".webm",
          //"./audio/" + data.mp3_link + ".mp3"
        ],
        html5: true,
        onplay: function() {
          duration.innerHTML = self.formatTime(Math.round(sound.duration()));
          requestAnimationFrame(self.step.bind(self));
          bar.style.display = "none";
          loading.style.display = "none";
          pauseBtn.style.display = "block";
          nextBtn.style.display = "block";
          prevBtn.style.display = "block";
        },
        onload: function() {
          bar.style.display = "none";
          loading.style.display = "none";
        },
        onend: function() {
          bar.style.display = "block";
          self.skip("next");
        },
        onpause: function() {
          bar.style.display = "block";
        },
        onstop: function() {
          bar.style.display = "block";
        }
      });
    }
    sound.play();
    track.innerHTML = index + 1 + ". " + data.title;
   // if (sound.state() === "loaded") {
      //playBtn.style.display = "none";
      //pauseBtn.style.display = "block";
      //nextBtn.style.display = "block";
      //prevBtn.style.display = "block";
   // } else {
      loading.style.display = "block";
      playBtn.style.display = "none";
      pauseBtn.style.display = "none";
      nextBtn.style.display = "none";
      prevBtn.style.display = "none";
   // }
    self.index = index;
  },
  pause: function() {
    var self = this;
    var sound = self.playlist[self.index].howl;
    sound.pause();
    playBtn.style.display = "block";
    pauseBtn.style.display = "none";
  },
  skip: function(direction) {
    var self = this;
    var index = 0;
    if (direction === "prev") {
      index = self.index - 1;
      if (index < 0) {
        index = self.playlist.length - 1;
      }
    } else {
      index = self.index + 1;
      if (index >= self.playlist.length) {
        index = 0;
      }
    }
    self.skipTo(index);
  },
  skipTo: function(index) {
    var self = this;
    //nextBtn.style.display = "none";
   // prevBtn.style.display = "none";
    if (self.playlist[self.index].howl) {
      self.playlist[self.index].howl.pause();
      self.playlist[self.index].howl.seek(0);
    }
    progress.style.width = "0%";
    self.play(index);
  },
  volume: function(val) {
    var self = this;
    Howler.volume(val);
    var barWidth = val * 90 / 100;
    barFull.style.width = barWidth * 100 + "%";
    sliderBtn.style.left =
      window.innerWidth * barWidth + window.innerWidth * 0.05 - 25 + "px";
  },
  seek: function(per) {
    var self = this;
    var sound = self.playlist[self.index].howl;
    //if (sound.playing()) {
      sound.seek(sound.duration() * per);
   // }
  },
  step: function() {
    var self = this;
    var sound = self.playlist[self.index].howl;
    var seek = sound.seek() || 0;
    timer.innerHTML = self.formatTime(Math.round(seek));
    progress.style.width = (seek / sound.duration() * 100 || 0) + "%";
    if (sound.playing()) {
      requestAnimationFrame(self.step.bind(self));
    }
    //console.log(seek);
  },
  togglePlaylist: function() {
    var self = this;
    var display = playlist.style.display === "block" ? "none" : "block";
    setTimeout(function() {
      playlist.style.display = display;
    }, display === "block" ? 0 : 500);
    playlist.className = display === "block" ? "fadein" : "fadeout";
  },
  toggleVolume: function() {
    var self = this;
    var display = volume.style.display === "block" ? "none" : "block";
    setTimeout(function() {
      volume.style.display = display;
    }, display === "block" ? 0 : 500);
    volume.className = display === "block" ? "fadein" : "fadeout";
  },
  formatTime: function(secs) {
    var minutes = Math.floor(secs / 60) || 0;
    var seconds = secs - minutes * 60 || 0;
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  }
};
var player = new Player(albumData.tracks
//   [
//   { title: "Rave Digger", file: "rave_digger", howl: null },
//   { title: "80s Vibe", file: "80s_vibe", howl: null },
//   { title: "Running Out", file: "running_out", howl: null }
// ]

);
playBtn.addEventListener("click", function() {
  player.play();
});
pauseBtn.addEventListener("click", function() {
  player.pause();
});
prevBtn.addEventListener("click", function() {
  player.skip("prev");
});
nextBtn.addEventListener("click", function() {
  player.skip("next");
});
playlistBtn.addEventListener("click", function() {
  player.togglePlaylist();
});
playlist.addEventListener("click", function() {
  player.togglePlaylist();
});
volumeBtn.addEventListener("click", function() {
  player.toggleVolume();
});
volume.addEventListener("click", function() {
  player.toggleVolume();
});
barEmpty.addEventListener("click", function(event) {
  var per = event.layerX / parseFloat(barEmpty.scrollWidth);
  player.volume(per);
});
sliderBtn.addEventListener("mousedown", function() {
  window.sliderDown = true;
});
sliderBtn.addEventListener("touchstart", function() {
  window.sliderDown = true;
});
volume.addEventListener("mouseup", function() {
  window.sliderDown = false;
});
volume.addEventListener("touchend", function() {
  window.sliderDown = false;
});
var move = function(event) {
  if (window.sliderDown) {
    var x = event.clientX || event.touches[0].clientX;
    var startX = window.innerWidth * 0.05;
    var layerX = x - startX;
    var per = Math.min(
      1,
      Math.max(0, layerX / parseFloat(barEmpty.scrollWidth))
    );
    player.volume(per);
  }
};
volume.addEventListener("mousemove", move);
volume.addEventListener("touchmove", move);

var resize = function() {
  var height = window.innerHeight * 0.3;
  var width = window.innerWidth;
  
  var sound = player.playlist[player.index].howl;
  
  if (sound) {
    var vol = sound.volume();
    var barWidth = vol * 0.9;
    sliderBtn.style.left =
      window.innerWidth * barWidth + window.innerWidth * 0.05 - 25 + "px";
  }
};
window.addEventListener("resize", resize);
resize();
