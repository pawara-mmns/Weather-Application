let timeInterval;
let map;
let marker;

function initMap() {
   
    const defaultLocation = { lat: 40.7128, lng: -74.0060 };
    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultLocation,
        zoom: 10
    });
    marker = new google.maps.Marker({
        position: defaultLocation,
        map: map
    });
}

function updateMap(lat, lon) {
    const newPosition = { lat: lat, lng: lon };
    map.setCenter(newPosition);
    marker.setPosition(newPosition);
}

function fetchWeather(lat, lon, city = null) {
    const apiKey = '20e59ea554364b069d181907242309';
    let apiUrl = '';

    if (city) {
        apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=7&aqi=yes&alerts=no`;
    } else {
        apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=7&aqi=yes&alerts=no`;
    }

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('City not found. Please try again.');
                return;
            }

            // Set current weather
            const weatherIcon = document.getElementById('weatherIcon');
            const temperature = document.getElementById('temperature');
            const condition = document.getElementById('condition');
            const rainChance = document.getElementById('rain-chance');
            const location = document.getElementById('location');
            const timeZone = data.location.tz_id;

            const iconUrl = `https:${data.current.condition.icon}`;
            weatherIcon.src = iconUrl;

            weatherIcon.onerror = function() {
                this.style.display = 'none';
            };

            temperature.textContent = `${data.current.temp_c}°C`;
            condition.textContent = data.current.condition.text;
            rainChance.textContent = `Rain - ${data.forecast.forecastday[0].day.daily_chance_of_rain}%`;
            location.textContent = `${data.location.name}, ${data.location.country}`;

           
            if (timeInterval) {
                clearInterval(timeInterval);
            }

         
            updateLiveTime(timeZone);

            document.getElementById('uv-index').textContent = data.current.uv;
            document.getElementById('wind-status').textContent = `${data.current.wind_kph} km/h`;
            document.getElementById('sunrise').textContent = data.forecast.forecastday[0].astro.sunrise;
            document.getElementById('sunset').textContent = data.forecast.forecastday[0].astro.sunset;
            document.getElementById('humidity').textContent = `${data.current.humidity}%`;
            document.getElementById('visibility').textContent = `${data.current.vis_km} km`;
            document.getElementById('air-quality').textContent = data.current.air_quality.pm2_5 > 100 ? 'Unhealthy' : 'Normal';

          
            const forecast = data.forecast.forecastday;
            let forecastHTML = '';
            forecast.forEach(day => {
                forecastHTML += `
                    <div class="forecast-item">
                        <p>${new Date(day.date).toLocaleDateString([], { weekday: 'short' })}</p>
                        <img src="https:${day.day.condition.icon}" alt="Weather Icon">
                        <p>${day.day.maxtemp_c}°C / ${day.day.mintemp_c}°C</p>
                    </div>
                `;
            });
            document.getElementById('forecast').innerHTML = forecastHTML;

      
            updateMap(data.location.lat, data.location.lon);
        })
        .catch(error => {
            console.error('Error fetching the weather data:', error);
            alert('An error occurred. Please try again.');
        });
}

function updateLiveTime(timeZone) {
    const timeElement = document.getElementById('live-time');
    
    function updateTime() {
        const now = new Date();
        const options = {
            timeZone: timeZone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        };
        timeElement.textContent = now.toLocaleTimeString('en-US', options);
    }

    updateTime();
    timeInterval = setInterval(updateTime, 1000);
}

function getLocationAndWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeather(lat, lon);
        }, error => {
            console.error('Geolocation error:', error);
            alert('Unable to retrieve your location. Please enter your city manually.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

document.getElementById('getWeather').addEventListener('click', function() {
    const city = document.getElementById('cityInput').value;
    fetchWeather(null, null, city);
});

window.onload = function() {
    getLocationAndWeather();
};
const themeSwitcher = document.getElementById('theme-switcher');
const body = document.body;


const currentTheme = localStorage.getItem('theme') || 'light';
body.classList.toggle('dark-mode', currentTheme === 'dark');

themeSwitcher.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const theme = body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
});