const Storage = {
    save: (key, data) => localStorage.setItem(`pulsebeat_${key}`, JSON.stringify(data)),
    get: (key) => JSON.parse(localStorage.getItem(`pulsebeat_${key}`)) || null,
    
    // Favorites Logic
    getFavorites: () => Storage.get('favorites') || [],
    
    toggleFavorite: (songId) => {
        let favs = Storage.getFavorites();
        const index = favs.indexOf(songId);
        
        if(index > -1) {
            favs.splice(index, 1); // Remove if already liked
            showToast("Removed from favorites 💔");
        } else {
            favs.push(songId); // Add if not liked
            showToast("Added to favorites ❤️");
        }
        
        Storage.save('favorites', favs);
        return favs;
    },
    
    // Settings Logic
    saveSettings: (settings) => Storage.save('settings', settings),
    getSettings: () => Storage.get('settings') || { theme: 'dark', volume: 1 }
};

// Global Toast utility for notifications
function showToast(message) {
    const container = document.getElementById('toast-container');
    if(!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}