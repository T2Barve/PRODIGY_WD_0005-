document.getElementById('btn').addEventListener('click', function() {
    const searchBox = document.getElementById('search-box').value;
    if (!searchBox) {
        alert('Please enter a location!');
        return;
    }

    const loadingSpinner = document.getElementById('loading-spinner');
    loadingSpinner.style.display = 'block';

    // Mock API call to simulate weather fetching
    setTimeout(() => {
        loadingSpinner.style.display = 'none';

        // Example data - Replace with actual API response
        const weatherData = {
            temperature: Math.floor(Math.random() * 35) + 10,
            wind: Math.floor(Math.random() * 15) + 5,
            humidity: Math.floor(Math.random() * 50) + 30,
            rain: Math.random() > 0.5 ? (Math.random() * 20).toFixed(1) : 0,
            snow: Math.random() > 0.7 ? (Math.random() * 5).toFixed(1) : 0,
            cloud: Math.floor(Math.random() * 100)
        };

        // Updating DOM with fetched data
        document.getElementById('temperature').textContent = `${weatherData.temperature}°C`;
        document.getElementById('wind').textContent = `${weatherData.wind} km/h`;
        document.getElementById('humidity').textContent = `${weatherData.humidity} %`;
        document.getElementById('rain').textContent = `${weatherData.rain} mm`;
        document.getElementById('snow').textContent = `${weatherData.snow} inch`;
        document.getElementById('cloud').textContent = `${weatherData.cloud} %`;

    }, 1500);
});
