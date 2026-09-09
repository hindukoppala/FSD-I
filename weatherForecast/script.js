
/* =========================================
   WEATHER APP
   OpenWeatherMap API
========================================= */


/* =========================================
   API CONFIGURATION
========================================= */

// Replace this with your OpenWeatherMap API key
const API_KEY = "d48e914b25398a7cf19a366b03c3b1e8";

const CURRENT_WEATHER_URL =
    "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_URL =
    "https://api.openweathermap.org/data/2.5/forecast";


/* =========================================
   DOM ELEMENTS
========================================= */

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const errorMessage = document.getElementById("errorMessage");

const cityName = document.getElementById("cityName");
const currentDate = document.getElementById("currentDate");

const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");

const weatherIcon = document.getElementById("weatherIcon");
const weatherDescription = document.getElementById("weatherDescription");

const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

const hourlyForecast = document.getElementById("hourlyForecast");
const dailyForecast = document.getElementById("dailyForecast");

const weatherTip = document.getElementById("weatherTip");


/* =========================================
   DEFAULT CITY
========================================= */

const DEFAULT_CITY = "Pune";


/* =========================================
   PAGE LOAD
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    // Load Pune weather when page opens
    getWeather(DEFAULT_CITY);

    // Display current date
    updateDate();

});


/* =========================================
   SEARCH BUTTON
========================================= */

searchBtn.addEventListener("click", () => {

    const city = cityInput.value.trim();

    if (city === "") {
        showError("Please enter a city name.");
        return;
    }

    getWeather(city);

});


/* =========================================
   ENTER KEY SEARCH
========================================= */

cityInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        const city = cityInput.value.trim();

        if (city === "") {
            showError("Please enter a city name.");
            return;
        }

        getWeather(city);
    }

});


/* =========================================
   GET WEATHER BY CITY
========================================= */

async function getWeather(city) {

    if (API_KEY === "YOUR_OPENWEATHERMAP_API_KEY") {

        showError(
            "Please add your OpenWeatherMap API key in script.js."
        );

        return;
    }


    hideError();

    setLoading(true);


    try {

        /* -----------------------------
           CURRENT WEATHER
        ----------------------------- */

        const currentResponse = await fetch(
            `${CURRENT_WEATHER_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
        );


        if (!currentResponse.ok) {

            if (currentResponse.status === 404) {
                throw new Error("City not found.");
            }

            if (currentResponse.status === 401) {
                throw new Error("Invalid API key.");
            }

            throw new Error("Unable to fetch weather data.");
        }


        const currentData = await currentResponse.json();


        /* -----------------------------
           FORECAST
        ----------------------------- */

        const forecastResponse = await fetch(
            `${FORECAST_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
        );


        if (!forecastResponse.ok) {
            throw new Error("Unable to fetch forecast data.");
        }


        const forecastData = await forecastResponse.json();


        /* -----------------------------
           UPDATE UI
        ----------------------------- */

        updateCurrentWeather(currentData);

        updateHourlyForecast(forecastData);

        updateDailyForecast(forecastData);

        updateWeatherTip(currentData);

    }

    catch (error) {

        console.error(error);

        showError(error.message);

    }

    finally {

        setLoading(false);

    }

}


/* =========================================
   UPDATE CURRENT WEATHER
========================================= */

function updateCurrentWeather(data) {

    /* -----------------------------
       City
    ----------------------------- */

    cityName.textContent =
        `${data.name}, ${data.sys.country}`;


    /* -----------------------------
       Temperature
    ----------------------------- */

    temperature.textContent =
        Math.round(data.main.temp);

    feelsLike.textContent =
        `${Math.round(data.main.feels_like)}°C`;


    /* -----------------------------
       Weather Description
    ----------------------------- */

    const description =
        data.weather[0].description;

    weatherDescription.textContent =
        capitalizeWords(description);


    /* -----------------------------
       Weather Icon
    ----------------------------- */

    setWeatherIcon(
        weatherIcon,
        data.weather[0].id,
        data.weather[0].icon
    );


    /* -----------------------------
       Humidity
    ----------------------------- */

    humidity.textContent =
        `${data.main.humidity}%`;


    /* -----------------------------
       Wind
    ----------------------------- */

    // OpenWeatherMap wind speed is m/s
    // Convert m/s to km/h

    const windKmH =
        data.wind.speed * 3.6;

    windSpeed.textContent =
        `${Math.round(windKmH)} km/h`;


    /* -----------------------------
       Pressure
    ----------------------------- */

    pressure.textContent =
        `${data.main.pressure} hPa`;


    /* -----------------------------
       Visibility
    ----------------------------- */

    const visibilityKm =
        data.visibility / 1000;

    visibility.textContent =
        `${visibilityKm.toFixed(1)} km`;


    /* -----------------------------
       Sunrise / Sunset
    ----------------------------- */

    sunrise.textContent =
        formatTime(data.sys.sunrise);

    sunset.textContent =
        formatTime(data.sys.sunset);


    /* -----------------------------
       Background
    ----------------------------- */

    updateWeatherBackground(
        data.weather[0].id,
        data.weather[0].icon
    );

}


/* =========================================
   UPDATE HOURLY FORECAST
========================================= */

function updateHourlyForecast(data) {

    hourlyForecast.innerHTML = "";


    // OpenWeatherMap free forecast API
    // provides weather every 3 hours.

    const hours =
        data.list.slice(0, 8);


    hours.forEach((item, index) => {

        const card =
            document.createElement("div");

        card.className = "hour-card";


        if (index === 0) {
            card.classList.add("active");
        }


        const time =
            index === 0
                ? "Now"
                : formatForecastTime(item.dt);


        const temp =
            Math.round(item.main.temp);


        const iconClass =
            getWeatherIconClass(
                item.weather[0].id,
                item.weather[0].icon
            );


        card.innerHTML = `
            <p>${time}</p>

            <i class="${iconClass} weather-small-icon"></i>

            <strong>${temp}°</strong>

            <span>
                <i class="fa-solid fa-droplet"></i>
                ${item.main.humidity}%
            </span>
        `;


        hourlyForecast.appendChild(card);

    });

}


/* =========================================
   UPDATE 5-DAY FORECAST
========================================= */

function updateDailyForecast(data) {

    dailyForecast.innerHTML = "";


    /*
        The API gives data every 3 hours.

        We select approximately one forecast
        for each day around midday.
    */


    const dailyData = {};



    data.list.forEach(item => {

        const date =
            new Date(item.dt * 1000);

        const day =
            date.toISOString().split("T")[0];


        if (!dailyData[day]) {

            dailyData[day] = [];

        }

        dailyData[day].push(item);

    });


    const days =
        Object.keys(dailyData).slice(0, 5);


    days.forEach((day, index) => {

        const forecasts =
            dailyData[day];


        const middayForecast =
            forecasts.reduce((closest, item) => {

                const itemHour =
                    new Date(item.dt * 1000).getHours();

                const closestHour =
                    new Date(closest.dt * 1000).getHours();

                return Math.abs(itemHour - 12) <
                    Math.abs(closestHour - 12)
                    ? item
                    : closest;

            }, forecasts[0]);


        const temps =
            forecasts.map(item => item.main.temp);


        const maxTemp =
            Math.round(Math.max(...temps));


        const minTemp =
            Math.round(Math.min(...temps));


        const date =
            new Date(middayForecast.dt * 1000);


        let dayName;


        if (index === 0) {
            dayName = "Today";
        }
        else {
            dayName =
                date.toLocaleDateString("en-US", {
                    weekday: "short"
                });
        }


        const dateText =
            date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric"
            });


        const description =
            capitalizeWords(
                middayForecast.weather[0].description
            );


        const iconClass =
            getWeatherIconClass(
                middayForecast.weather[0].id,
                middayForecast.weather[0].icon
            );


        const card =
            document.createElement("div");

        card.className = "day-card";


        card.innerHTML = `
            <div class="day-info">
                <strong>${dayName}</strong>
                <span>${dateText}</span>
            </div>

            <i class="${iconClass} forecast-icon"></i>

            <span class="forecast-description">
                ${description}
            </span>

            <div class="forecast-temperature">
                <strong>${maxTemp}°</strong>
                <span>${minTemp}°</span>
            </div>
        `;


        dailyForecast.appendChild(card);

    });

}


/* =========================================
   WEATHER ICON
========================================= */

function getWeatherIconClass(weatherId, iconCode) {

    /*
        OpenWeatherMap weather IDs

        2xx = Thunderstorm
        3xx = Drizzle
        5xx = Rain
        6xx = Snow
        7xx = Atmosphere
        800 = Clear
        80x = Clouds
    */


    if (weatherId >= 200 && weatherId < 300) {

        return "fa-solid fa-cloud-bolt";

    }


    if (weatherId >= 300 && weatherId < 400) {

        return "fa-solid fa-cloud-rain";

    }


    if (weatherId >= 500 && weatherId < 600) {

        if (weatherId === 511) {
            return "fa-solid fa-snowflake";
        }

        return "fa-solid fa-cloud-showers-heavy";

    }


    if (weatherId >= 600 && weatherId < 700) {

        return "fa-solid fa-snowflake";

    }


    if (weatherId >= 700 && weatherId < 800) {

        return "fa-solid fa-smog";

    }


    if (weatherId === 800) {

        if (iconCode && iconCode.endsWith("n")) {
            return "fa-solid fa-moon";
        }

        return "fa-solid fa-sun";

    }


    if (weatherId > 800 && weatherId < 900) {

        if (iconCode && iconCode.endsWith("n")) {
            return "fa-solid fa-cloud-moon";
        }

        if (weatherId === 801) {
            return "fa-solid fa-cloud-sun";
        }

        return "fa-solid fa-cloud";

    }


    return "fa-solid fa-cloud";

}


/* =========================================
   SET CURRENT WEATHER ICON
========================================= */

function setWeatherIcon(element, weatherId, iconCode) {

    const iconClass =
        getWeatherIconClass(
            weatherId,
            iconCode
        );


    element.className =
        `${iconClass}`;

}


/* =========================================
   FORMAT TIME
========================================= */

function formatTime(timestamp) {

    const date =
        new Date(timestamp * 1000);


    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
    });

}


/* =========================================
   FORMAT FORECAST TIME
========================================= */

function formatForecastTime(timestamp) {

    const date =
        new Date(timestamp * 1000);


    return date.toLocaleTimeString("en-US", {
        hour: "numeric"
    });

}


/* =========================================
   UPDATE DATE
========================================= */

function updateDate() {

    const now =
        new Date();


    currentDate.textContent =
        now.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        });

}


/* =========================================
   CAPITALIZE WORDS
========================================= */

function capitalizeWords(text) {

    return text
        .split(" ")
        .map(word =>
            word.charAt(0).toUpperCase() +
            word.slice(1)
        )
        .join(" ");

}


/* =========================================
   ERROR MESSAGE
========================================= */

function showError(message) {

    errorMessage.querySelector("span").textContent =
        message;

    errorMessage.classList.remove("hidden");

}


function hideError() {

    errorMessage.classList.add("hidden");

}


/* =========================================
   LOADING STATE
========================================= */

function setLoading(isLoading) {

    if (isLoading) {

        searchBtn.disabled = true;

        searchBtn.textContent = "Loading...";

        searchBtn.classList.add("loading");

    }
    else {

        searchBtn.disabled = false;

        searchBtn.textContent = "Search";

        searchBtn.classList.remove("loading");

    }

}


/* =========================================
   WEATHER TIP
========================================= */

function updateWeatherTip(data) {

    const weatherId =
        data.weather[0].id;


    let tip = "";


    if (weatherId >= 200 && weatherId < 300) {

        tip =
            "Thunderstorms are nearby. Consider staying indoors and avoid exposed areas.";

    }

    else if (weatherId >= 500 && weatherId < 600) {

        tip =
            "Rain is expected. Carry an umbrella and consider a light waterproof jacket.";

    }

    else if (weatherId >= 600 && weatherId < 700) {

        tip =
            "Snowy conditions are expected. Dress warmly and be careful on slippery surfaces.";

    }

    else if (weatherId >= 700 && weatherId < 800) {

        tip =
            "Visibility may be reduced due to atmospheric conditions. Take extra care while travelling.";

    }

    else if (weatherId === 800) {

        tip =
            "Clear skies today. Don't forget your sunglasses and stay hydrated.";

    }

    else if (weatherId > 800) {

        tip =
            "Cloudy conditions are expected. The temperature may feel cooler than usual.";

    }

    else {

        tip =
            "Check the forecast before heading out and stay prepared for changing conditions.";

    }


    weatherTip.textContent = tip;

}


/* =========================================
   WEATHER BACKGROUND
========================================= */

function updateWeatherBackground(weatherId, iconCode) {

    let background;


    if (weatherId >= 200 && weatherId < 300) {

        background =
            "linear-gradient(135deg, #374151, #4b5563)";

    }

    else if (weatherId >= 300 && weatherId < 600) {

        background =
            "linear-gradient(135deg, #2563eb, #475569)";

    }

    else if (weatherId >= 600 && weatherId < 700) {

        background =
            "linear-gradient(135deg, #64748b, #94a3b8)";

    }

    else if (weatherId >= 700 && weatherId < 800) {

        background =
            "linear-gradient(135deg, #64748b, #94a3b8)";

    }

    else if (weatherId === 800) {

        if (iconCode && iconCode.endsWith("n")) {

            background =
                "linear-gradient(135deg, #172554, #1e3a8a)";

        }
        else {

            background =
                "linear-gradient(135deg, #2563eb, #60a5fa)";

        }

    }

    else {

        background =
            "linear-gradient(135deg, #3b82f6, #64748b)";

    }


    document
        .querySelector(".current-weather")
        .style.background = background;

}


/* =========================================
   CURRENT LOCATION
========================================= */

locationBtn.addEventListener("click", () => {

    if (!navigator.geolocation) {

        showError(
            "Geolocation is not supported by your browser."
        );

        return;

    }


    locationBtn.disabled = true;


    navigator.geolocation.getCurrentPosition(

        async (position) => {

            const lat =
                position.coords.latitude;

            const lon =
                position.coords.longitude;


            try {

                await getWeatherByCoordinates(
                    lat,
                    lon
                );

            }
            finally {

                locationBtn.disabled = false;

            }

        },

        () => {

            locationBtn.disabled = false;

            showError(
                "Unable to access your location. Please allow location access."
            );

        }

    );

});


/* =========================================
   GET WEATHER BY COORDINATES
========================================= */

async function getWeatherByCoordinates(lat, lon) {

    if (API_KEY === "YOUR_OPENWEATHERMAP_API_KEY") {

        showError(
            "Please add your OpenWeatherMap API key in script.js."
        );

        return;
    }


    hideError();

    setLoading(true);


    try {

        const currentResponse =
            await fetch(
                `${CURRENT_WEATHER_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
            );


        if (!currentResponse.ok) {

            throw new Error(
                "Unable to find weather for your location."
            );

        }


        const currentData =
            await currentResponse.json();


        const forecastResponse =
            await fetch(
                `${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
            );


        if (!forecastResponse.ok) {

            throw new Error(
                "Unable to fetch forecast."
            );

        }


        const forecastData =
            await forecastResponse.json();


        updateCurrentWeather(currentData);

        updateHourlyForecast(forecastData);

        updateDailyForecast(forecastData);

        updateWeatherTip(currentData);


        // Update search box
        cityInput.value =
            currentData.name;

    }

    catch (error) {

        console.error(error);

        showError(error.message);

    }

    finally {

        setLoading(false);

    }

}

