
    (() => {
      // Define playlist
      const playlist = [
        {
          title: "Sunny Day",
          artist: "Dreamcatcher",
          src: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_01e8345730.mp3?filename=sunny-day-24215.mp3",
          artwork: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/873251cc-e996-403e-a243-151d5d417b5a.png"
        },
        {
          title: "Calm Ocean",
          artist: "Wave Tones",
          src: "https://cdn.pixabay.com/download/audio/2021/10/12/audio_1f5392d53a.mp3?filename=ocean-waves-ambient-6816.mp3",
          artwork: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/465096ba-4ef5-4279-abef-ee477f6c8213.png"
        },
        {
          title: "City Lights",
          artist: "Neon Flow",
          src: "https://cdn.pixabay.com/download/audio/2022/05/24/audio_bf3110b9c1.mp3?filename=city-lights-13375.mp3",
          artwork: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/23a73e88-1ed3-4251-a333-25c9d7ff0801.png"
        }
      ];

      // Cached DOM elements
      const audio = document.getElementById('audio');
      const playBtn = document.getElementById('play-btn');
      const playIcon = document.getElementById('play-icon');
      const prevBtn = document.getElementById('prev-btn');
      const nextBtn = document.getElementById('next-btn');
      const songTitle = document.getElementById('song-title');
      const artistName = document.getElementById('artist-name');
      const albumArt = document.getElementById('album-art');
      const progressContainer = document.getElementById('progress-container');
      const progress = document.getElementById('progress');
      const currentTimeEl = document.getElementById('current-time');
      const durationEl = document.getElementById('duration');
      const volumeIcon = document.getElementById('volume-icon');
      const volumeSlider = document.getElementById('volume-slider');
      const playlistContainer = document.getElementById('playlist');

      let currentIndex = 0;
      let isPlaying = false;
      let autoplay = true;

      // Load track by index
      function loadTrack(index) {
        if(index < 0) index = playlist.length - 1;
        if(index >= playlist.length) index = 0;
        currentIndex = index;

        const track = playlist[index];
        audio.src = track.src;
        songTitle.textContent = track.title;
        artistName.textContent = track.artist;
        albumArt.src = track.artwork;
        albumArt.alt = `Album artwork of ${track.title} by ${track.artist}`;
        updatePlaylistHighlight();
      }

      // Play audio
      function playAudio() {
        audio.play();
        isPlaying = true;
        playIcon.textContent = 'pause';
      }

      // Pause audio
      function pauseAudio() {
        audio.pause();
        isPlaying = false;
        playIcon.textContent = 'play_arrow';
      }

      function togglePlayPause() {
        if(isPlaying) pauseAudio();
        else playAudio();
      }

      // Prev track
      function prevTrack() {
        loadTrack(currentIndex - 1);
        playAudio();
      }

      // Next track
      function nextTrack() {
        loadTrack(currentIndex + 1);
        playAudio();
      }

      // Update progress bar width
      function updateProgress() {
        if(audio.duration) {
          const percent = (audio.currentTime / audio.duration) * 100;
          progress.style.width = percent + '%';
          currentTimeEl.textContent = formatTime(audio.currentTime);
          durationEl.textContent = formatTime(audio.duration);
          progressContainer.setAttribute('aria-valuenow', percent.toFixed(0));
        }
      }

      // Format time in mm:ss
      function formatTime(sec) {
        const minutes = Math.floor(sec / 60);
        const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
      }

      // Set playback position by clicking progress bar
      function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        if(audio.duration) {
          audio.currentTime = (clickX / width) * audio.duration;
        }
      }

      // Volume control
      function setVolume(value) {
        audio.volume = value;
        volumeSlider.value = value;
        updateVolumeIcon(value);
      }

      // Update volume icon
      function updateVolumeIcon(vol) {
        if(vol === 0) volumeIcon.textContent = 'volume_off';
        else if(vol < 0.4) volumeIcon.textContent = 'volume_mute';
        else volumeIcon.textContent = 'volume_up';
      }

      // Mute / Unmute toggle
      function toggleMute() {
        if(audio.volume > 0) {
          setVolume(0);
        } else {
          setVolume(1);
        }
      }

      // Build playlist UI
      function buildPlaylist() {
        playlistContainer.innerHTML = '';
        playlist.forEach((track, i) => {
          const item = document.createElement('div');
          item.classList.add('playlist-item');
          item.setAttribute('role','listitem');
          item.tabIndex = 0;
          item.dataset.index = i;
          const titleSpan = document.createElement('span');
          titleSpan.textContent = `${track.title} - ${track.artist}`;
          item.appendChild(titleSpan);

          item.addEventListener('click', () => {
            loadTrack(i);
            playAudio();
          });
          item.addEventListener('keydown', e => {
            if(e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              item.click();
            }
          });
          playlistContainer.appendChild(item);
        });
        updatePlaylistHighlight();
      }

      // Highlight current playing in playlist
      function updatePlaylistHighlight() {
        Array.from(playlistContainer.children).forEach(item => {
          item.classList.remove('active');
        });
        const activeItem = playlistContainer.querySelector(`[data-index="${currentIndex}"]`);
        if(activeItem) activeItem.classList.add('active');
      }

      // Event listeners
      playBtn.addEventListener('click', togglePlayPause);
      prevBtn.addEventListener('click', prevTrack);
      nextBtn.addEventListener('click', nextTrack);
      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('ended', () => {
        if(autoplay) nextTrack();
        else pauseAudio();
      });
      progressContainer.addEventListener('click', setProgress);
      volumeSlider.addEventListener('input', e => {
        setVolume(parseFloat(e.target.value));
      });
      volumeIcon.addEventListener('click', toggleMute);
      volumeIcon.addEventListener('keydown', e => {
        if(e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleMute();
        }
      });

      // Keyboard controls for accessibility
      window.addEventListener('keydown', e => {
        if(e.target.tagName.toLowerCase() === 'input') return; // skip inputs
        switch(e.key) {
          case ' ':
          case 'k':
            e.preventDefault();
            togglePlayPause();
            break;
          case 'ArrowRight':
            e.preventDefault();
            nextTrack();
            break;
          case 'ArrowLeft':
            e.preventDefault();
            prevTrack();
            break;
          case 'ArrowUp':
            e.preventDefault();
            setVolume(Math.min(audio.volume + 0.05, 1));
            break;
          case 'ArrowDown':
            e.preventDefault();
            setVolume(Math.max(audio.volume - 0.05, 0));
            break;
        }
      });

      // Init player
      loadTrack(currentIndex);
      buildPlaylist();
      setVolume(1);

    })();
  
