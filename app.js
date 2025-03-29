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
    
    // Keep track of recently played sounds to avoid repetition
    const recentlyPlayed = [];
    const HISTORY_SIZE = Math.min(4, soundFiles.length - 1); // Don't repeat the last 4 sounds

    // Create a pool of audio objects that we'll reuse
    const audioPool = [];
    const POOL_SIZE = MAX_CONCURRENT_SOUNDS + 5; // Add a buffer
    
    // Initialize audio pool
    for (let i = 0; i < POOL_SIZE; i++) {
        const audio = new Audio();
        audio.inUse = false;
        audioPool.push(audio);
    }
    
    // Get an available audio object from the pool
    function getAudioFromPool() {
        // First try to find an unused one
        let audio = audioPool.find(a => !a.inUse);
        
        // If none available, take the oldest one that's not playing
        if (!audio) {
            audio = audioPool.find(a => !a.paused && (a.currentTime >= a.duration - 0.1));
        }
        
        // If still none, take the oldest one regardless
        if (!audio) {
            audio = audioPool[0];
        }
        
        // Reset and mark as in use
        audio.pause();
        audio.currentTime = 0;
        audio.inUse = true;
        
        // Move to end of pool (for LRU behavior)
        const index = audioPool.indexOf(audio);
        audioPool.splice(index, 1);
        audioPool.push(audio);
        
        return audio;
    }
    
    // Function to release audio back to the pool
    function releaseAudioToPool(audio) {
        audio.inUse = false;
    }

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
        
        // Get audio object from pool
        const audioElement = getAudioFromPool();
        audioElement.src = soundFiles[selectedIndex];
        
        // Play the sound
        const playPromise = audioElement.play();
        
        // Handle play promise for browsers that return it
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Playback started successfully
            }).catch(error => {
                // Auto-play was prevented or other error
                console.log('Playback error:', error);
                releaseAudioToPool(audioElement);
            });
        }
        
        // Release audio to pool when finished
        audioElement.addEventListener('ended', () => {
            releaseAudioToPool(audioElement);
        }, { once: true });
    }

    // Periodically check for and clean up stuck audio elements
    setInterval(() => {
        audioPool.forEach(audio => {
            if (audio.ended || audio.paused || (audio.currentTime >= audio.duration - 0.1)) {
                releaseAudioToPool(audio);
            }
        });
    }, 5000);

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
    
    // Fix for iOS Audio Context - need user interaction to initialize audio
    function unlockAudioContext() {
        audioPool.forEach(audio => {
            // Just load the audio object, don't play it yet
            audio.load();
        });
        
        // Create a temporary audio element to unlock the audio context
        const tempAudio = new Audio(soundFiles[0]);
        tempAudio.play().then(() => {
            tempAudio.pause();
            tempAudio.currentTime = 0;
        }).catch(e => {
            // Silence the error, this is just to unlock the audio context
        });
        
        // Remove the event listeners once unlocked
        document.removeEventListener('touchstart', unlockAudioContext, true);
        document.removeEventListener('click', unlockAudioContext, true);
    }
    
    // Add event listeners to unlock audio
    document.addEventListener('touchstart', unlockAudioContext, true);
    document.addEventListener('click', unlockAudioContext, true);
}); 