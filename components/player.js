class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('audio-source');
        this.queue = [...songsData];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isShuffle = false;
        this.isRepeat = false;

        // DOM Elements
        this.playBtn = document.getElementById('play-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.shuffleBtn = document.getElementById('shuffle-btn');
        this.repeatBtn = document.getElementById('repeat-btn');
        this.progressBar = document.getElementById('progress-bar');
        this.progress = document.getElementById('progress');
        this.volumeSlider = document.getElementById('volume-slider');
        this.likeBtn = document.getElementById('like-btn');

        this.init();
    }

    init() {
        if(this.queue.length > 0) {
            this.loadSong(this.queue[this.currentIndex]);
        }
        const settings = Storage.getSettings();
        this.audio.volume = settings.volume;
        this.volumeSlider.value = settings.volume;

        this.addEventListeners();
    }

    loadSong(song) {
        if(!song) return;
        this.audio.src = song.src;
        document.getElementById('track-title').innerText = song.title;
        document.getElementById('track-artist').innerText = song.artist;
        document.getElementById('cover-img').src = song.cover;
        
        // Update Heart Icon based on if it's in favorites
        const favs = Storage.getFavorites();
        if(favs.includes(song.id)) {
            this.likeBtn.innerHTML = '<i class="fa-solid fa-heart" style="color:var(--secondary-color)"></i>';
        } else {
            this.likeBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
        }
    }

    togglePlay() {
        if (this.isPlaying) {
            this.audio.pause();
            this.playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            document.getElementById('album-art-container').classList.remove('playing');
        } else {
            this.audio.play();
            this.playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            document.getElementById('album-art-container').classList.add('playing');
        }
        this.isPlaying = !this.isPlaying;
    }

    nextSong() {
        if(this.isShuffle) {
            this.currentIndex = Math.floor(Math.random() * this.queue.length);
        } else {
            this.currentIndex = (this.currentIndex + 1) % this.queue.length;
        }
        this.loadSong(this.queue[this.currentIndex]);
        if(this.isPlaying) this.audio.play();
    }

    prevSong() {
        this.currentIndex = (this.currentIndex - 1 + this.queue.length) % this.queue.length;
        this.loadSong(this.queue[this.currentIndex]);
        if(this.isPlaying) this.audio.play();
    }

    updateProgress(e) {
        const { duration, currentTime } = e.srcElement;
        if(duration) {
            const progressPercent = (currentTime / duration) * 100;
            this.progress.style.width = `${progressPercent}%`;
            
            let min = Math.floor(currentTime / 60);
            let sec = Math.floor(currentTime % 60);
            document.getElementById('current-time').innerText = `${min}:${sec < 10 ? '0'+sec : sec}`;
            
            let tMin = Math.floor(duration / 60);
            let tSec = Math.floor(duration % 60);
            document.getElementById('total-time').innerText = `${tMin}:${tSec < 10 ? '0'+tSec : tSec}`;
        }
    }

    setProgress(e) {
        const width = this.progressBar.clientWidth;
        const clickX = e.offsetX;
        const duration = this.audio.duration;
        this.audio.currentTime = (clickX / width) * duration;
    }

    addEventListeners() {
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.nextBtn.addEventListener('click', () => this.nextSong());
        this.prevBtn.addEventListener('click', () => this.prevSong());
        this.audio.addEventListener('timeupdate', (e) => this.updateProgress(e));
        this.progressBar.addEventListener('click', (e) => this.setProgress(e));
        this.audio.addEventListener('ended', () => { if(this.isRepeat) this.audio.play(); else this.nextSong(); });

        this.volumeSlider.addEventListener('input', (e) => {
            this.audio.volume = e.target.value;
            let set = Storage.getSettings();
            set.volume = e.target.value;
            Storage.saveSettings(set);
        });

        // HEART BUTTON CLICK LOGIC
        this.likeBtn.addEventListener('click', () => {
            const currentSong = this.queue[this.currentIndex];
            Storage.toggleFavorite(currentSong.id); // Save to LocalStorage
            this.loadSong(currentSong); // Refresh the icon color
            
            // If the user is currently looking at the favorites page, refresh the grid dynamically!
            if (typeof renderFavorites === "function" && document.getElementById('favorites-grid')) {
                renderFavorites(); 
            }
        });
    }
}