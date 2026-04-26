// ------ CONFIGURATION & DATA ------
const apiKey = "";
let Cities = loadCities() || [];
let cityInfo = {};

// ------ STATE & FLAGS ------
let searchInProcess = false;
let addingBlockFromButton = false;
let timeout = null;

// ------ LOGIC HELPERS ------
const activeHandlers = [];
let deletions = [false, false, false, false]
let currentBtn;
let deletedIndex;
let nameOfTheCityFromButton;
let cityRenders = {
    cityRendered1: false,
    cityRendered2: false,
    cityRendered3: false,
    cityRendered4: false
}

// ------ DOM ELEMENTS ------
const searchInput = document.querySelector(".search-bar > input")
const addCityButtonBlock = document.querySelector(".add-city-button-block")
const addCityButton = document.querySelector(".add-city-button")
const addCityH1 = document.querySelector(".add-city-button-h1")
const weatherBlocks = {
    1: document.getElementById("weather-1"),
    2: document.getElementById("weather-2"),
    3: document.getElementById("weather-3"),
    4: document.getElementById("weather-4")
}

function weatherSVGs(id) {
    const weatherSVGs = {
        "clear-day": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="${id}" x1="150" x2="234" y1="119.2" y2="264.8" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fbbf24"/><stop offset=".5" stop-color="#fbbf24"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs><g transform="translate(64 64)"><circle cx="192" cy="192" r="84" fill="url(#${id})" stroke="#f8af18" stroke-miterlimit="10" stroke-width="6"/><path fill="none" stroke="#fbbf24" stroke-linecap="round" stroke-miterlimit="10" stroke-width="24" d="M192 61.7V12m0 360v-49.7m92.2-222.5 35-35M64.8 319.2l35.1-35.1m0-184.4-35-35m254.5 254.5-35.1-35.1M61.7 192H12m360 0h-49.7"/></g></svg>`,
        "clear-night": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="${id}" x1="54.3" x2="187.2" y1="29" y2="259.1" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#86c3db"/><stop offset=".5" stop-color="#86c3db"/><stop offset="1" stop-color="#5eafcf"/></linearGradient></defs><path fill="url(#${id})" stroke="#72b9d5" stroke-linecap="round" stroke-linejoin="round" stroke-width="6" d="M373.3 289.6A133.4 133.4 0 01239 157.2 130.5 130.5 0 01243.5 124 133 133 0 00124 255.6c0 73.1 60 132.4 134.2 132.4 62.5 0 114.8-42.2 129.8-99.2a135.6 135.6 0 01-14.8.8Z"/></svg>`,
        "cloudy": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="${id}" x1="99.5" x2="232.6" y1="30.7" y2="261.4" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f3f7fe"/><stop offset=".5" stop-color="#f3f7fe"/><stop offset="1" stop-color="#deeafb"/></linearGradient></defs><path fill="url(#${id})" stroke="#e6effc" stroke-miterlimit="10" stroke-width="6" d="M372 252l-2.5.1A83.9 83.9 0 00216.6 188a56 56 0 00-84.6 48 56.6 56.6 0 00.8 9 60 60 0 0011.2 119l4-.2v.2h224a56 56 0 000-112z"/></svg>`,
        "partly-cloudy-day": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="${id}" x1="99.5" x2="232.6" y1="30.7" y2="261.4" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f3f7fe"/><stop offset=".5" stop-color="#f3f7fe"/><stop offset="1" stop-color="#deeafb"/></linearGradient><linearGradient id="${id}s" x1="78" x2="118" y1="63.4" y2="132.7" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fbbf24"/><stop offset=".5" stop-color="#fbbf24"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs><g transform="translate(81 145)"><circle cx="17" cy="62" r="40" fill="url(#${id}s)" stroke="#f8af18" stroke-width="4"/><path fill="none" stroke="#fbbf24" stroke-linecap="round" stroke-width="12" d="M17-4.6V-30m0 184v-25.4M64.1 15l18-17.9M-48 127l18-17.9M-30 15-48-3M82.1 127.1l-18-18M-75 62H-100m184 0h-25.4"/><path fill="url(#${id})" stroke="#e6effc" stroke-width="6" d="m291 107-2.5.1A83.9 83.9 0 00135.6 43 56 56 0 0051 91a56.6 56.6 0 00.8 9A60 60 0 0063 219l4-.2v.2h224a56 56 0 000-112Z"/></g></svg>`,
        "partly-cloudy-night": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="${id}" x1="99.5" x2="232.6" y1="30.7" y2="261.4" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f3f7fe"/><stop offset=".5" stop-color="#f3f7fe"/><stop offset="1" stop-color="#deeafb"/></linearGradient><linearGradient id="${id}n" x1="34.7" x2="119.2" y1="18.6" y2="165" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#86c3db"/><stop offset=".5" stop-color="#86c3db"/><stop offset="1" stop-color="#5eafcf"/></linearGradient></defs><g transform="translate(81 145)"><path fill="url(#${id}n)" stroke="#72b9d5" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M81.6 85.4a84.8 84.8 0 01-85.4-84.3A83.3 83.3 0 01-1 20 84.7 84.7 0 00-77 103.7 84.8 84.8 0 008.4 188a85.2 85.2 0 0082.6-63.1 88 88 0 01-9.4.5Z"/><path fill="url(#${id})" stroke="#e6effc" stroke-width="6" d="m291 107-2.5.1A83.9 83.9 0 00135.6 43 56 56 0 0051 91a56.6 56.6 0 00.8 9A60 60 0 0063 219l4-.2v.2h224a56 56 0 000-112Z"/></g></svg>`,
        "partly-cloudy-day-rain": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="${id}" x1="99.5" x2="232.6" y1="30.7" y2="261.4" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f3f7fe"/><stop offset=".5" stop-color="#f3f7fe"/><stop offset="1" stop-color="#deeafb"/></linearGradient><linearGradient id="${id}s" x1="78" x2="118" y1="63.4" y2="132.7" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fbbf24"/><stop offset=".5" stop-color="#fbbf24"/><stop offset="1" stop-color="#f59e0b"/></linearGradient><linearGradient id="${id}r" x1="1381.3" x2="1399.5" y1="-1144.7" y2="-1097.4" gradientTransform="rotate(-9 8002.567 8233.063)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0b65ed"/><stop offset=".5" stop-color="#0a5ad4"/><stop offset="1" stop-color="#0950bc"/></linearGradient></defs><g transform="translate(81 145)"><circle cx="17" cy="62" r="40" fill="url(#${id}s)" stroke="#f8af18" stroke-width="4"/><path fill="url(#${id})" stroke="#e6effc" stroke-width="6" d="m291 107-2.5.1A83.9 83.9 0 00135.6 43 56 56 0 0051 91a56.6 56.6 0 00.8 9A60 60 0 0063 219l4-.2v.2h224a56 56 0 000-112Z"/><g transform="translate(110.5 198.5)"><path fill="url(#${id}r)" stroke="#0a5ad4" d="M8.5 56.5a8 8 0 01-8-8v-40a8 8 0 0116 0v40a8 8 0 01-8 8Z"/><path fill="url(#${id}r)" stroke="#0a5ad4" d="M64.5 109.5a8 8 0 01-8-8v-40a8 8 0 0116 0v40a8 8 0 01-8 8Z"/><path fill="url(#${id}r)" stroke="#0a5ad4" d="M120.5 74.5a8 8 0 01-8-8v-40a8 8 0 0116 0v40a8 8 0 01-8 8Z"/></g></g></svg>`,
        "snow": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="${id}" x1="99.5" x2="232.6" y1="30.7" y2="261.4" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f3f7fe"/><stop offset=".5" stop-color="#f3f7fe"/><stop offset="1" stop-color="#deeafb"/></linearGradient><linearGradient id="${id}w" x1="11.4" x2="32.8" y1="5.9" y2="43.1" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#86c3db"/><stop offset=".5" stop-color="#86c3db"/><stop offset="1" stop-color="#5eafcf"/></linearGradient></defs><path fill="url(#${id})" stroke="#e6effc" stroke-miterlimit="10" stroke-width="6" d="M372 252l-2.5.1A83.9 83.9 0 00216.6 188a56 56 0 00-84.6 48 56.6 56.6 0 00.8 9 60 60 0 0011.2 119l4-.2v.2h224a56 56 0 000-112z"/><g transform="translate(177.9 337.5)" fill="url(#${id}w)" stroke="#86c3db"><path d="m41.7 31-5.8-3.3a13.7 13.7 0 000-6.5l5.8-3.2a4 4 0 00-4-7l-5.8 3.3a13.6 13.6 0 00-5.6-3.3V4.5a4 4 0 00-8.1 0v6.6a14.3 14.3 0 00-5.7 3.2L6.6 11a4 4 0 00-4 7l5.8 3.3a13.7 13.7 0 000 6.5L2.5 31a4 4 0 004 7l5.8-3.3a13.6 13.6 0 005.6 3.2v6.6a4 4 0 008.2 0v-6.6a14.2 14.2 0 005.6-3.2l6 3.3a4 4 0 004-7.5zm-22.7-1.3a6 6 0 115.2-10.5 6 6 0 01-5.2 10.5z"/><path d="m97.7 121-5.8-3.3a13.7 13.7 0 000-6.5l5.8-3.2a4 4 0 00-4.1-7l-5.8 3.3a13.6 13.6 0 00-5.6-3.3v-6.5a4 4 0 00-8.1 0v6.6a14.3 14.3 0 00-5.7 3.2l-5.8-3.3a4 4 0 00-4.1 7l5.8 3.3a13.7 13.7 0 000 6.5l-5.8 3.2a4 4 0 004.1 7l5.8-3.3a13.6 13.6 0 005.7 3.2v6.6a4 4 0 008 0V128a14.2 14.2 0 005.7-3.2l5.8 3.3a4 4 0 004.1-7.5zM75 119.7a6 6 0 115.2-10.5 6 6 0 01-5.2 10.5z"/><path d="m153.7 71-5.8-3.3a13.7 13.7 0 000-6.5l5.8-3.2a4 4 0 00-4.1-7l-5.8 3.3a13.6 13.6 0 00-5.6-3.3v-6.5a4 4 0 00-8.1 0v6.6a14.3 14.3 0 00-5.7 3.2l-5.8-3.3a4 4 0 00-4.1 7l5.8 3.3a13.7 13.7 0 000 6.5l-5.8 3.2a4 4 0 004.1 7l5.8-3.3a13.6 13.6 0 005.7 3.2v6.6a4 4 0 008 0v-6.6a14.2 14.2 0 005.7-3.2l5.8 3.3a4 4 0 004.1-7.5zM131 69.7a6 6 0 115.2-10.5 6 6 0 01-5.2 10.5z"/></g></svg>`
    };

    return weatherSVGs;
}

function currentTime(data) {
    const nowUTC = Math.floor(Date.now() / 1000);
    const cityTime = new Date((nowUTC + data.timezone) * 1000);
    const hours = cityTime.getUTCHours().toString().padStart(2,'0');
    const minutes = cityTime.getUTCMinutes().toString().padStart(2,'0');

    return { hours, minutes };
}

function updateTime(id, data) {
    const time = currentTime(data);
    const timeElements = document.querySelectorAll(`.current-time-${id}`);

    timeElements.forEach((el) => {
        el.textContent = `${time.hours}:${time.minutes}`;
    })
}

function clearUpdateTime(id) {
    const timeElements = document.querySelectorAll(`.current-time-${id}`);

    timeElements.forEach((el) => {
        el.textContent = ``;
    })
}

function renderCityWeather(id, data, data2, isButton = false) {

    updateTime(id, data);

    const weatherInfo = {name: document.querySelectorAll(`.h1-${id}`), tempRn: document.querySelectorAll(`.temp-rn-p-${id}`), aboutRn: document.querySelectorAll(`.about-rn-${id}`), aboutFeels: document.querySelectorAll(`.about-feels-${id}`), wind: document.querySelectorAll(`.wind-${id}`), humidity: document.querySelectorAll(`.humidity-${id}`), visibility: document.querySelectorAll(`.visibility-${id}`), pressure: document.querySelectorAll(`.pressure-${id}`), wd: document.querySelectorAll(`.wd-${id}`), uv: document.querySelectorAll(`.uv-${id}`), dp: document.querySelectorAll(`.dp-${id}`)};

    if(!isButton) {
        weatherInfo.name.forEach((el)=> el.textContent = data.name)
    }
    weatherInfo.tempRn.forEach((el)=> el.textContent = Math.round(data.main.temp)+"°")
    weatherInfo.aboutRn.forEach((el)=> el.textContent = data.weather[0].description.replace(/\b\w/g, c => c.toUpperCase()))
    weatherInfo.aboutFeels.forEach((el)=> el.textContent = "feels like "+Math.round(data.main.feels_like)+"°")
    weatherInfo.wind.forEach((el)=> {
        const speed = Math.round(data.wind.speed);
        const direction = getWindDirection(data.wind.deg);
        const windText = `${speed} m/s ${direction}`;
        el.textContent = windText;
    })
    weatherInfo.humidity.forEach((el)=> el.textContent = data.main.humidity+"%")
    weatherInfo.visibility.forEach((el)=> el.textContent = Math.round(data.visibility / 1000)+"km")
    weatherInfo.pressure.forEach((el)=> el.textContent = data.main.pressure +" hPa")
    const h = data2.hourly;
    const dewpoint = Math.round(h.dewpoint_2m[0]);
    const uvIndex  = Math.round(h.uv_index[0]);
    weatherInfo.uv.forEach((el)=> el.textContent = uvIndex+" UV")
    weatherInfo.dp.forEach((el)=> el.textContent = dewpoint+" °C")
    const weatherImages = {
        "clear sky": "clear_sky.jpg",
        "scattered clouds": "scattered_clouds.jpg",
        "broken clouds": "broken_clouds.jpg",
        "overcast clouds": "overcast_clouds.jpg",
        "mist": "overcast_clouds.jpg",
        "fog": "overcast_clouds.jpg",
        "haze": "overcast_clouds.jpg",
        "light rain": "light_rain.jpg",
        "moderate rain": "light_rain.jpg",
        "heavy intensity rain": "light_rain.jpg",
        "very heavy rain": "light_rain.jpg",
        "few clouds": "few_clouds.jpg",
        "light snow": "snow.jpg",
        "snow": "snow.jpg"
    };

    const description = data.weather[0].description.toLowerCase();
    const imageName = weatherImages[description];

    if (imageName) {
        weatherInfo.wd.forEach((el) => {
            el.style.backgroundImage = `url("images/${imageName}")`;
        });
    }

    setInterval(() => {
        updateTime(id, data);
    }, 60000);

    if(isButton) {
        checkInputH1();
    }

    const key = `cityRendered${id}`;
    cityRenders[key] = true;
}

function clearCityWeather(id) {

    clearUpdateTime(id);

    const weatherInfo = {name: document.querySelectorAll(`.h1-${id}`), tempRn: document.querySelectorAll(`.temp-rn-p-${id}`), aboutRn: document.querySelectorAll(`.about-rn-${id}`), aboutFeels: document.querySelectorAll(`.about-feels-${id}`), wind: document.querySelectorAll(`.wind-${id}`), humidity: document.querySelectorAll(`.humidity-${id}`), visibility: document.querySelectorAll(`.visibility-${id}`), pressure: document.querySelectorAll(`.pressure-${id}`), wd: document.querySelectorAll(`.wd-${id}`), uv: document.querySelectorAll(`.uv-${id}`), dp: document.querySelectorAll(`.dp-${id}`)};

    weatherInfo.name?.forEach((el)=> el.textContent = "")
    weatherInfo.tempRn.forEach((el)=> el.textContent = "")
    weatherInfo.aboutRn.forEach((el)=> el.textContent = "")
    weatherInfo.aboutFeels.forEach((el)=> el.textContent = "")
    weatherInfo.wind.forEach((el)=> {
        el.textContent = "";
    })
    weatherInfo.humidity.forEach((el)=> el.textContent = "")
    weatherInfo.visibility.forEach((el)=> el.textContent = "")
    weatherInfo.pressure.forEach((el)=> el.textContent = "")
    weatherInfo.uv.forEach((el)=> el.textContent = "")
    weatherInfo.dp.forEach((el)=> el.textContent = "")

    weatherInfo.wd.forEach((el) => {
        el.style.backgroundImage = ``;
    });

    const key = `cityRendered${id}`;
    cityRenders[key] = false;
    deletions[id] = true;
}

function enableCityEditMode(id) {
    document.querySelectorAll(`.h1-${id}`).forEach((el) => el.innerHTML = `<form id="form-${id}"><input class="button-h1" id="input-${id}" type="text"></form>`);
}

function disableCityEditMode(id, cityNameButton) {
    document.querySelectorAll(`.h1-${id}`).forEach((el) => el.textContent = cityNameButton);
}

function cityHourlyWeather(id, svgIcons, data) {

    const hourlyWeatherArray = []

    for(i = 1; i < 25; i++) {
        const WeatherInfo = { hourTime: document.querySelector(`.hour-${i}-${id} > .hour-time`), svgContainer: document.querySelector(`.hour-${i}-${id} > .svg-container`), chanceOfPrecipitation: document.querySelector(`.hour-${i}-${id} > .chance-of-precipitation`), hourlyWeatherDeg: document.querySelector(`.hour-${i}-${id} > .hourly-weather-deg`) };
        hourlyWeatherArray.push(WeatherInfo);
    }

    for(i = 0; i < 12; i++) {
        hourlyWeatherArray[i].hourTime.textContent = `${i+1} a.m`;
    }

    for(i = 0; i < 12; i++) {
        hourlyWeatherArray[i+12].hourTime.textContent = `${i+1} p.m`;
    }

    for(i = 0; i < 24; i++) {
        hourlyWeatherArray[i].svgContainer.innerHTML = `${svgIcons[i]}`;
        hourlyWeatherArray[i].chanceOfPrecipitation.textContent = `${data.hourly.precipitation_probability[i]}%`;
        hourlyWeatherArray[i].hourlyWeatherDeg.textContent = `${Math.round(data.hourly.temperature_2m[i])}°`;
    }
}

function cityDailyWeather(id, svgIcons, data) {

    const dailyWeatherArray = []

    for(i = 1; i < 9; i++) {
        const WeatherInfo = { dayOfTheWeek: document.querySelector(`.day-${i}-${id} > .day-of-the-week`), minMaxTemp: document.querySelector(`.day-${i}-${id} > .min-max-temp`), svgContainer: document.querySelector(`.day-${i}-${id} > .svg-container-2`) };
        dailyWeatherArray.push(WeatherInfo);
    }

    const week = dayOfTheWeek(data)

    for(i = 0; i < 8; i++) {
        dailyWeatherArray[i].dayOfTheWeek.textContent = week[i];
        dailyWeatherArray[i].minMaxTemp.textContent = `${Math.round(data.daily.temperature_2m_min[i])} / ${Math.round(data.daily.temperature_2m_max[i])}`;
        dailyWeatherArray[i].svgContainer.innerHTML = `${svgIcons[i]}`;
    }
}

// ----------------------------- KHAKRIV -----------------------------

async function fetchWeatherKharkiv() {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=49.9808&longitude=36.2527&current_weather=true&hourly=dewpoint_2m,uv_index&timezone=auto`;
    try {
        const res = await fetch("/api/get-weather?city=kharkiv");
        const data = await res.json();
        const res2 = await fetch(url)
        const data2 = await res2.json();

        renderCityWeather(1, data, data2)
    } catch(err) {
        console.log(`error ${err}`)
    }
}

async function fetchHourlyWatherKharkiv() {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=49.9808&longitude=36.2527&hourly=weathercode,is_day,temperature_2m,precipitation_probability,cloudcover&timezone=auto&forecast_days=1";
    try {
        const res = await fetch(url);
        const data = await res.json();
        const icons = await fetchWeatherIcons(49.9808, 36.2527)
        const svgIcons = icons.map((iconName, index) => {
            const uniqueId = `grad-${index}-1`;
            const allIcons = weatherSVGs(uniqueId); 
            return allIcons[iconName] || allIcons["cloudy"];
        });
        cityHourlyWeather(1, svgIcons, data)
    }
    catch(err) {
        console.log(`error ${err}`)
    }
}

async function fetchDailyWatherKharkiv() {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=49.9808&longitude=36.2527&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=8";
    try {
        const res = await fetch(url);
        const data = await res.json();
        const icons = await fetchWeatherIcons(49.9808, 36.2527)
        const svgIcons = icons.map((iconName, index) => {
            const uniqueId = `grad-${index}-5`;
            const allIcons = weatherSVGs(uniqueId); 
            return allIcons[iconName] || allIcons["cloudy"];
        });
        cityDailyWeather(1, svgIcons, data)
    }
    catch(err) {
        console.log(`error ${err}`)
    }
}

// ----------------------------- ZABRZE -----------------------------

async function fetchWeatherZabrze() {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=50.3249&longitude=18.7858&current_weather=true&hourly=dewpoint_2m,uv_index&timezone=auto`;
    try {
        const res = await fetch("/api/get-weather?city=zabrze");
        const res2 = await fetch(url)
        const data = await res.json();
        const data2 = await res2.json();

        renderCityWeather(2, data, data2)
    } catch(err) {
        console.log(`error ${err}`)
    }
}

async function fetchHourlyWatherZabrze() {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=50.3249&longitude=18.7858&hourly=weathercode,is_day,temperature_2m,precipitation_probability,cloudcover&timezone=auto&forecast_days=1";
    try {
        const res = await fetch(url);
        const data = await res.json();
        const icons = await fetchWeatherIcons(50.3249, 18.7858)
        const svgIcons = icons.map((iconName, index) => {
            const uniqueId = `grad-${index}-2`;
            const allIcons = weatherSVGs(uniqueId); 
            return allIcons[iconName] || allIcons["cloudy"];
        });
        cityHourlyWeather(2, svgIcons, data)
    }
    catch(err) {
        console.log(`error ${err}`)
    }
}

async function fetchDailyWatherZabrze() {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=50.3249&longitude=18.7858&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=8";
    try {
        const res = await fetch(url);
        const data = await res.json();
        const icons = await fetchWeatherIcons(50.3249, 18.7858)
        const svgIcons = icons.map((iconName, index) => {
            const uniqueId = `grad-${index}-6`;
            const allIcons = weatherSVGs(uniqueId); 
            return allIcons[iconName] || allIcons["cloudy"];
        });
        cityDailyWeather(2, svgIcons, data)
    }
    catch(err) {
        console.log(`error ${err}`)
    }
}

// ----------------------------- GOTTMADINGEN -----------------------------

async function fetchWeatherGottmadingen() {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=47.7351&longitude=8.7769&current_weather=true&hourly=dewpoint_2m,uv_index&timezone=auto`;
    try {
        const res = await fetch("/api/get-weather?city=gottmadingen");
        const res2 = await fetch(url);
        const data = await res.json();
        const data2 = await res2.json();

        renderCityWeather(3, data, data2)
    } catch(err) {
        console.log(`error ${err}`)
    }
}

async function fetchHourlyWatherGottmadingen() {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=47.7351&longitude=8.7769&hourly=temperature_2m,precipitation_probability,cloudcover&timezone=auto&forecast_days=1";
    try {
        const res = await fetch(url);
        const data = await res.json();
        const icons = await fetchWeatherIcons(47.7351, 8.7769)
        const svgIcons = icons.map((iconName, index) => {
            const uniqueId = `grad-${index}-3`;
            const allIcons = weatherSVGs(uniqueId); 
            return allIcons[iconName] || allIcons["cloudy"];
        });
        cityHourlyWeather(3, svgIcons, data)
    }
    catch(err) {
        console.log(`error ${err}`)
    }
}

async function fetchDailyWatherGottmadingen() {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=47.7351&longitude=8.7769&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=8";
    try {
        const res = await fetch(url);
        const data = await res.json();
        const icons = await fetchWeatherIcons(47.7351, 8.7769)
        const svgIcons = icons.map((iconName, index) => {
            const uniqueId = `grad-${index}-7`;
            const allIcons = weatherSVGs(uniqueId); 
            return allIcons[iconName] || allIcons["cloudy"];
        });
        cityDailyWeather(3, svgIcons, data)
    }
    catch(err) {
        console.log(`error ${err}`)
    }
}

// ----------------------------- SANDANSKI -----------------------------

async function fetchWeatherSandanski() {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=41.5667&longitude=23.2833&current_weather=true&hourly=dewpoint_2m,uv_index&timezone=auto`;
    try {
        const res = await fetch("/api/get-weather?city=sandanski");
        const res2 = await fetch(url)
        const data = await res.json();
        const data2 = await res2.json();

        renderCityWeather(4, data, data2)
    } catch(err) {
        console.log(`error ${err}`)
    }
}

async function fetchHourlyWatherSandanski() {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=41.5667&longitude=23.2833&hourly=temperature_2m,precipitation_probability,cloudcover&timezone=auto&forecast_days=1";
    try {
        const res = await fetch(url);
        const data = await res.json();
        const icons = await fetchWeatherIcons(41.5667, 23.2833)
        const svgIcons = icons.map((iconName, index) => {
            const uniqueId = `grad-${index}-4`;
            const allIcons = weatherSVGs(uniqueId); 
            return allIcons[iconName] || allIcons["cloudy"];
        });
        cityHourlyWeather(4, svgIcons, data)
    }
    catch(err) {
        console.log(`error ${err}`)
    }
}

async function fetchDailyWatherSandanski() {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=41.5667&longitude=23.2833&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=8";
    try {
        const res = await fetch(url);
        const data = await res.json();
        const icons = await fetchWeatherIcons(41.5667, 23.2833)
        const svgIcons = icons.map((iconName, index) => {
            const uniqueId = `grad-${index}-8`;
            const allIcons = weatherSVGs(uniqueId); 
            return allIcons[iconName] || allIcons["cloudy"];
        });
        cityDailyWeather(4, svgIcons, data)
    }
    catch(err) {
        console.log(`error ${err}`)
    }
}

function getWindDirection(deg) {
    const directions = [
        "N", "NNE", "NE", "ENE",
        "E", "ESE", "SE", "SSE",
        "S", "SSW", "SW", "WSW",
        "W", "WNW", "NW", "NNW"
    ];

    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
}

async function fetchWeatherIcons(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=weathercode,is_day&timezone=auto&forecast_days=1`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const h = data.hourly;

        return h.time.map((_, i) => {
            const code = h.weathercode[i];
            const isDay = !!h.is_day[i];

            // 0: Чистое небо
            if (code === 0) return isDay ? "clear-day" : "clear-night";
            
            // 1, 2: Преимущественно ясно / Переменная облачность
            if (code === 1 || code === 2) return isDay ? "partly-cloudy-day" : "partly-cloudy-night";
            
            // 3, 45, 48: Пасмурно, Туман
            if ([3, 45, 48].includes(code)) return "cloudy";

            // 51-67, 80-82, 95-99: Все виды дождя, мороси и гроз
            // Добавляем сюда коды 66, 67 (ледяной дождь) — визуально это дождь
            if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) {
                return isDay ? "partly-cloudy-day-rain" : "partly-cloudy-night-rain";
            }

            // 71-77, 85, 86: Снег, снежные зерна, снежные ливни
            if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";

            return "cloudy"; // Безопасный возврат
        });
    } catch (err) {
        console.log("Ошибка API:", err);
        return [];
    }
}

function dayOfTheWeek(data) {
    const todayFromApi = data.daily.time[0];

    return data.daily.time.map((dateStr) => {
    // Добавляем 'T00:00', чтобы JS не сдвигал дату на день назад из-за часового пояса
    const date = new Date(dateStr + 'T00:00');
        
    if (dateStr === todayFromApi) {
        return "Today";
    }

    // Возвращаем Mon, Tue и т.д.
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    });
}

for(let i = 1; i <= 4; i++) {
    activeHandlers.push({
        h1: () => disableCityEditMode(i, nameOfTheCityFromButton),
        city: (e) => addRemoveCity(e),
        prevent: (e) => e.preventDefault()
    })
}

function hideBlock() {
    addCityButtonBlock.classList.add("hidden");
}

function showBlock() {
    addCityButtonBlock.classList.remove("hidden");
}

function hideButtonH1() {
    addCityH1.classList.add("hidden");
    addCityButton.classList.add("self-center");
}

function showButtonH1() {
    addCityH1.classList.remove("hidden");
    addCityButton.classList.remove("self-center");
}

function renderAddButton() {
    if(Cities.length === 0) {
        showBlock()
        showButtonH1()
    }
    else if(Cities.length > 0 && Cities.length < 4) {
        showBlock()
        hideButtonH1()
    }
    else if(Cities.length === 4) {
        hideBlock()
    }
}

async function buttonFetchWeatherNew(id) {
    try {
        const res = await fetch(`/api/get-weather?city=${cityInfo.name}`);
        const res2 = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${cityInfo.lat}&longitude=${cityInfo.long}&current_weather=true&hourly=dewpoint_2m,uv_index&timezone=auto`);
        const data = await res.json();
        const data2 = await res2.json();

        renderCityWeather(id, data, data2, true)
        nameOfTheCityFromButton = data.name;
    }
    catch(err) {
        console.log(`error ${err}`)
    }
}

async function searchForCity(input) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${input.value}&count=1&format=json`
    const res = await fetch(url)
    const data = await res.json()

    if(!data.results) {
        console.log("City is not found");
        return null;
    }
    else {
        const city = data.results[0];
        cityInfo = {
            name: city.name,
            lat: city.latitude,
            long: city.longitude
        };
        let cityNameCheck = Cities.includes(cityInfo.name);
        console.log(cityInfo)
        if(!cityNameCheck) {
            addingBlockFromButton = false;
            fetchWeatherNew()
        }
    }
}

async function searchForCityWithButton(input, id) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${input.value}&count=1&format=json`
    const res = await fetch(url)
    const data = await res.json()

    if(!data.results) {
        console.log("City is not found");
        return null;
    }
    else {
        const city = data.results[0];
        cityInfo = {
            name: city.name,
            lat: city.latitude,
            long: city.longitude
        };
        let cityNameCheck = Cities.includes(cityInfo.name);
        console.log(cityInfo)
        if(!cityNameCheck) {
            buttonFetchWeatherNew(id)
        }
    }
}

function findTheWeatherBlock(data, data2) {
    for(let i = 1; i <= 4; i++) {
        if(!weatherBlocks[i].classList.contains("grid")) {
            let index = i-1;
            renderCityWeather(i, data, data2);
            weatherBlocks[i].classList.add("grid")
            weatherBlocks[i].classList.add("opacity")
            currentBtn = document.getElementById(`btn-${i}`);
            if(currentBtn.dataset.hasH1Listener) {
                currentBtn?.removeEventListener("click", ()=> {
                    disableCityEditMode(i, nameOfTheCityFromButton);
                })
                delete currentBtn.dataset.hasH1Listener;
            }
            if(!currentBtn.dataset.hasListener) {
                currentBtn?.addEventListener("click", addRemoveCity)
                currentBtn.dataset.hasListener = "true";
            }
            deletedIndex = index;
            break;
        }
    }
}

function checkInputH1() {
    for(let i = 1; i <= 4; i++) {
        let index = i-1;
        if(deletedIndex === index) {
            let inputH1 = document.getElementById(`input-${i}`)
            let formH1 = document.getElementById(`form-${i}`)
            let btn = document.getElementById(`btn-${i}`)
            formH1?.addEventListener("submit", activeHandlers[index].prevent)
            formH1?.addEventListener("submit", activeHandlers[index].h1)
            formH1?.addEventListener("submit", activeHandlers[index].city)
            if(!btn.dataset.hasH1Listener) {
                btn?.addEventListener("click", activeHandlers[index].h1)
                btn.dataset.hasH1Listener = "true";
            }
            if(!btn.dataset.hasListener) {
                btn?.addEventListener("click", activeHandlers[index].city)
                btn.dataset.hasListener = "true";
            }
            break;
        }
    }
}

function findTheWeatherBlockButton() {
    for(let i = 1; i <= 4; i++) {
        if(!weatherBlocks[i].classList.contains("grid")) {
            enableCityEditMode(i)
            let inputH1 = document.getElementById(`input-${i}`)
            let formH1 = document.getElementById(`form-${i}`)
            let index = i-1;
            currentBtn = document.getElementById(`btn-${i}`);
            currentBtn.removeEventListener("click", addRemoveCity)
            inputH1?.addEventListener("input", ()=> {
                clearTimeout(timeout)
                timeout = setTimeout(() => {
                    searchForCityWithButton(inputH1, i);
                }, 500);
            })
            formH1?.addEventListener("submit", activeHandlers[index].prevent)
            if(currentBtn.dataset.hasH1Listener) {
                currentBtn?.removeEventListener("click", activeHandlers[index].h1)
                delete currentBtn.dataset.hasH1Listener;
            }
            if(currentBtn.dataset.hasListener) {
                currentBtn?.removeEventListener("click", activeHandlers[index].city)
                delete currentBtn.dataset.hasListener;
            }
            weatherBlocks[i].classList.add("grid")
            weatherBlocks[i].classList.add("opacity")
            deletedIndex = index;
            addingBlockFromButton = true;
            break;
        }
    }
}

function findDeletedWeatherBlocks() {
    for(let i = 1; i <= 4; i++) {
        if(cityRenders[`cityRendered${i}`] === false) {
            let index = i-1;
            deletions[index] = true;
            deletedIndex = index;
            break;
        }
    }
}

async function fetchWeatherNew() {
    try {
        const res = await fetch(`/api/get-weather?city=${cityInfo.name}`);
        const res2 = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${cityInfo.lat}&longitude=${cityInfo.long}&current_weather=true&hourly=dewpoint_2m,uv_index&timezone=auto`);
        const data = await res.json();
        const data2 = await res2.json();

        findTheWeatherBlock(data, data2)
        hideBlock()

    } catch(err) {
        console.log(`error ${err}`)
    }
}

function addRemoveCity(e) {
    const cityName = e?.currentTarget?.dataset?.cityName || cityInfo.name;
    const number = e?.currentTarget?.dataset?.number;
    btn1 = document.getElementById(`btn-${number}`);
    if (!Cities.includes(cityName) && Cities.length < 4) {
        deletions.includes(true) ? Cities.splice(deletedIndex, 0, cityInfo.name) : Cities.push(cityInfo.name);
        currentBtn.innerHTML = `<svg class="remove-svg" xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#434343"><path d="M200-446.67v-66.66h560v66.66H200Z"/></svg>`
        currentBtn.parentElement.classList.add("opacity");
        addingBlockFromButton = false;
        getIndexForButtons();
        saveCities();
    }
    else if(Cities.includes(cityName)) {
        let indexOfRemovedCity = Cities.indexOf(cityName)
        Cities = Cities.filter(city => city !== cityName);
        if (indexOfRemovedCity !== -1) {
            btn1.parentElement.classList.remove("grid")
            btn1.parentElement.classList.remove("opacity");
            btn1.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#434343"><path d="M446.67-446.67H200v-66.66h246.67V-760h66.66v246.67H760v66.66H513.33V-200h-66.66v-246.67Z"/></svg>`
            clearCityWeather(number);
            if(!addingBlockFromButton) {
                findDeletedWeatherBlocks();
            }
        }
        saveCities();
    }
    if(!addingBlockFromButton) {
        renderAddButton();
    }
}

async function renderCitiesWeather() {
    for(const [index, city] of Cities.entries()) {
        (async function cityrender() {
            try {
                const weatherBlock = document.getElementById(`weather-${index+1}`);
                weatherBlock.classList.add("grid")
                weatherBlock.classList.add("opacity")
                const currentBtn = document.getElementById(`btn-${index+1}`)
                currentBtn.innerHTML = `<svg class="remove-svg" xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#434343"><path d="M200-446.67v-66.66h560v66.66H200Z"/></svg>`
                const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&format=json`
                const res = await fetch(`/api/get-weather?city=${city}`);
                const res2 = await fetch(url)
                const data = await res.json();
                const data2 = await res2.json();
                const cityInfoData = data2.results[0];
                let cityInfo = {
                    lat: cityInfoData.latitude,
                    long: cityInfoData.longitude
                };
                const res3 = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${cityInfo.lat}&longitude=${cityInfo.long}&current_weather=true&hourly=dewpoint_2m,uv_index&timezone=auto`);
                const data3 = await res3.json()
    
                renderCityWeather(index+1, data, data3);
                searchInProcess = false;
                currentBtn.removeEventListener("click", addRemoveCity);
                currentBtn.addEventListener("click", addRemoveCity);
            } catch(err) {
                console.log(`error ${err}`)
            }
        })();
    }
}

function getIndexForButtons() {
    Cities.forEach((city, index) => {
        const currentBtn = document.getElementById(`btn-${index+1}`)
        currentBtn.dataset.cityName = city;
        currentBtn.dataset.number = index+1;
    })
}

function saveCities() {
    const CitiesStorage = JSON.stringify(Cities);
    localStorage.setItem("Cities", CitiesStorage)
}

function loadCities() {
    const CitiesStorage = localStorage.getItem("Cities");
    return JSON.parse(CitiesStorage) || [];
}

async function fetchHourlyWatherKharkiv() {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=49.9808&longitude=36.2527&hourly=weathercode,is_day,temperature_2m,precipitation_probability,cloudcover&timezone=auto&forecast_days=1";
    try {
        const res = await fetch(url);
        const data = await res.json();
        const icons = await fetchWeatherIcons(49.9808, 36.2527)
        const svgIcons = icons.map((iconName, index) => {
            const uniqueId = `grad-${index}-1`;
            const allIcons = weatherSVGs(uniqueId); 
            return allIcons[iconName] || allIcons["cloudy"];
        });
        cityHourlyWeather(1, svgIcons, data)
    }
    catch(err) {
        console.log(`error ${err}`)
    }
}

async function fetchDailyWatherKharkiv() {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=49.9808&longitude=36.2527&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=8";
    try {
        const res = await fetch(url);
        const data = await res.json();
        const icons = await fetchWeatherIcons(49.9808, 36.2527)
        const svgIcons = icons.map((iconName, index) => {
            const uniqueId = `grad-${index}-5`;
            const allIcons = weatherSVGs(uniqueId); 
            return allIcons[iconName] || allIcons["cloudy"];
        });
        cityDailyWeather(1, svgIcons, data)
    }
    catch(err) {
        console.log(`error ${err}`)
    }
}


document.addEventListener("DOMContentLoaded", ()=> {
    loadCities();
    getIndexForButtons();
    renderCitiesWeather();
    renderAddButton();
    // fetchWeatherKharkiv();
    // fetchHourlyWatherKharkiv();
    // fetchDailyWatherKharkiv();

    // fetchWeatherZabrze();
    // fetchHourlyWatherZabrze();
    // fetchDailyWatherZabrze();

    // fetchWeatherGottmadingen();
    // fetchHourlyWatherGottmadingen();
    // fetchDailyWatherGottmadingen();

    // fetchWeatherSandanski();
    // fetchHourlyWatherSandanski();
    // fetchDailyWatherSandanski();
    searchInput.addEventListener("input", ()=> {
        if(searchInput.value.length > 0) {
            clearTimeout(timeout)
            timeout = setTimeout(()=> {
                searchForCity(searchInput);
            }, 500)
        }
    })
    addCityButton.addEventListener("click", ()=> {
        findTheWeatherBlockButton();
        hideBlock();
    })
})