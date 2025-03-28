# Bell Website

A simple, mobile-optimized website that displays a bell image and plays random bell sounds when tapped or clicked.

## Features

- Displays a bell image that fills most of the screen
- Plays a random bell sound when tapped/clicked anywhere on the screen
- Supports up to 20 simultaneous sounds playing at once
- Mobile-optimized for touch interactions
- Works on iOS, Android, and desktop browsers

## How to Use

1. Open the `index.html` file in a web browser, or host the files on a web server
2. Tap or click anywhere on the screen to play a random bell sound
3. Tap or click multiple times to create overlapping sounds

## File Structure

- `index.html` - Main HTML file
- `styles.css` - CSS styles for the website
- `app.js` - JavaScript code for handling audio playback
- `assets/` - Directory containing the bell image and sound files
  - `bell.png` - The bell image
  - Various `.mp3` files - Bell sound files that play randomly

## Mobile Browser Compatibility Notes

For optimal experience on mobile devices:
- Allow browser access to play audio
- For iOS devices, audio will be initialized on first touch
- The page prevents zooming to provide a better touch experience 