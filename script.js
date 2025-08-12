const searchInput = document.querySelector(".search-input");
const locationButton = document.querySelector(".location-button");
const searchButton = document.querySelector(".search-button");

const timeUnitButton = document.getElementById("time-unit-button");
const temperatureMeasurementButton = document.getElementById("temperature-measurement-button");
const forecastViewButton = document.getElementById("forecast-view-button");

const currentWeatherDiv = document.querySelector(".current-weather");
const hourlyWeatherDiv = document.querySelector(".hourly-weather .weather-list");

var temperatureUnit = "F"
var timeUnit = "12"
let forecastView = "daily";
var last_API_URL = ""

const API_KEY = "21553d4853484479ab0200320250908";

const weatherCodes = {
    clear: [1000],
    clouds: [1003, 1006, 1009],
    mist: [1030, 1135, 1147],
    rain: [1063, 1150, 1153, 1168, 1171, 1180, 1183, 1198, 1201, 1240, 1243, 1246, 1273, 1276],
    moderate_heavy_rain: [1186, 1189, 1192, 1195, 1243, 1246],
    snow: [1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264, 1279, 1282],
    thunder: [1087, 1279, 1282],
    thunder_rain: [1273, 1276],
}

displayHourlyForecast = (hourlyData) => {
    const currentHour = new Date().setMinutes(0, 0, 0);
    const next24Hours = currentHour + 20 * 60 * 60 * 1000;

    const next24HourData = hourlyData.filter(({time}) => {
        const forecastTime = new Date(time).getTime();
        return forecastTime >= currentHour && forecastTime <= next24Hours;
    });

    hourlyWeatherDiv.innerHTML = next24HourData.map(item => {
        var temperature = Math.floor(item.temp_c);
        if (temperatureUnit == "C") {
            temperature = Math.floor(item.temp_c);
        } else if (temperatureUnit == "F") {
            temperature = Math.floor(item.temp_f);
        }

        const dateObj = new Date(item.time);
        let hours = dateObj.getHours();
        const minutes = dateObj.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        if (timeUnit == "12") {
            hours = hours % 12;
            hours = hours ? hours : 12;
        }
        
        const formattedHour = hours < 10 ? '0' + hours : hours;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        
        var time = `${formattedHour}:${formattedMinutes} ${ampm}`;

        if (timeUnit == "12") {
            time = `${formattedHour}:${formattedMinutes} ${ampm}`;
        } else {
            time = `${formattedHour}:${formattedMinutes}`;
        }

        const weatherIcon = Object.keys(weatherCodes).find(icon => weatherCodes[icon].includes(item.condition.code));

        return `<li class="weather-item"><p class="description">${time}</p><img src="img/${weatherIcon}.png" alt="" class="weather-icon"><h2 class="temprature">${temperature}<span>°${temperatureUnit}</span></h2></li>`;
    }).join("");
}

const displayDailyForecast = (forecastData) => {
    hourlyWeatherDiv.innerHTML = forecastData.map(day => {
        let temperature;
        if (temperatureUnit == "C") {
            temperature = Math.floor(day.day.avgtemp_c);
        } else {
            temperature = Math.floor(day.day.avgtemp_f);
        }

        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

        const weatherIcon = Object.keys(weatherCodes).find(icon =>
            weatherCodes[icon].includes(day.day.condition.code)
        );

        return `<li class="weather-item">
            <p class="description">${dayName}</p>
            <img src="img/${weatherIcon}.png" alt="" class="weather-icon">
            <h2 class="temprature">${temperature}<span>°${temperatureUnit}</span></h2>
        </li>`;
    }).join("");
}


const getWeatherDetails = async (API_URL) => {
    window.innerWidth <= 768 && searchInput.blur();
    document.body.classList.remove("show-no-results");
    last_API_URL = API_URL;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        var temperature = Math.floor(data.current.temp_c);
        if (temperatureUnit == "C") {
            temperature = Math.floor(data.current.temp_c);
        } else if (temperatureUnit == "F") {
            temperature = Math.floor(data.current.temp_f);
        }
        const description = data.current.condition.text;
        const weatherIcon = Object.keys(weatherCodes).find(icon => weatherCodes[icon].includes(data.current.condition.code));

        currentWeatherDiv.querySelector(".weather-icon").src = 'img/' + weatherIcon + '.png';
        currentWeatherDiv.querySelector(".temperature").innerHTML = temperature + '<span>°' + temperatureUnit + '</span>';
        currentWeatherDiv.querySelector(".description").innerText = description;
        if (forecastView === "hourly") {
            const combinedHourlyData = [...data.forecast.forecastday[0].hour, ...data.forecast.forecastday[1].hour];
            displayHourlyForecast(combinedHourlyData);
        } else {
            displayDailyForecast(data.forecast.forecastday);
        }


        searchInput.value = data.location.name;
    } catch (error) {
        document.body.classList.add("show-no-results");
    }
}

const setupWeatherRequest = (cityName) => {
    const API_URL = 'https://api.weatherapi.com/v1/forecast.json?key='+ API_KEY + '&q=' + cityName + "&days=7";
    getWeatherDetails(API_URL)
}

searchInput.addEventListener("keyup", (e) => {
    const cityName = searchInput.value.trim();

    if(e.key == "Enter" && cityName) {
        setupWeatherRequest(cityName);
    }
});

locationButton.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(position => {
        const {latitude, longitude} = position.coords;
        const API_URL = 'https://api.weatherapi.com/v1/forecast.json?key='+ API_KEY + '&q=' + latitude + ',' + longitude + "&days=7";
        getWeatherDetails(API_URL)
    }, error => {
        alert("Location access denied. In order to use this feature, location services must be enabled.")
    });
});

searchButton.addEventListener("click", () => {
    const cityName = searchInput.value.trim();
    setupWeatherRequest(cityName);
});

function changeTimeUnit() {
    if (timeUnit == "24") {
        timeUnit = "12";
        timeUnitButton.innerHTML = '<span class="material-symbols-rounded">toggle_off</span>';
        const spanElement = timeUnitButton.querySelector('span');
        spanElement.style.color = "rgb(126, 126, 126)";
    } else {
        timeUnit = "24";
        timeUnitButton.innerHTML = '<span class="material-symbols-rounded">toggle_on</span>';
        const spanElement = timeUnitButton.querySelector('span');
        spanElement.style.color = "rgb(255, 255, 0)";
    }

    if (last_API_URL != "") {
        getWeatherDetails(last_API_URL);
    }
}

function changeTemperatureUnit() {
    if (temperatureUnit == "C") {
        temperatureUnit = "F";
        temperatureMeasurementButton.innerHTML = '<span class="material-symbols-rounded">toggle_off</span>';
        const spanElement = temperatureMeasurementButton.querySelector('span');
        spanElement.style.color = "rgb(126, 126, 126)";
    } else {
        temperatureUnit = "C";
        temperatureMeasurementButton.innerHTML = '<span class="material-symbols-rounded">toggle_on</span>';
        const spanElement = temperatureMeasurementButton.querySelector('span');
        spanElement.style.color = "rgb(255, 255, 0)";
    }

    if (last_API_URL != "") {
        getWeatherDetails(last_API_URL);
    }
}

function changeForecastView() {
    if (forecastView === "hourly") {
        forecastView = "daily";
        forecastViewButton.innerHTML = '<span class="material-symbols-rounded">toggle_off</span>';
        forecastViewButton.querySelector('span').style.color = "rgb(126, 126, 126)";
    } else {
        forecastView = "hourly";
        forecastViewButton.innerHTML = '<span class="material-symbols-rounded">toggle_on</span>';
        forecastViewButton.querySelector('span').style.color = "rgb(255, 255, 0)";
    }

    if (last_API_URL !== "") {
        getWeatherDetails(last_API_URL);
    }
}
