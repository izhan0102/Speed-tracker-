document.addEventListener('DOMContentLoaded', () => {
    const connectionStatus = document.getElementById('connection-status');
    const speedValue = document.querySelector('.speed-value');
    const accuracyValue = document.getElementById('accuracy-value');
    const topSpeedElement = document.getElementById('top-speed');
    const totalDistanceElement = document.getElementById('total-distance');
    const toggleButton = document.getElementById('toggle-tracking');
    
    let watchId = null;
    let lastPosition = null;
    let isConnected = false;
    let isTracking = false;
    let speedReadings = [];
    let topSpeed = 0;
    let totalDistance = 0;
    let lastRecordedPosition = null;

    const geoOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    function updateSpeedometer(speed, accuracy) {
        const displaySpeed = speed < 1.5 ? 0 : speed;
        
        speedValue.textContent = displaySpeed.toFixed(1);
        
        accuracyValue.textContent = Math.round(accuracy);
        
        if (displaySpeed > topSpeed) {
            topSpeed = displaySpeed;
            topSpeedElement.textContent = topSpeed.toFixed(1);
        }
    }

    function handlePositionSuccess(position) {
        console.log('GPS position update received');
        
        if (!isConnected) {
            isConnected = true;
            connectionStatus.textContent = 'Connected to GPS';
            connectionStatus.classList.add('connected');
            console.log('GPS connection established');
        }
        
        const currentPosition = position.coords;
        
        const accuracy = currentPosition.accuracy;
        
        let speed = 0;
        
        if (currentPosition.speed !== null && currentPosition.speed !== undefined) {
            speed = currentPosition.speed * 3.6;
            console.log(`Speed from GPS: ${speed.toFixed(1)} km/h`);
        } 
        else if (lastPosition !== null) {
            const distance = calculateDistance(
                lastPosition.latitude, 
                lastPosition.longitude,
                currentPosition.latitude,
                currentPosition.longitude
            );
            
            const timeDiff = (position.timestamp - lastPosition.timestamp) / 1000;
            
            if (timeDiff > 0) {
                if (distance < accuracy / 2) {
                    speed = 0;
                    console.log(`Ignoring small movement (${distance.toFixed(1)}m) as likely GPS jitter`);
                } else {
                    speed = (distance / timeDiff) * 3.6;
                    console.log(`Calculated speed: ${speed.toFixed(1)} km/h (${distance.toFixed(1)}m over ${timeDiff.toFixed(1)}s)`);
                }
            }
        }
        
        speedReadings.push(speed);
        
        if (speedReadings.length > 3) {
            speedReadings.shift();
        }
        
        const avgSpeed = speedReadings.reduce((sum, val) => sum + val, 0) / speedReadings.length;
        
        updateSpeedometer(avgSpeed, accuracy);
        
        if (lastRecordedPosition !== null && speed > 1.5) {
            const distanceInMeters = calculateDistance(
                lastRecordedPosition.latitude,
                lastRecordedPosition.longitude,
                currentPosition.latitude,
                currentPosition.longitude
            );
            
            if (distanceInMeters > accuracy / 2) {
                totalDistance += distanceInMeters / 1000;
                totalDistanceElement.textContent = totalDistance.toFixed(2);
                console.log(`Distance updated: +${(distanceInMeters / 1000).toFixed(3)} km, Total: ${totalDistance.toFixed(2)} km`);
            }
        }
        
        lastPosition = {
            latitude: currentPosition.latitude,
            longitude: currentPosition.longitude,
            timestamp: position.timestamp
        };
        
        lastRecordedPosition = {
            latitude: currentPosition.latitude,
            longitude: currentPosition.longitude
        };
    }

    function handlePositionError(error) {
        isConnected = false;
        connectionStatus.textContent = `GPS Error: ${error.message}`;
        connectionStatus.classList.remove('connected');
        connectionStatus.classList.add('error');
        console.error('GPS Error:', error.message);
        
        switch(error.code) {
            case 1:
                console.error('Location access denied. Please enable location permissions.');
                break;
            case 2:
                console.error('Position unavailable. Check if GPS is enabled.');
                break;
            case 3:
                console.error('Position request timed out. Check GPS signal.');
                break;
        }
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                 Math.cos(φ1) * Math.cos(φ2) *
                 Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        return distance;
    }

    function startTracking() {
        if (!navigator.geolocation) {
            connectionStatus.textContent = 'Geolocation is not supported by your browser';
            connectionStatus.classList.add('error');
            console.error('Geolocation is not supported by this browser');
            return;
        }
        
        console.log('Starting GPS tracking...');
        watchId = navigator.geolocation.watchPosition(
            handlePositionSuccess,
            handlePositionError,
            geoOptions
        );
        
        isTracking = true;
        toggleButton.textContent = 'Stop Tracking';
        toggleButton.classList.add('active');
        connectionStatus.textContent = 'Connecting to GPS...';
    }

    function stopTracking() {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
            isConnected = false;
            isTracking = false;
            connectionStatus.textContent = 'GPS tracking stopped';
            connectionStatus.classList.remove('connected');
            connectionStatus.classList.remove('error');
            toggleButton.textContent = 'Start Tracking';
            toggleButton.classList.remove('active');
            console.log('GPS tracking stopped');
        }
    }

    function resetStats() {
        topSpeed = 0;
        totalDistance = 0;
        topSpeedElement.textContent = '0.0';
        totalDistanceElement.textContent = '0.00';
        speedValue.textContent = '0.0';
        accuracyValue.textContent = '--';
        lastPosition = null;
        lastRecordedPosition = null;
        speedReadings = [];
    }

    toggleButton.addEventListener('click', () => {
        if (isTracking) {
            stopTracking();
        } else {
            startTracking();
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && isTracking) {
            stopTracking();
            connectionStatus.textContent = 'Tracking paused (background)';
        } else if (document.visibilityState === 'visible' && !isTracking) {
            connectionStatus.textContent = 'Ready';
        }
    });

    window.addEventListener('beforeunload', stopTracking);
}); 