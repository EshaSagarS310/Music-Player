document.addEventListener('DOMContentLoaded', () => {
    // Initialize Player
    window.player = new MusicPlayer();

    // SPA Router
    const contentDiv = document.getElementById('app-content');
    const navLinks = document.querySelectorAll('.nav-link');

    const loadPage = async (pageName) => {
        try {
            const response = await fetch(`pages/${pageName}.html`);
            if(!response.ok) throw new Error('Page not found');
            const html = await response.text();
            
            contentDiv.innerHTML = `<div class="fade-in-page">${html}</div>`;
            
            // 👉 TRIGGER PAGE SPECIFIC SCRIPTS
            if(pageName === 'home') renderHomeCards();
            if(pageName === 'favorites') renderFavorites();
            if(pageName === 'profile') window.renderProfile();
            if(pageName === 'playlist') window.renderPlaylistPage();

        } catch (error) {
            contentDiv.innerHTML = `<h2>Error loading page</h2>`;
        }
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            e.currentTarget.classList.add('active');
            loadPage(e.currentTarget.getAttribute('data-page'));
        });
    });

    // Load initial page
    loadPage('home');
});

function renderHomeCards() {
    const grid = document.getElementById('trending-grid');
    if(!grid) return;
    
    grid.innerHTML = '';
    songsData.forEach((song, index) => {
        grid.innerHTML += `
            <div class="song-card glass-panel" onclick="window.player.currentIndex=${index}; window.player.loadSong(songsData[${index}]); window.player.togglePlay();">
                <div class="card-img-wrapper" style="position: relative;">
                    <img src="${song.cover}" alt="cover">
                    <div class="play-overlay"><i class="fa-solid fa-play"></i></div>
                    
                    <!-- NEW: Add to Playlist Button -->
                    <button onclick="event.stopPropagation(); window.addSongToPlaylist('${song.id}')" title="Add to Playlist" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); color: #fff; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; z-index: 10; backdrop-filter: blur(5px); transition: 0.3s;" onmouseover="this.style.background='var(--primary-color)'; this.style.color='#000';" onmouseout="this.style.background='rgba(0,0,0,0.6)'; this.style.color='#fff';">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                    
                </div>
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
            </div>
        `;
    });
}


// Inside your MusicPlayer class constructor or init function:
this.audio = new Audio();

// 1. Update Total Duration when song loads
this.audio.addEventListener('loadedmetadata', () => {
    const totalTimeEl = document.getElementById('total-time');
    const mins = Math.floor(this.audio.duration / 60);
    const secs = Math.floor(this.audio.duration % 60);
    if (totalTimeEl) {
        totalTimeEl.innerText = `${mins}:${secs.toString().padStart(2, '0')}`;
    }
});

// 2. The Progress Tracker (The moving line)
this.audio.addEventListener('timeupdate', () => {
    const progress = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    
    if (this.audio.duration) {
        const percent = (this.audio.currentTime / this.audio.duration) * 100;
        // Update the width of the cyan line
        if (progress) progress.style.width = `${percent}%`;

        // Update the 0:00 timer text
        const mins = Math.floor(this.audio.currentTime / 60);
        const secs = Math.floor(this.audio.currentTime % 60);
        if (currentTimeEl) {
            currentTimeEl.innerText = `${mins}:${secs.toString().padStart(2, '0')}`;
        }
    }
});

const progressContainer = document.getElementById('progress-container');
if (progressContainer) {
    progressContainer.addEventListener('click', (e) => {
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = this.audio.duration;
        
        if (duration) {
            this.audio.currentTime = (clickX / width) * duration;
        }
    });
}


// 👉 THE FAVORITES GENERATOR FUNCTION
window.renderFavorites = function() {
    const grid = document.getElementById('favorites-grid');
    const emptyMessage = document.getElementById('no-favorites-message');
    
    if (!grid || !emptyMessage) return;

    const favoriteIds = Storage.getFavorites();
    grid.innerHTML = '';

    if (favoriteIds.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    } else {
        emptyMessage.style.display = 'none';
    }

    favoriteIds.forEach((id) => {
        const realIndex = songsData.findIndex(s => s.id === id);
        if (realIndex === -1) return;
        const song = songsData[realIndex];

        grid.innerHTML += `
            <div class="song-card glass-panel" onclick="window.player.currentIndex=${realIndex}; window.player.loadSong(songsData[${realIndex}]); window.player.togglePlay();">
                <div class="card-img-wrapper" style="position: relative;">
                    <img src="${song.cover}" alt="${song.title}">
                    <div class="play-overlay"><i class="fa-solid fa-play"></i></div>
                    
                    <!-- NEW: Add to Playlist Button -->
                    <button onclick="event.stopPropagation(); window.addSongToPlaylist('${song.id}')" title="Add to Playlist" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); color: #fff; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; z-index: 10; backdrop-filter: blur(5px); transition: 0.3s;" onmouseover="this.style.background='var(--primary-color)'; this.style.color='#000';" onmouseout="this.style.background='rgba(0,0,0,0.6)'; this.style.color='#fff';">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                    
                </div>
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
                <div style="margin-top: 10px; color: var(--secondary-color); font-size: 0.9rem;">
                    <i class="fa-solid fa-heart"></i> Liked
                </div>
            </div>
        `;
    });
}

// --- PROFILE PAGE LOGIC ---

window.editProfile = function() {
    const currentName = Storage.get('username') || "Esha Sagar S";
    const newName = prompt("Enter your new identity:", currentName);
    
    if (newName && newName.trim() !== "") {
        // 1. Save to Storage
        Storage.save('username', newName.trim());
        
        // 2. Update the name on the screen immediately
        const nameEl = document.getElementById('user-display-name');
        if (nameEl) {
            nameEl.innerText = newName.trim();
        }
        
        showToast("Identity updated! ✨");
    }
};

// Create a New Playlist
window.createPlaylist = function() {
    const playlistName = prompt("Enter a name for your new playlist:", "Late Night Drives 🌙");
    
    if (playlistName && playlistName.trim() !== "") {
        let playlists = Storage.get('playlists') || [];
        playlists.push({ id: Date.now(), name: playlistName, songs: [] });
        Storage.save('playlists', playlists);
        
        // Refresh UI if needed
        if (document.getElementById('library-view')) window.renderPlaylistPage();
        if (typeof window.renderSidebarPlaylists === "function") window.renderSidebarPlaylists();
        showToast("Playlist created! 🎵");
    }
};

// Render profile data
window.renderProfile = function() {
    const nameEl = document.getElementById('user-display-name');
    const container = document.getElementById('playlists-container');
    const emptyMsg = document.getElementById('empty-playlist-msg');
    const countEl = document.getElementById('playlist-count');

    if (nameEl) {
        nameEl.innerText = Storage.get('username') || "Sophie 🌸";
    }

    if (container && emptyMsg && countEl) {
        let playlists = Storage.get('playlists') || [];
        countEl.innerText = playlists.length;

        if (playlists.length === 0) {
            emptyMsg.style.display = 'block';
            container.innerHTML = '';
        } else {
            emptyMsg.style.display = 'none';
            container.innerHTML = '';

            playlists.forEach(pl => {
                container.innerHTML += `
                    <div class="glass-panel" style="padding: 20px; border-radius: 16px; text-align: center; border-top: 2px solid #ffb6c1; cursor: pointer; transition: 0.3s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                        <div style="width: 70px; height: 70px; background: rgba(255, 182, 193, 0.15); border-radius: 12px; margin: 0 auto 15px auto; display: flex; align-items: center; justify-content: center;">
                            <i class="fa-solid fa-music" style="font-size: 1.5rem; color: #ff91a4;"></i>
                        </div>
                        <h3 style="font-size: 0.95rem; margin-bottom: 5px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${pl.name}</h3>
                        <p style="font-size: 0.8rem; color: var(--text-secondary);">${pl.songs.length} tracks</p>
                    </div>
                `;
            });

            container.innerHTML += `
                <div class="glass-panel" onclick="window.createPlaylist()" style="padding: 20px; border-radius: 16px; text-align: center; border: 1px dashed #ffb6c1; cursor: pointer; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 160px; transition: 0.3s;" onmouseover="this.style.background='rgba(255, 182, 193, 0.1)'" onmouseout="this.style.background='transparent'">
                    <i class="fa-solid fa-plus" style="font-size: 2rem; color: #ff91a4; margin-bottom: 10px;"></i>
                    <p style="color: var(--text-primary); font-size: 0.9rem;">New Playlist</p>
                </div>
            `;
        }
    }
};

// --- ADVANCED PLAYLIST LOGIC ---

// Render the Main Library Page
window.renderPlaylistPage = function() {
    const container = document.getElementById('playlist-page-container');
    if (!container) return;

    let playlists = Storage.get('playlists') || [];
    container.innerHTML = ''; 

    if (playlists.length === 0) {
        container.innerHTML = `
            <div class="glass-panel" style="padding: 40px; text-align: center; border-radius: 16px; border: 1px dashed var(--glass-border); grid-column: 1 / -1;">
                <p style="color: var(--text-secondary); margin-bottom: 15px;">You haven't created any playlists yet.</p>
                <button onclick="window.createPlaylist()" style="background: var(--primary-color); color: #000; font-weight:600; border: none; padding: 10px 20px; border-radius: 20px; cursor: pointer;">Create Your First Playlist</button>
            </div>
        `;
    } else {
        playlists.forEach(pl => {
            let songCount = Array.isArray(pl.songs) ? pl.songs.length : 0; 
            
            container.innerHTML += `
                <div class="glass-panel" onclick="window.openPlaylist(${pl.id})" style="position: relative; padding: 15px; border-radius: 16px; text-align: center; cursor: pointer; transition: 0.3s;" onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 10px 20px rgba(0, 240, 255, 0.1)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                    
                    <!-- DELETE BUTTON -->
                    <button onclick="event.stopPropagation(); window.deletePlaylist(${pl.id})" style="position: absolute; top: 10px; right: 10px; background: rgba(255, 0, 85, 0.15); color: var(--secondary-color); border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.3s; z-index: 10;" onmouseover="this.style.background='var(--secondary-color)'; this.style.color='#fff';" onmouseout="this.style.background='rgba(255, 0, 85, 0.15)'; this.style.color='var(--secondary-color)';">
                        <i class="fa-solid fa-trash" style="font-size: 0.8rem;"></i>
                    </button>

                    <div style="width: 100%; aspect-ratio: 1; background: rgba(0, 240, 255, 0.1); border-radius: 12px; margin-bottom: 15px; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-music" style="font-size: 2.5rem; color: var(--primary-color); opacity: 0.8;"></i>
                    </div>
                    <h3 style="font-size: 1rem; margin-bottom: 5px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${pl.name}</h3>
                    <p style="font-size: 0.8rem; color: var(--text-secondary);">${songCount} tracks</p>
                </div>
            `;
        });
    }
};

// Open a Specific Playlist Detail View
window.openPlaylist = function(playlistId) {
    let playlists = Storage.get('playlists') || [];
    let playlist = playlists.find(p => p.id === playlistId);
    if(!playlist) return;

    document.getElementById('library-view').style.display = 'none';
    document.getElementById('playlist-detail-view').style.display = 'block';

    if(!Array.isArray(playlist.songs)) playlist.songs = [];

    document.getElementById('detail-title').innerText = playlist.name;
    document.getElementById('detail-creator').innerText = Storage.get('username') || "You";
    document.getElementById('detail-count').innerText = playlist.songs.length;

    const songsContainer = document.getElementById('playlist-songs-container');
    songsContainer.innerHTML = '';

    if(playlist.songs.length === 0) {
        songsContainer.innerHTML = `<p style="text-align:center; color: var(--text-secondary); margin-top: 30px;">This playlist is empty. Go to Home to add songs!</p>`;
        return;
    }

    playlist.songs.forEach((songId, index) => {
        let realIndex = songsData.findIndex(s => s.id === songId);
        if(realIndex === -1) return;
        let song = songsData[realIndex];

        songsContainer.innerHTML += `
            <div class="track-row" onclick="window.player.currentIndex=${realIndex}; window.player.loadSong(songsData[${realIndex}]); window.player.togglePlay();">
                
                <div style="width: 50px; display:flex; justify-content:center;">
                    <span class="track-num">${index + 1}</span>
                    <i class="fa-solid fa-play track-play-icon"></i>
                </div>
                
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${song.cover}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;">
                    <div>
                        <div style="color: var(--text-primary); font-weight: 500; font-size: 0.95rem;">${song.title}</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">${song.artist}</div>
                    </div>
                </div>

                <div style="color: var(--text-secondary); font-size: 0.85rem;">${song.genre}</div>
                
                <div style="text-align: center;">
                    <button class="track-remove-btn" onclick="event.stopPropagation(); window.removeFromPlaylist(${playlist.id}, '${song.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>

            </div>
        `;
    });
};

// Close Playlist Detail View
window.closePlaylist = function() {
    document.getElementById('playlist-detail-view').style.display = 'none';
    document.getElementById('library-view').style.display = 'block';
    window.renderPlaylistPage();
};

// Remove Song from Playlist
window.removeFromPlaylist = function(playlistId, songId) {
    if(confirm("Remove this song from the playlist?")) {
        let playlists = Storage.get('playlists') || [];
        let playlistIndex = playlists.findIndex(p => p.id === playlistId);
        
        if(playlistIndex > -1) {
            playlists[playlistIndex].songs = playlists[playlistIndex].songs.filter(id => id !== songId);
            Storage.save('playlists', playlists);
            window.openPlaylist(playlistId);
            showToast("Song removed.");
        }
    }
};

// Delete Entire Playlist
window.deletePlaylist = function(id) {
    if(confirm("Are you sure you want to delete this playlist?")) {
        let playlists = Storage.get('playlists') || [];
        playlists = playlists.filter(pl => pl.id !== id);
        Storage.save('playlists', playlists); 
        if (document.getElementById('library-view')) window.renderPlaylistPage();
        showToast("Playlist deleted 🗑️");
    }
};

// Add current song to a playlist (global)
window.addCurrentSongToPlaylist = function() {
    const currentSong = window.player.queue[window.player.currentIndex];
    let playlists = Storage.get('playlists') || [];

    if(playlists.length === 0) {
        showToast("Create a playlist first! 🎵");
        return;
    }

    let promptText = "Type the number of the playlist to add this song to:\n\n";
    playlists.forEach((pl, idx) => {
        promptText += `${idx + 1}. ${pl.name}\n`;
    });

    let choice = prompt(promptText);
    let selectedIndex = parseInt(choice) - 1;

    if(!isNaN(selectedIndex) && playlists[selectedIndex]) {
        let targetPlaylist = playlists[selectedIndex];
        if(!Array.isArray(targetPlaylist.songs)) targetPlaylist.songs = [];
        if(!targetPlaylist.songs.includes(currentSong.id)) {
            targetPlaylist.songs.push(currentSong.id);
            Storage.save('playlists', playlists);
            showToast(`Added to ${targetPlaylist.name} ✨`);
        } else {
            showToast("Song is already in this playlist!");
        }
    }
};

// Add a specific song (by ID) to a playlist (called from Home/Favorites)
window.addSongToPlaylist = function(songId) {
    let playlists = Storage.get('playlists') || [];

    if(playlists.length === 0) {
        showToast("Create a playlist first! 🎵");
        document.querySelector('[data-page="playlist"]').click(); 
        return;
    }

    let promptText = "Type the number of the playlist to add this song to:\n\n";
    playlists.forEach((pl, idx) => {
        promptText += `${idx + 1}. ${pl.name}\n`;
    });

    let choice = prompt(promptText);
    let selectedIndex = parseInt(choice) - 1;

    if(!isNaN(selectedIndex) && playlists[selectedIndex]) {
        let targetPlaylist = playlists[selectedIndex];
        if(!Array.isArray(targetPlaylist.songs)) targetPlaylist.songs = [];
        if(!targetPlaylist.songs.includes(songId)) {
            targetPlaylist.songs.push(songId);
            Storage.save('playlists', playlists);
            showToast(`Added to ${targetPlaylist.name} ✨`);
        } else {
            showToast("Song is already in this playlist!");
        }
    }
};

// Render sidebar playlists (if container exists)
window.renderSidebarPlaylists = function() {
    const sidebarList = document.getElementById('sidebar-playlists-list');
    if (!sidebarList) return;

    const playlists = Storage.get('playlists') || [];
    sidebarList.innerHTML = '';

    playlists.forEach(pl => {
        const li = document.createElement('li');
        li.className = 'nav-link';
        li.style.fontSize = '0.85rem';
        li.style.padding = '8px 15px';
        li.innerHTML = `<i class="fa-solid fa-music" style="font-size: 0.7rem; opacity: 0.7;"></i> ${pl.name}`;
        li.onclick = () => {
            document.querySelector('[data-page="playlist"]').click();
            setTimeout(() => window.openPlaylist(pl.id), 100);
        };
        sidebarList.appendChild(li);
    });
};



// --- FULLSCREEN MODE LOGIC ---

const fullscreenBtn = document.getElementById('fullscreen-btn');

fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        // Enter Fullscreen
        document.documentElement.requestFullscreen().catch(err => {
            showToast(`Error attempting to enable fullscreen: ${err.message}`);
        });
        // Change icon to 'compress'
        fullscreenBtn.innerHTML = '<i class="fa-solid fa-compress"></i>';
        showToast("Entering Fullscreen Mode 📺");
    } else {
        // Exit Fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
            // Change icon back to 'expand'
            fullscreenBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';
            showToast("Exiting Fullscreen Mode");
        }
    }
});

// Update icon if user exits fullscreen using 'Esc' key
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        fullscreenBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';
    }
});



// This makes the progress bar move while the song plays
this.audio.addEventListener('timeupdate', () => {
    const progress = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    
    if (this.audio.duration) {
        // Calculate percentage for the bar
        const percent = (this.audio.currentTime / this.audio.duration) * 100;
        progress.style.width = `${percent}%`;

        // Update the timestamp (0:00)
        const mins = Math.floor(this.audio.currentTime / 60);
        const secs = Math.floor(this.audio.currentTime % 60);
        if (currentTimeEl) {
            currentTimeEl.innerText = `${mins}:${secs.toString().padStart(2, '0')}`;
        }
    }
});


