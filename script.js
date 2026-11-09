const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const message = document.getElementById("message");
const result = document.getElementById("weatherResult");
const searchButton = form.querySelector("button");

function getWeatherDescription(code) {
    const weatherTypes = {
        0: ["Clear sky", "☀️"],
        1: ["Mainly clear", "🌤️"],
        2: ["Partly cloudy", "⛅"],
        3: ["Overcast", "☁️"],
        45: ["Foggy", "🌫️"],
        48: ["Foggy", "🌫️"],
        51: ["Light drizzle", "🌦️"],
        53: ["Drizzle", "🌦️"],
        55: ["Heavy drizzle", "🌧️"],
        61: ["Light rain", "🌦️"],
        63: ["Rain", "🌧️"],
        65: ["Heavy rain", "🌧️"],
        71: ["Light snow", "🌨️"],
        73: ["Snow", "❄️"],
        75: ["Heavy snow", "❄️"],
        80: ["Rain showers", "🌦️"],
        81: ["Rain showers", "🌧️"],
        82: ["Heavy showers", "⛈️"],
        95: ["Thunderstorm", "⛈️"],
        96: ["Thunderstorm with hail", "⛈️"],
        99: ["Severe thunderstorm", "⛈️"]
    };

    return weatherTypes[code] ||
        ["Weather conditions unavailable", "🌡️"];
}

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        message.textContent = "Please enter a city name.";
        return;
    }

    searchButton.disabled = true;
    message.textContent = "Searching for weather...";
    result.hidden = true;

    try {
        // Find the city's coordinates
        const geoUrl =
            "https://geocoding-api.open-meteo.com/v1/search?name=" +
            encodeURIComponent(city) +
            "&count=1&language=en&format=json";

        const geoResponse = await fetch(geoUrl);

        if (!geoResponse.ok) {
            throw new Error("Could not search for the city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Check the spelling.");
        }

        const place = geoData.results[0];

        // Get current weather
        const weatherUrl =
            "https://api.open-meteo.com/v1/forecast" +
            `?latitude=${place.latitude}` +
            `&longitude=${place.longitude}` +
            "&current=temperature_2m,relative_humidity_2m," +
            "apparent_temperature,weather_code,wind_speed_10m" +
            "&timezone=auto";

        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Could not load weather data.");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;

        const [description, icon] =
            getWeatherDescription(current.weather_code);

        document.getElementById("cityName").textContent =
            `${place.name}, ${place.country}`;

        document.getElementById("weatherIcon").textContent = icon;

        document.getElementById("temperature").textContent =
            `${Math.round(current.temperature_2m)}°C`;

        document.getElementById("description").textContent =
            description;

        document.getElementById("humidity").textContent =
            `${current.relative_humidity_2m}%`;

        document.getElementById("wind").textContent =
            `${current.wind_speed_10m} km/h`;

        document.getElementById("feelsLike").textContent =
            `${Math.round(current.apparent_temperature)}°C`;

        result.hidden = false;
        message.textContent = "Weather updated successfully!";

    } catch (error) {
        message.textContent =
            error.message || "Something went wrong. Please try again.";

    } finally {
        searchButton.disabled = false;
    }
});