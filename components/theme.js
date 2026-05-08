
document.addEventListener('DOMContentLoaded', () => {
    // 1. Apply theme on initial load
    const settings = Storage.getSettings();
    document.documentElement.setAttribute('data-theme', settings.theme);

    // 2. Handle theme toggle clicks using Event Delegation
    document.addEventListener('click', (e) => {
        // e.target.closest() ensures clicking the icon inside the button still works
        const themeBtn = e.target.closest('#theme-toggle');
        
        if (themeBtn) {
            // Get current settings
            let currentSettings = Storage.getSettings();
            
            // Toggle the theme
            currentSettings.theme = currentSettings.theme === 'dark' ? 'light' : 'dark';
            
            // Save to localStorage
            Storage.saveSettings(currentSettings);
            
            // Apply the new theme to the document
            document.documentElement.setAttribute('data-theme', currentSettings.theme);
            
            // Show notification
            showToast(`Theme changed to ${currentSettings.theme} mode`);
        }
    });
});