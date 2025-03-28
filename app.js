document.addEventListener('DOMContentLoaded', () => {
    // Array of sound file paths
    const soundFiles = [
        'assets/1f.mp3',
        'assets/1ff.mp3',
        'assets/1fff.mp3',
        'assets/2f.mp3',
        'assets/2ff.mp3',
        'assets/2fff.mp3',
        'assets/3f.mp3',
        'assets/3ff.mp3',
        'assets/3fff.mp3'
    ];

    // Maximum number of concurrent sounds
    const MAX_CONCURRENT_SOUNDS = 20;
    
    // Keep track of active audio elements
    const activeSounds = [];
    
    // Keep track of recently played sounds to avoid repetition
    const recentlyPlayed = [];
    const HISTORY_SIZE = Math.min(4, soundFiles.length - 1); // Don't repeat the last 4 sounds

    // Preload all audio files for better performance
    const audioCache = soundFiles.map(file => {
        const audio = new Audio(file);
        audio.load(); // Preload the audio
        return audio;
    });

    // Function to play a varied sound (not from recently played)
    function playVariedSound() {
        let availableSounds = [...Array(soundFiles.length).keys()]; // Indices of all sounds
        
        // Remove recently played sounds from available options
        if (recentlyPlayed.length > 0) {
            availableSounds = availableSounds.filter(index => !recentlyPlayed.includes(index));
        }
        
        // If we've somehow used all sounds, just use any random sound
        if (availableSounds.length === 0) {
            availableSounds = [...Array(soundFiles.length).keys()];
        }
        
        // Get a random sound from the available options
        const randomPosition = Math.floor(Math.random() * availableSounds.length);
        const selectedIndex = availableSounds[randomPosition];
        
        // Add to recently played history
        recentlyPlayed.push(selectedIndex);
        if (recentlyPlayed.length > HISTORY_SIZE) {
            recentlyPlayed.shift(); // Remove oldest entry
        }
        
        // Create a new audio instance from the selected sound
        const audioElement = new Audio(soundFiles[selectedIndex]);
        
        // Play the sound
        audioElement.play();
        
        // Add to active sounds
        activeSounds.push(audioElement);
        
        // Remove from active sounds when finished
        audioElement.addEventListener('ended', () => {
            const index = activeSounds.indexOf(audioElement);
            if (index !== -1) {
                activeSounds.splice(index, 1);
            }
        });
        
        // If we have too many sounds playing, remove the oldest one
        if (activeSounds.length > MAX_CONCURRENT_SOUNDS) {
            const oldestSound = activeSounds.shift();
            oldestSound.pause();
            oldestSound.currentTime = 0;
        }
    }

    // Add event listeners for both click and touch
    const bellContainer = document.getElementById('bell-container');
    
    bellContainer.addEventListener('click', (e) => {
        e.preventDefault();
        playVariedSound();
    });
    
    bellContainer.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent default behavior (e.g., zooming)
        playVariedSound();
    });
    
    // Enable audio on iOS devices (which require user interaction)
    document.addEventListener('touchstart', () => {
        audioCache.forEach(audio => {
            audio.play().then(() => {
                audio.pause();
                audio.currentTime = 0;
            }).catch(err => {
                // Silence error since this is just for initialization
            });
        });
    }, { once: true });
}); 