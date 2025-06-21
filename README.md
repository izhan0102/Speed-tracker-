# GPS Speedometer

A real-time speedometer that tracks the speed of a user's device using GPS. This application displays an accurate speedometer without showing a map.

## Features

- Real-time speed tracking using device GPS
- Displays speed in kilometers per hour (km/h)
- Shows GPS accuracy in meters
- Tracks top speed and total distance traveled
- Start/Stop tracking button
- Dark theme with glowing cyan UI
- Works on mobile devices

## How It Works

The application uses the browser's Geolocation API to track the user's position and speed. It calculates speed in two ways:

1. Using the native `speed` property from the Geolocation API (when available)
2. Calculating speed based on the distance between consecutive position readings (as a fallback)

## Running Locally

### Option 1: Using Node.js

1. Make sure you have [Node.js](https://nodejs.org/) installed
2. Clone this repository
   ```
   git clone https://github.com/izhan0102/Speed-tracker-.git
   ```
3. Open a terminal in the project directory
4. Install dependencies (if you want to use nodemon for development):
   ```
   npm install
   ```
5. Start the server:
   ```
   npm start
   ```
   Or for development with auto-reload:
   ```
   npm run dev
   ```
6. Open your browser and navigate to `http://localhost:3001`

### Option 2: Using Python

If you have Python installed, you can use its built-in HTTP server:

For Python 3:
```
python -m http.server 8000
```

For Python 2:
```
python -m SimpleHTTPServer 8000
```

Then open your browser and navigate to `http://localhost:8000`

## Usage

1. Open the application in a web browser on a device with GPS capabilities
2. Grant location permissions when prompted
3. Click the "Start Tracking" button to begin GPS tracking
4. The speedometer will show your current speed in km/h
5. Top speed and total distance will be updated as you move
6. Click "Stop Tracking" to pause tracking

## Requirements

- A device with GPS capabilities (smartphone, tablet, or laptop with GPS)
- A modern web browser with Geolocation API support
- Location permissions enabled for the website

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 