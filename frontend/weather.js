// ------ CONFIGURATION & DATA ------
const apiKey = "";
let Cities = loadCities() || [];
let cityInfo = {};

// ------ STATE & FLAGS ------
let searchInProcess = false;
let addingBlockFromButton = false;
let addingBlockFromSearch = false;
let timeout = null;
let addButton = loadAddButtonState();

// ------ LOGIC HELPERS ------
const activeHandlers = [];
let deletingWeatherBlocks = false;
let searchingWeatherBlocksCleared = false;
let advancedBlocksIndex = null;
let currentBtns;
let newIndex = 4;
let searchingIndex = null;
let weatherRendered = false;
let buttonInputValue;
let nameOfTheCity;
let weatherSlider;
let weatherSlider1;
let currentSearchId = 0;

// ------ DOM ELEMENTS ------
const fullWeatherContainers = document.querySelectorAll(".full-weather-container")
const searchInput = document.querySelector(".search-input")
const addCityButtonBlocks = document.querySelectorAll(".add-city-button-block")
const addCityH1 = document.querySelector(".add-city-button-h1")
const addCityButton = document.querySelector(".add-city-button")
const addButonBlock = document.querySelector(".add-city-button-block")
const addButtonsToggle = document.querySelectorAll(".action-button-toggle")
const resetButtons = document.querySelectorAll(".action-button-reset")
const reloadButtons = document.querySelectorAll(".action-button-reload")
const sliderButtons = {
    right: document.querySelector("#w-arrow1"),
    left: document.querySelector("#w-arrow2")
}
const templates = {
    easy: document.querySelector("#weather-card-template"),
    advanced: document.querySelector("#advanced-weather-card-template")
}

// ADVANCED SLIDER BUTTON 
const slides1 = [ Array.from(document.querySelectorAll(".full-weather-container")) ];

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
        // ------------ FOR H1 OF ADVANCED WEATHER CONTAINERS-------------
        document.querySelector(`#full-weather-container-${id} > .weather-h1`).textContent = data.name;
        document.querySelector(`#full-weather-container-${id} > .weather-h1`).classList.add("visible")
    }
    weatherInfo.tempRn.forEach((el)=> el.textContent = Math.round(data.main.temp)+"°")
    weatherInfo.aboutRn.forEach((el)=> el.textContent = data.weather[0].description.replace(/\b\w/g, c => c.toUpperCase()))
    weatherInfo.aboutRn.forEach(el => {
        const text = el.textContent.trim();
        const words = text.split(/\s+/);

        if (words.length > 2 && text.length > 15) {
            const firstPart = words.slice(0, 2).join(' ');
            const secondPart = words.slice(2).join(' ');
        
            el.textContent = `${firstPart}\n${secondPart}`;
        }
    });
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
        "light intensity shower rain": "light_rain.jpg",
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

    if(isButton && addingBlockFromButton) {
        let i = getIndex();
        const weatherBlock = document.querySelector(`#mini-weather-container-${i}`);
        checkInputH1();
        weatherBlock.classList.add("grid");
        weatherRendered = true;
        searchingWeatherBlocksCleared = false;
    }
}

function enableCityEditMode(id) {
    document.querySelectorAll(`.h1-${id}`).forEach((el) => el.innerHTML = `<div class="input-form-wrapper"><form class="input-form form-${id}"><div class="button-h1-input-wrapper"><input class="button-h1-input input-${id}" type="text"></div></form><button class="cancel-btn c-btn-${id} small-cancel-btn"><svg class="cancel-svg small-cancel-svg" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#666666"><path d="M256-192.35 192.35-256l224-224-224-224L256-767.65l224 224 224-224L767.65-704l-224 224 224 224L704-192.35l-224-224-224 224Z"/></svg></button></div>`);
    document.querySelectorAll(`.c-btn-${id}`).forEach(el => el.addEventListener("click", ()=> {
        cancelBtnInput(id)
    }))
    document.querySelectorAll(`#full-weather-container-${id} > .weather-h1`).forEach((el) => el.classList.add("visible"))
}

function disableCityEditMode(id, cityNameButton) {
    document.querySelectorAll(`.h1-${id}`).forEach((el) => el.textContent = cityNameButton);
}

function cityHourlyWeather(id, svgIcons, data, isButton = false) {
    
    const hourlyWeatherArray = []
    
    for(let i = 1; i < 25; i++) {
        const WeatherInfo = { hourTime: document.querySelector(`.hour-${i}-${id} > .hour-time`), svgContainer: document.querySelector(`.hour-${i}-${id} > .svg-container`), chanceOfPrecipitation: document.querySelector(`.hour-${i}-${id} > .chance-of-precipitation`), hourlyWeatherDeg: document.querySelector(`.hour-${i}-${id} > .hourly-weather-deg`) };
        hourlyWeatherArray.push(WeatherInfo);
    }
    
    for(let i = 0; i < 12; i++) {
        hourlyWeatherArray[i].hourTime.textContent = `${i+1} a.m`;
    }
    
    for(let i = 0; i < 12; i++) {
        hourlyWeatherArray[i+12].hourTime.textContent = `${i+1} p.m`;
    }
    
    for(let i = 0; i < 24; i++) {
        hourlyWeatherArray[i].svgContainer.innerHTML = `${svgIcons[i]}`;
        hourlyWeatherArray[i].chanceOfPrecipitation.textContent = `${data.hourly.precipitation_probability[i]}%`;
        hourlyWeatherArray[i].hourlyWeatherDeg.textContent = `${Math.round(data.hourly.temperature_2m[i])}°`;
    }
    if(isButton) {
        if(addingBlockFromButton) {
            const weatherBlock1 = document.querySelector(`#weather-container-${id}`)
            const weatherBlock2 = document.querySelector(`#daily-weather-${id}`)
            weatherBlock1.classList.remove("hidden")
            weatherBlock2.classList.remove("hidden")
        } else {
            deleteNewWeatherBlock();
        }
    }
}

function cityDailyWeather(id, svgIcons, data, isButton = false) {

    const dailyWeatherArray = []

    for(let i = 1; i < 9; i++) {
        const WeatherInfo = { dayOfTheWeek: document.querySelector(`.day-${i}-${id} > .day-of-the-week`), minMaxTemp: document.querySelector(`.day-${i}-${id} > .min-max-temp`), svgContainer: document.querySelector(`.day-${i}-${id} > .svg-container-2`) };
        dailyWeatherArray.push(WeatherInfo);
    }

    const week = dayOfTheWeek(data)

    for(let i = 0; i < 8; i++) {
        dailyWeatherArray[i].dayOfTheWeek.textContent = week[i];
        dailyWeatherArray[i].minMaxTemp.textContent = `${Math.round(data.daily.temperature_2m_min[i])} / ${Math.round(data.daily.temperature_2m_max[i])}`;
        dailyWeatherArray[i].svgContainer.innerHTML = `${svgIcons[i]}`;
    }
}

function clearCityWeather(id, searching = false) {

    clearUpdateTime(id);

    const weatherInfo = {name: document.querySelectorAll(`.h1-${id}`), tempRn: document.querySelectorAll(`.temp-rn-p-${id}`), aboutRn: document.querySelectorAll(`.about-rn-${id}`), aboutFeels: document.querySelectorAll(`.about-feels-${id}`), wind: document.querySelectorAll(`.wind-${id}`), humidity: document.querySelectorAll(`.humidity-${id}`), visibility: document.querySelectorAll(`.visibility-${id}`), pressure: document.querySelectorAll(`.pressure-${id}`), wd: document.querySelectorAll(`.wd-${id}`), uv: document.querySelectorAll(`.uv-${id}`), dp: document.querySelectorAll(`.dp-${id}`)};
    if(!searching) {
        weatherInfo.name?.forEach((el)=> el.textContent = "")
        document.querySelector(`#full-weather-container-${id} > .weather-h1`).classList.remove("visible")
        document.querySelector(`#full-weather-container-${id} > .weather-h1`).textContent = "Default";
    }
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
}

function clearCityHourlyWeather(id) {
    
    const hourlyWeatherArray = []
    
    for(let i = 1; i < 25; i++) {
        const WeatherInfo = { hourTime: document.querySelector(`.hour-${i}-${id} > .hour-time`), svgContainer: document.querySelector(`.hour-${i}-${id} > .svg-container`), chanceOfPrecipitation: document.querySelector(`.hour-${i}-${id} > .chance-of-precipitation`), hourlyWeatherDeg: document.querySelector(`.hour-${i}-${id} > .hourly-weather-deg`) };
        hourlyWeatherArray.push(WeatherInfo);
    }
    
    for(let i = 0; i < 12; i++) {
        hourlyWeatherArray[i].hourTime.textContent = "";
    }
    
    for(let i = 0; i < 12; i++) {
        hourlyWeatherArray[i+12].hourTime.textContent = "";
    }
    
    for(let i = 0; i < 24; i++) {
        hourlyWeatherArray[i].svgContainer.innerHTML = "";
        hourlyWeatherArray[i].chanceOfPrecipitation.textContent = "";
        hourlyWeatherArray[i].hourlyWeatherDeg.textContent = "";
    }
}

function clearCityDailyWeather(id) {

    const dailyWeatherArray = []

    for(let i = 1; i < 9; i++) {
        const WeatherInfo = { dayOfTheWeek: document.querySelector(`.day-${i}-${id} > .day-of-the-week`), minMaxTemp: document.querySelector(`.day-${i}-${id} > .min-max-temp`), svgContainer: document.querySelector(`.day-${i}-${id} > .svg-container-2`) };
        dailyWeatherArray.push(WeatherInfo);
    }

    for(let i = 0; i < 8; i++) {
        dailyWeatherArray[i].dayOfTheWeek.textContent = "";
        dailyWeatherArray[i].minMaxTemp.textContent = "";
        dailyWeatherArray[i].svgContainer.innerHTML = "";
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

// ---------------FRONTEND TO BACKEND---------------------
// async function registration() {
//     const response = await fetch(`${BASE_URL}/registration`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email: signUpUserInput.value.trim(), password: signUpPassInput.value.trim() })
//     });
//     const data = await response.json();
//     console.log(data)
// }

// for(let i = 1; i <= 4; i++) {
//     activeHandlers.push({
//         h1: () => disableCityEditMode(i, nameOfTheCity),
//         city: (e) => addRemoveCity(e),
//         prevent: (e) => e.preventDefault(),
//     })
// }

function hideBlock() {
    const buttonBlockContainer = document.querySelector(".block-container")
    buttonBlockContainer?.classList.add("hidden")
    addCityButtonBlocks.forEach(block => {
        block.classList.add("hidden")
    })
}

function showBlock() {
    const buttonBlockContainer = document.querySelector(".block-container")
    buttonBlockContainer?.classList.remove("hidden")
    addCityButtonBlocks.forEach(block => {
        block.classList.remove("hidden")
    })
}

function hideButtonH1() {
    addCityH1.classList.add("hidden")
    addCityButton.classList.add("self-center")
}

function showButtonH1() {
    addCityH1.classList.remove("hidden")
    addCityButton.classList.remove("self-center")
}

function hideSliderButtons() {
    for(let key in sliderButtons) {
        sliderButtons[key].classList.add("hidden")
    }
}

function showSliderButtons() {
    for(let key in sliderButtons) {
        sliderButtons[key].classList.remove("hidden")
    }
}

function renderAddButton1() {
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

function renderAddButton1H1() {
    if(Cities.length === 0) {
        showButtonH1()
    }
    else if(Cities.length > 0 && Cities.length < 4) {
        hideButtonH1()
    }
}

function hideWeatherBlocks(id) {
    const weatherBlock1 = document.querySelector(`#mini-weather-container-${id}`);
    const weatherBlock2 = document.querySelector(`#weather-container-${id}`)
    const weatherBlock3 = document.querySelector(`#daily-weather-${id}`)
    weatherBlock1.classList.remove("grid")
    weatherBlock2.classList.add("hidden")
    weatherBlock3.classList.add("hidden")
    // clearCityWeather(id, true)
    // clearCityHourlyWeather(id)
    // clearCityDailyWeather(id)
    searchingWeatherBlocksCleared = true;
}

function renderAddButton(cancelInput = false) {
    if(Cities.length < 4) {
        let i;
        if(cancelInput) {
            i = searchingIndex;
        } else {
            i = getIndex();
        }
    
        const fullWeatherContainer = document.querySelector(`#full-weather-container-${i}`)
        const weatherContainer = fullWeatherContainer.querySelector(".weather-container")
        const weatherContainerH1 = fullWeatherContainer.querySelector(`.weather-h1`)
        const dailyWeatherContainer = fullWeatherContainer.querySelector(`.eight-days-weather`)
        const weatherContainerAddButton = fullWeatherContainer.querySelector(`.add-city-button-block-1`)
        
        fullWeatherContainer.classList.add("block-container", "opacity")
        weatherContainerH1?.classList.add("hidden");
        weatherContainer.classList.add("hidden");
        dailyWeatherContainer?.classList.add("hidden")
        weatherContainerAddButton.classList.add("grid")
        fullWeatherContainer.classList.remove("hidden")
        // if(deletingWeatherBlocks) {
        //     autoSwitchByElement(fullWeatherContainer)
        // }
    }
}

function hideAddButton() {
    let i = getIndex();
    const fullWeatherContainer = document.querySelector(`#full-weather-container-${i}`)
    const weatherContainer = fullWeatherContainer.querySelector(".weather-container")
    const weatherContainerH1 = fullWeatherContainer.querySelector(`.weather-h1`)
    // const dailyWeatherContainer = fullWeatherContainer.querySelector(`.eight-days-weather`)
    const weatherContainerAddButton = fullWeatherContainer.querySelector(`.add-city-button-block-1`)
    fullWeatherContainer.classList.remove("block-container")
    weatherContainerH1?.classList.remove("hidden");
    weatherContainerAddButton.classList.remove("grid")
    weatherContainer.classList.remove("opacity")
}

function renderSliderButtons() {
    if(Cities.length >= 1 && addButton || Cities.length >= 1 && addingBlockFromSearch || Cities.length > 1 && !addButton) {
        showSliderButtons();
    } else {
        hideSliderButtons();
    }
}

async function buttonFetchWeatherNew(id) {
    try {
        const res = await fetch(`${BASE_URL}/weather/api/get-weather?city=${cityInfo.name}`);
        const res2 = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${cityInfo.lat}&longitude=${cityInfo.long}&current_weather=true&hourly=dewpoint_2m,uv_index&timezone=auto`);
        const data = await res.json();
        const data2 = await res2.json();

        if (!res.ok) {
            if (res.status === 404) {
                console.error("Город не найден (404)");
                return;
            }
            throw new Error(`Ошибка сервера: ${res.status}`);
        }

        renderCityWeather(id, data, data2, true)
        fetchHourlyWeatherNew(id, true);
        fetchDailyWeatherNew(id, true);
        nameOfTheCity = data.name;
    }
    catch(err) {
        console.log(`error ${err}`)
    }
}

async function searchForCity(input, requestId) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${input.value}&count=1&format=json`
    const res = await fetch(url)
    const data = await res.json()

    if(requestId !== currentSearchId) return;

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
        let cityCheck = !Cities.includes(cityInfo.name) && Cities.length < 4;
        console.log(cityInfo)
        if(cityCheck) {
            addingBlockFromButton = false;
            addingBlockFromSearch = true;
            fetchWeatherNew(requestId)
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

function findTheWeatherBlock(data, data2, requestId) {
    if (requestId !== currentSearchId) return;
    let i = getIndex()

    const weatherBlock = document.querySelector(`#mini-weather-container-${i}`);
    let index = i-1;
    cancelBtn(i)
    renderCityWeather(i, data, data2);
    if(addingBlockFromSearch) {
        weatherBlock.classList.add("grid")
        weatherBlock.closest(".weather").classList.add("grid")
        currentBtns = document.querySelectorAll(`.btn-${i}`);
        currentBtns.forEach(currentBtn => {
            if(!currentBtn.dataset.hasListener) {
                currentBtn?.addEventListener("click", addRemoveCity)
                currentBtn.dataset.hasListener = "true";
            }
        })
    }
    advancedBlocksIndex = i;
}

function findTheHourlyWeatherBlock(id, data, data2, icons, button = false) {
    let i = button ? id : advancedBlocksIndex;
    const svgIcons = icons.map((iconName, index) => {
        const uniqueId = `grad-${index}-${i}`;
        const allIcons = weatherSVGs(uniqueId);
        return allIcons[iconName] || allIcons["cloudy"];
    });
    cityHourlyWeather(i, svgIcons, data2, button)
    if(addingBlockFromButton || addingBlockFromSearch) {
        const weatherContainer = document.querySelector(`#full-weather-container-${i}`)
        const weatherContainerH1 = weatherContainer.querySelector(`.weather-h1`)
        const weatherContainerAddButton = weatherContainer.querySelector(`.add-city-button-block-1`)
        weatherContainerH1.classList.remove("hidden");
        weatherContainerAddButton.classList.remove("grid")
        weatherContainer.classList.remove("block-container");
        weatherContainer.classList.remove("hidden");
        if(!button) {
            weatherContainer.classList.add("opacity")
            weatherContainer.querySelector(".weather-container").classList.remove("hidden")
        }
        currentBtns = document.querySelectorAll(`.btn-${i}`);
        currentBtns.forEach(currentBtn => {
            if(!currentBtn.dataset.hasListener) {
                currentBtn?.addEventListener("click", addRemoveCity)
                currentBtn.dataset.hasListener = "true";
            }
        })
        autoSwitchByElement(weatherContainer)
    }
    renderSliderButtons();
    searchingIndex = i;
}

function findTheDailyWeatherBlock(id, data, data2, icons, button = false) {
    let i = button ? id : advancedBlocksIndex;
    const svgIcons = icons.map((iconName, index) => {
        const uniqueId = `grad-${index}-${i+4}`;
        const allIcons = weatherSVGs(uniqueId);
        return allIcons[iconName] || allIcons["cloudy"];
    });
    cityDailyWeather(i, svgIcons, data2, button)
    if(addingBlockFromButton || addingBlockFromSearch) {
        const weatherContainer = document.querySelector(`#daily-weather-${i}`)
        if(!button) {
            weatherContainer.classList.remove("opacity")
            weatherContainer.classList.remove("hidden")
        }
        currentBtns = document.querySelectorAll(`.btn-${i}`);
        currentBtns.forEach(currentBtn => {
            if(!currentBtn.dataset.hasListener) {
                currentBtn?.addEventListener("click", addRemoveCity)
                currentBtn.dataset.hasListener = "true";
            }
        })
    }
}

function deleteNewWeatherBlock() {
    addingBlockFromSearch = false;
    addingBlockFromButton = false;
    let i = searchingIndex;
    if(i !== null) {
        const fullWeatherContainer = document.querySelector(`#full-weather-container-${i}`);
        const weatherBlock = document.querySelector(`#mini-weather-container-${i}`);
        weatherBlock.classList.remove("grid")
        weatherBlock.parentElement.classList.remove("grid")
        weatherBlock.classList.remove("opacity")
        fullWeatherContainer.classList.remove("opacity")
        fullWeatherContainer.classList.add("hidden")
        if(addButton) {
            renderAddButton()
        }
        clearCityWeather(i);
        clearCityHourlyWeather(i)
        clearCityDailyWeather(i)
    }
}

function checkInputH1() {
    let i = getIndex();
    let formH1s = document.querySelectorAll(`.form-${i}`)
    let btns = document.querySelectorAll(`.btn-${i}`)
    const newHandlers = {
        h1: () => disableCityEditMode(i, nameOfTheCity),
        city: (e) => addRemoveCity(e),
        prevent: (e) => e.preventDefault()
    }
    formH1s.forEach(formH1 => {
        formH1?.addEventListener("submit", newHandlers.prevent)
        formH1?.addEventListener("submit", newHandlers.h1)
        formH1?.addEventListener("submit", newHandlers.city)
    })
    btns.forEach(btn => {
        if(!btn.dataset.hasH1Listener) {
            btn?.addEventListener("click", newHandlers.h1)
            btn.dataset.hasH1Listener = "true";
        }
        if(!btn.dataset.hasListener) {
            btn?.addEventListener("click", newHandlers.city)
            btn.dataset.hasListener = "true";
        }
    })
}

// function antiCheckInputH1() {
//     let i = getIndex();
//     let formH1s = document.querySelectorAll(`.form-${i}`)
//     let btns = document.querySelectorAll(`.btn-${i}`)
//     const newHandlers = {
//         h1: () => disableCityEditMode(i, nameOfTheCity),
//         city: (e) => addRemoveCity(e),
//         prevent: (e) => e.preventDefault(),
//     }
//     formH1s.forEach(formH1 => {
//         formH1?.removeEventListener("submit", newHandlers.h1)
//         formH1?.removeEventListener("submit", newHandlers.city)
//     })
//     btns.forEach(btn => {
//         if(btn.dataset.hasH1Listener) {
//             btn?.removeEventListener("click", newHandlers.h1)
//             delete btn.dataset.hasH1Listener;
//         }
//         if(btn.dataset.hasListener) {
//             btn?.removeEventListener("click", newHandlers.city)
//             delete btn.dataset.hasListener;
//         }
//     })
// }

function syncButtonInputs(e) {
    const inputs = document.querySelectorAll(".weather-project-2 input, .weather-project input, .weather-project-3 input");
    inputs.forEach(input => {
        if(input !== e.target) {
            input.value = e.target.value;
        }
    })
}

function findTheWeatherBlockButton1() {
    let i = getIndex();
    hideBlock();
    enableCityEditMode(i)
    let inputH1s = document.querySelectorAll(`.input-${i}`)
    let formH1s = document.querySelectorAll(`.form-${i}`)
    let index = i-1;
    const newHandlers = {
        prevent: (e) => e.preventDefault()
    }
    const currentMode = localStorage.getItem("Mode");
    inputH1s.forEach(inputH1 => {
        inputH1?.addEventListener("input", (e)=> {
            if(!searchingWeatherBlocksCleared) {
                hideWeatherBlocks(i)
            }
            syncButtonInputs(e)
            // antiCheckInputH1();
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                searchForCityWithButton(inputH1, i);
            }, 500);
        })
    })
    formH1s.forEach(formH1 => {
        formH1?.addEventListener("submit", newHandlers.prevent)
    })
    document.querySelector(`#weather-${i}`).classList.add("grid")
    currentMode === "Advanced" ? inputH1s[1].focus() : inputH1s[0].focus();
    addingBlockFromButton = true;
}

function findTheWeatherBlockButton() {
    let i = getIndex();
    const fullWeatherContainer = document.querySelector(`#full-weather-container-${i}`)
    fullWeatherContainer.classList.remove("hidden")
    enableCityEditMode(i)
    hideAddButton()
    addingBlockFromButton = true;
}

function addEventListenerForAddButton() {
    if(Cities.length < 4) {
        let i = getIndex();
        const fullWeatherContainer = document.querySelector(`#full-weather-container-${i}`)
        const addCityButton = fullWeatherContainer.querySelector(".add-city-button")
        if(!addCityButton.dataset.hasListener) {
            addCityButton.addEventListener("click", ()=> {
                findTheWeatherBlockButton()
                findTheWeatherBlockButton1()
                correctAddButtonsPosition();
            })
            addCityButton.dataset.hasListener = "true";
        }
    }
}

async function fetchWeatherNew(requestId) {
    try {
        const res = await fetch(`${BASE_URL}/weather/api/get-weather?city=${cityInfo.name}`);
        const res2 = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${cityInfo.lat}&longitude=${cityInfo.long}&current_weather=true&hourly=dewpoint_2m,uv_index&timezone=auto`);
        const data = await res.json();
        const data2 = await res2.json();

        if (requestId !== currentSearchId) return;

        if (!res.ok) {
            if (res.status === 404) {
                if(addButton) {
                    renderAddButton();
                }
                console.error("Город не найден (404)");
                return;
            }
            throw new Error(`Ошибка сервера: ${res.status}`);
        }
        findTheWeatherBlock(data, data2, requestId)
        fetchHourlyWeatherNew();
        fetchDailyWeatherNew();
        correctAddButtonsPosition();
        if(addingBlockFromSearch) {
            hideBlock()
        }
        nameOfTheCity = data.name;

    } catch(err) {
        console.log(`error ${err}`)
    }
}

async function fetchHourlyWeatherNew(id, button = false) {
    try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityInfo.name}&count=1&format=json`);
        const data = await res.json();
        const res2 = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${cityInfo.lat}&longitude=${cityInfo.long}&hourly=weathercode,is_day,temperature_2m,precipitation_probability,cloudcover&timezone=auto&forecast_days=1`)
        const data2 = await res2.json();

        const icons = await fetchWeatherIcons(cityInfo.lat, cityInfo.long)

        findTheHourlyWeatherBlock(id, data, data2, icons, button)

    } catch(err) {
        console.log(`error ${err}`)
    }
}

async function fetchDailyWeatherNew(id, button = false) {
    try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityInfo.name}&count=1&format=json`);
        const data = await res.json();
        const res2 = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${cityInfo.lat}&longitude=${cityInfo.long}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=8`)
        const data2 = await res2.json();

        const icons = await fetchWeatherIcons(cityInfo.lat, cityInfo.long)

        findTheDailyWeatherBlock(id, data, data2, icons, button)

    } catch(err) {
        console.log(`error ${err}`)
    }
}

function addButonBlockTop() {
    if(Cities.length > 0) {
        addButonBlock.classList.add("top")
    } else {
        addButonBlock.classList.remove("top")
    }
}

function addRemoveCity(e) {
    const cityName = e?.currentTarget?.dataset?.cityName || cityInfo.name;
    const number = e?.currentTarget?.dataset?.number;
    let btns = document.querySelectorAll(`.btn-${number}`);
    if (!Cities.includes(cityName) && Cities.length < 4) {
        Cities.push(cityInfo.name);
        currentBtns.forEach(currentBtn => {
            currentBtn.innerHTML = `<svg class="btn-svg remove-svg" xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#434343"><path d="M200-446.67v-66.66h560v66.66H200Z"/></svg>`
            currentBtn.closest(".mini-weather-container")?.classList.add("opacity", "glowing-effect", "light-sweep");
            currentBtn.closest(".weather-container")?.classList.add("opacity");
            currentBtn.closest(".full-weather-container")?.querySelector(".weather-1").classList.add("glowing-effect", "light-sweep")
            currentBtn.closest(".full-weather-container")?.querySelector(".weather-2").classList.add("glowing-effect", "light-sweep")
            currentBtn.closest(".full-weather-container")?.querySelector(".eight-days-weather")?.classList.add("glowing-effect", "opacity", "light-sweep");
            currentBtn.closest(".full-weather-container")?.querySelector(".mobile-cancel-btn").classList.remove("flex")
            currentBtn.closest(".full-weather-container")?.querySelector(".desktop-cancel-btn").classList.remove("flex")
            currentBtn.closest(".mini-weather-container")?.querySelector(".cancel-btn").classList.remove("flex")
            lightSweepAnimationRemove(currentBtn)
        })
        deletingWeatherBlocks = false;
        addingBlockFromButton = false;
        addingBlockFromSearch = false;
        findingTheWeatherBlock = false;
        weatherRendered = false;
        searchInput.value = "";
        getIndexForButtons();
        getNamesForButtons();
        saveCities();
    }
    else if(Cities.includes(cityName)) {
        let indexOfRemovedCity = Cities.indexOf(cityName)
        Cities = Cities.filter(city => city !== cityName);
        if (indexOfRemovedCity !== -1) {
            btns.forEach(btn => {
                btn.closest(".weather")?.remove();
                btn.closest(".full-weather-container")?.remove();
            })
            weatherSlider.refresh();
            weatherSlider1.refresh();
            deletingWeatherBlocks = true;
        }
        saveCities();
    }
    const weatherBlocks = document.querySelectorAll(".full-weather-container")
    if(weatherBlocks.length < 4) {
        newIndex += 1;
        renderCards(newIndex)
    }
    if(!addingBlockFromButton) {
        if(addButton) {
            renderAddButton1();
            renderAddButton();
            if(deletingWeatherBlocks) {
                const fullWeatherContainers = document.querySelectorAll(".full-weather-container")
                for(let i = 0; i <= fullWeatherContainers.length-1; i++) {
                    if(fullWeatherContainers[i].classList.contains("block-container")) {
                        autoSwitchByElement(fullWeatherContainers[i])
                        break;
                    }
                }
            }
        } else {
            if(deletingWeatherBlocks) {
                const fullWeatherContainers = document.querySelectorAll(".full-weather-container")
                for(let i = fullWeatherContainers.length-1; i >= 0; i--) {
                    if(fullWeatherContainers[i].classList.contains("opacity")) {
                        autoSwitchByElement(fullWeatherContainers[i])
                        break;
                    }
                }
            }
        }
        renderAddButton1H1();
        addEventListenerForAddButton()
    }
    addButonBlockTop();
    correctAddButtonsPosition()
    weatherBackgroundEasyModeUpdate()
    renderSliderButtons();
}

function lightSweepAnimationRemove(btn) {
    const mini = btn.closest(".mini-weather-container");
    const w1 = btn.closest(".full-weather-container")?.querySelector(".weather-1");
    const w2 = btn.closest(".full-weather-container")?.querySelector(".weather-2");
    const w8 = btn.closest(".full-weather-container")?.querySelector(".eight-days-weather");

    [mini, w1, w2, w8].forEach(el => {
        if (!el) return;

        const handleAnimationEnd = (e) => {
            if (e.target !== el) return;

            el.classList.remove("light-sweep");
            el.removeEventListener("animationend", handleAnimationEnd);
            el.removeEventListener("animationcancel", handleAnimationEnd);
        };

        el.addEventListener("animationend", handleAnimationEnd);
        el.addEventListener("animationcancel", handleAnimationEnd);
    });
}

function cancelBtnInput(id) {
    const inputs = document.querySelectorAll(`input-${id}`)
    const weatherBlock = document.querySelector(`#mini-weather-container-${id}`);
    document.querySelectorAll(`.h1-${id}`).forEach(el => {
        el.textContent = "Default";
        el.classList.remove("visible")
        el.parentElement.classList.remove("grid")
    });
    weatherBlock.classList.remove("grid")
    if(addButton) {
        weatherRendered ? renderAddButton(true) : renderAddButton();
        renderAddButton1();
    }
    else {
        const fullWeatherContainers = document.querySelectorAll(".full-weather-container")
        for(let i = 0; i <= 3; i++) {
            if(fullWeatherContainers[i].classList.contains("opacity")) {
                autoSwitchByElement(fullWeatherContainers[i])
                break;
            }
        }
        document.querySelector(`#full-weather-container-${id}`).classList.add("hidden")
    }
    addingBlockFromButton = false;
    weatherRendered = false;
    correctAddButtonsPosition()
    renderSliderButtons();
}

function cancelBtn(id) {
    const cancelBtns = document.querySelectorAll(`.c-btn-${id}`)
    const handleCancel = () => {
        if(addButton) {
            renderAddButton1();
        }
        else {
            let i;
            const weatherContainers = document.querySelectorAll(".weather-container")
            for(i = weatherContainers.length; i >= 1; i--) {
                if(weatherContainers[i-1].classList.contains("opacity")) {
                    break;
                }
            }
            autoSwitchByElement(document.querySelector(`#full-weather-container-${i}`))
        }
        deleteNewWeatherBlock()
        correctAddButtonsPosition()
        renderSliderButtons();

        cancelBtns.forEach(btn => btn.classList.remove("flex"))
        searchInput.value = "";
        addingBlockFromSearch = false;
    }
    cancelBtns.forEach(btn => {
        updateCancelBtnsVisibility()
        btn.addEventListener("click", handleCancel, { once: true });
    })
}

function updateCancelBtnsVisibility() {
    const weatherBlocks = document.querySelectorAll(".mini-weather-container");
    let i = getIndex();
    const cancelBtns = document.querySelectorAll(`.c-btn-${i}`)
    cancelBtns.forEach(btn => {
        btn.classList.add("flex")
        if(isTablet.matches) {
            if(btn.classList.contains("desktop-cancel-btn")) {
                btn.classList.remove("flex")
            }
        } else {
            if(btn.classList.contains("mobile-cancel-btn")) {
                btn.classList.remove("flex")
            }
        }
    })
}

isTablet.addEventListener("change", updateCancelBtnsVisibility)

async function renderCitiesWeather() {
    const weatherBlocks = document.querySelectorAll(".mini-weather-container")
    for(let i = 1; i <= Cities.length; i++) {
        const id = weatherBlocks[i-1].id;
        const lastIdPart = id.split("-").pop();
        let blockIndex = parseInt(lastIdPart, 10);
        (async function cityrender() {
            try {
                const weatherBlock = document.getElementById(`mini-weather-container-${blockIndex}`);
                const weatherBlock1 = document.getElementById(`weather-${blockIndex}`);
                weatherBlock.classList.add("grid")
                weatherBlock.classList.add("opacity")
                weatherBlock.classList.add("glowing-effect")
                weatherBlock1.classList.add("grid")
                const currentBtns = document.querySelectorAll(`.btn-${blockIndex}`)
                currentBtns.forEach(currentBtn => {
                    currentBtn.innerHTML = `<svg class="btn-svg remove-svg" xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#434343"><path d="M200-446.67v-66.66h560v66.66H200Z"/></svg>`
                })
                const res = await fetch(`${BASE_URL}/weather/api/get-weather?city=${Cities[i-1]}`);
                const res2 = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${Cities[i-1]}&count=1&format=json`)
                const data = await res.json();
                const data2 = await res2.json();
                const cityInfoData = data2.results[0];
                let cityInfo = {
                    lat: cityInfoData.latitude,
                    long: cityInfoData.longitude
                };
                const res3 = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${cityInfo.lat}&longitude=${cityInfo.long}&current_weather=true&hourly=dewpoint_2m,uv_index&timezone=auto`);
                const data3 = await res3.json()
    
                renderCityWeather(blockIndex, data, data3);
                searchInProcess = false;
                currentBtns.forEach(currentBtn => {
                    if(!currentBtn.dataset.hasListener) {
                        currentBtn.addEventListener("click", addRemoveCity);
                        currentBtn.dataset.hasListener = "true";
                    }
                })
            } catch(err) {
                console.log(`error ${err}`)
            }
        })();
    }
}

async function renderHourlyCitiesWeather() {
    const weatherBlocks = document.querySelectorAll(".mini-weather-container")
    for(let i = 1; i <= Cities.length; i++) {
        const id = weatherBlocks[i-1].id;
        const lastIdPart = id.split("-").pop();
        let blockIndex = parseInt(lastIdPart, 10);
        (async function cityrender() {
            try {
                const weatherContainer = document.getElementById(`weather-container-${blockIndex}`);
                weatherContainer.parentElement.classList.remove("hidden")
                weatherContainer.classList.remove("hidden")
                weatherContainer.classList.add("opacity")
                weatherContainer.parentElement.classList.add("opacity")
                weatherContainer.querySelector(".weather-1").classList.add("glowing-effect")
                weatherContainer.querySelector(".weather-2").classList.add("glowing-effect")
                const currentBtns = document.querySelectorAll(`.btn-${blockIndex}`)
                currentBtns.forEach(currentBtn => {
                    currentBtn.innerHTML = `<svg class="btn-svg remove-svg" xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#434343"><path d="M200-446.67v-66.66h560v66.66H200Z"/></svg>`
                })
                const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${Cities[i-1]}&count=1&format=json`);
                const data = await res.json();
                const cityInfoData = data.results[0];
                let cityInfo = {
                    lat: cityInfoData.latitude,
                    long: cityInfoData.longitude
                };
                const res2 = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${cityInfo.lat}&longitude=${cityInfo.long}&hourly=weathercode,is_day,temperature_2m,precipitation_probability,cloudcover&timezone=auto&forecast_days=1`)
                const data2 = await res2.json();
    
                const icons = await fetchWeatherIcons(cityInfo.lat, cityInfo.long)
                const svgIcons = icons.map((iconName, index) => {
                    const uniqueId = `grad-${index}-${blockIndex}`;
                    const allIcons = weatherSVGs(uniqueId); 
                    return allIcons[iconName] || allIcons["cloudy"];
                });
                cityHourlyWeather(blockIndex, svgIcons, data2)
                searchInProcess = false;
                currentBtns.forEach(currentBtn => {
                    if(!currentBtn.dataset.hasListener) {
                        currentBtn.addEventListener("click", addRemoveCity);
                        currentBtn.dataset.hasListener = "true";
                    }
                })
            } catch(err) {
                console.log(`error ${err}`)
            }
        })();
    }
}

async function renderDailyCitiesWeather() {
    const weatherBlocks = document.querySelectorAll(".mini-weather-container")
    for(let i = 1; i <= Cities.length; i++) {
        const id = weatherBlocks[i-1].id;
        const lastIdPart = id.split("-").pop();
        let blockIndex = parseInt(lastIdPart, 10);
        (async function cityrender() {
            try {
                const dailyWeatherContainer = document.getElementById(`daily-weather-${blockIndex}`);
                dailyWeatherContainer.classList.remove("hidden")
                dailyWeatherContainer.classList.add("opacity")
                dailyWeatherContainer.classList.add("glowing-effect")
                const currentBtns = document.querySelectorAll(`.btn-${blockIndex}`)
                currentBtns.forEach(currentBtn => {
                    currentBtn.innerHTML = `<svg class="btn-svg remove-svg" xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#434343"><path d="M200-446.67v-66.66h560v66.66H200Z"/></svg>`
                })
                const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${Cities[i-1]}&count=1&format=json`);
                const data = await res.json();
                const cityInfoData = data.results[0];
                let cityInfo = {
                    lat: cityInfoData.latitude,
                    long: cityInfoData.longitude
                };
                const res2 = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${cityInfo.lat}&longitude=${cityInfo.long}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=8`)
                const data2 = await res2.json();
    
                const icons = await fetchWeatherIcons(cityInfo.lat, cityInfo.long)
                const svgIcons = icons.map((iconName, index) => {
                    const uniqueId = `grad-${index}-${index}-${blockIndex}`;
                    const allIcons = weatherSVGs(uniqueId); 
                    return allIcons[iconName] || allIcons["cloudy"];
                });
                cityDailyWeather(blockIndex, svgIcons, data2)
                searchInProcess = false;
                currentBtns.forEach(currentBtn => {
                    if(!currentBtn.dataset.hasListener) {
                        currentBtn.addEventListener("click", addRemoveCity);
                        currentBtn.dataset.hasListener = "true";
                    }
                })
            } catch(err) {
                console.log(`error ${err}`)
            }
        })();
    }
}

function getIndexForButtons() {
    const weatherBlocks = document.querySelectorAll(".mini-weather-container")
    for(let i = 1; i <= weatherBlocks.length; i++) {
        if(weatherBlocks[i-1].classList.contains("grid")) {
            const id = weatherBlocks[i-1].id;
            const lastIdPart = id.split("-").pop();
            let blockIndex = parseInt(lastIdPart, 10)
            const currentBtns = document.querySelectorAll(`.btn-${blockIndex}`)
            currentBtns.forEach(currentBtn => {
                currentBtn.dataset.number = blockIndex;
            })
        }
    }
}

function getNamesForButtons() {
    const weatherBlocks = document.querySelectorAll(".mini-weather-container")
    for(let i = 1; i <= weatherBlocks.length; i++) {
        if(weatherBlocks[i-1].classList.contains("grid")) {
            const id = weatherBlocks[i-1].id;
            const lastIdPart = id.split("-").pop();
            let blockIndex = parseInt(lastIdPart, 10)
            const currentBtns = document.querySelectorAll(`.btn-${blockIndex}`)
            currentBtns.forEach(currentBtn => {
                currentBtn.dataset.cityName = Cities[i-1];
            })
        }
    }
}

function saveCities() {
    const CitiesStorage = JSON.stringify(Cities);
    localStorage.setItem("Cities", CitiesStorage)
}

function loadCities() {
    const CitiesStorage = localStorage.getItem("Cities");
    return JSON.parse(CitiesStorage) || [];
}

// Глобальный массив слайдеров для работы autoSwitchByElement
const allSliders = [];

function switchSlide(collection, state, i, targetIndex, dir, withAnim = true) {
    if (!collection || collection.length === 0) return;

    // Сбрасываем старый слайд, если переключение произошло быстро
    const oldSlide = collection.find(el => el && el.classList.contains("displaySlide"));
    if (oldSlide) {
        if (typeof oldSlide._cancelWatchdog === 'function') oldSlide._cancelWatchdog();
        oldSlide.classList.remove("displaySlide", "slideIn", "slideInB", "reverseSlideIn", "slideInNoOpacity", "reverseSlideInNoOpacity");
    }

    state[i] = targetIndex;
    const curr = collection[targetIndex];
    if (!curr) return;

    if (typeof curr._cancelWatchdog === 'function') curr._cancelWatchdog();
    curr.classList.remove("slideIn", "slideInB", "reverseSlideIn", "slideInNoOpacity", "reverseSlideInNoOpacity");

    if (withAnim) {
        void curr.offsetWidth; 
        let activeAnimationClass = (dir === "right") ? "slideInB" : "reverseSlideIn";
        curr.classList.add(activeAnimationClass);

        let isRunning = true;

        // 1. ЧИСТКА: общая функция для удаления классов и слушателей
        const cleanup = () => {
            isRunning = false;
            curr.classList.remove(activeAnimationClass);
            curr.removeEventListener('animationend', onAnimationEnd);
            curr._cancelWatchdog = null;
        };

        // 2. ПЛАВНЫЙ ФИНИШ: когда пользователь никуда не уходил, анимация доигрывает сама до конца
        const onAnimationEnd = () => {
            if (isRunning) cleanup();
        };

        curr.addEventListener('animationend', onAnimationEnd);
        curr._cancelWatchdog = cleanup;

        // 3. СТОРОЖ (Watchdog): покадрово проверяет, жива ли еще секция
        const watch = () => {
            if (!isRunning) return;

            const style = window.getComputedStyle(curr);
            // Проверяем все популярные способы скрыть секцию: display:none, opacity:0 или visibility:hidden
            const isHidden = curr.offsetParent === null || style.visibility === 'hidden' || style.opacity === '0';

            if (isHidden) {
                // Если пользователь ушел с секции — тупо сбриваем анимацию прямо посреди процесса
                cleanup();
                return;
            }

            requestAnimationFrame(watch);
        };

        requestAnimationFrame(watch);
    }

    curr.classList.add("displaySlide");
}

function weatherScroll(collection, state, i, dir) {
    if (!collection || collection.length === 0) return;

    let currentIdx = collection.findIndex(el => el && el.classList.contains("displaySlide"));
    if (currentIdx === -1) currentIdx = state[i];

    let nextIdx = currentIdx;
    let startIdx = nextIdx;

    do {
        nextIdx = (dir === "right")
            ? (nextIdx + 1) % collection.length
            : (nextIdx - 1 + collection.length) % collection.length;
        if (nextIdx === startIdx) return; 
    } while (!collection[nextIdx] || collection[nextIdx].classList.contains("hidden"));

    switchSlide(collection, state, i, nextIdx, dir, true);
}

function initMySlider(rightBtnId, leftBtnId) {
    const state = [0]; 
    const r_buttons = document.getElementById(rightBtnId);
    const l_buttons = document.getElementById(leftBtnId);

    // Локальный кэш коллекции элементов
    let cachedCollection = [];

    // Функция, которая обновляет кэш строго по требованию
    function updateCache() {
        cachedCollection = Array.from(document.querySelectorAll(".full-weather-container"));
    }

    // Первоначальное заполнение кэша при старте
    updateCache();
    if (cachedCollection.length > 0) {
        cachedCollection[0].classList.add("displaySlide");
    }

    // КЛИК НАПРАВО: теперь просто используем готовый кэш
    r_buttons?.addEventListener("click", () => {
        if (Cities.length > 0) {
            weatherScroll(cachedCollection, state, 0, "right");
        }
    });

    // КЛИК НАЛЕВО: используем готовый кэш
    l_buttons?.addEventListener("click", () => {
        if (Cities.length > 0) {
            weatherScroll(cachedCollection, state, 0, "left");
        }
    });

    const sliderInstance = {
        state: state,

        // Метод для принудительного обновления кэша извне (например, если удалили слайд)
        refresh: function() {
            updateCache();
        },

        // addSlide обновляет кэш СРАЗУ после добавления элемента
        addSlide: function(collectionIndex, newElement) {
            // Предполагается, что newElement уже вставлен в DOM к этому моменту.
            // Обновляем наш массив элементов актуальными данными из DOM
            updateCache(); 
            
            const hasVisible = cachedCollection.some(el => el && el.classList.contains("displaySlide"));
            if (!hasVisible && !newElement.classList.contains("hidden")) {
                newElement.classList.add("displaySlide");
            }
        },
        
        // switchTo использует уже готовый кэш
        switchTo: function(targetElement) {
            const targetIndex = cachedCollection.indexOf(targetElement);

            if (targetIndex !== -1) {
                switchSlide(cachedCollection, this.state, 0, targetIndex, "right", false);
                return true;
            }
            return false;
        }
    };

    allSliders.push(sliderInstance);
    return sliderInstance;
}

function autoSwitchByElement(targetElement) {
    if (!targetElement) return;
    for (const slider of allSliders) {
        if (slider.switchTo(targetElement)) break;
    }
}

// ACTION BAR BUTTONS

function addButtonsToggleFunction() {
    if(Cities.length < 4 && !addingBlockFromSearch && !addingBlockFromButton) {
        addButton? addButton = false : addButton = true;
        addButonBlock.classList.toggle("hidden")
        let i = getIndex();
        const fullWeatherContainer = document.querySelector(`#full-weather-container-${i}`)
        const fullWeatherContainers = document.querySelectorAll(".full-weather-container")
        if(!addButton) {
            fullWeatherContainer.classList.remove("block-container", "opacity")
            fullWeatherContainer.querySelector(".add-city-button-block-1").classList.remove("grid")
            fullWeatherContainer.classList.add("hidden")
            autoSwitchByElement(document.querySelector(`#full-weather-container-${Cities.length}`))
        } else {
            fullWeatherContainer.classList.add("block-container", "opacity")
            fullWeatherContainer.querySelector(".weather-container").classList.add("hidden")
            fullWeatherContainer.querySelector(".eight-days-weather").classList.add("hidden")
            fullWeatherContainer.querySelector(".weather-h1").classList.add("hidden")
            fullWeatherContainer.querySelector(".add-city-button-block-1").classList.add("grid")
            fullWeatherContainer.classList.remove("hidden")
            autoSwitchByElement(fullWeatherContainers[0])
            addEventListenerForAddButton()
        }
        saveAddButtonState();
        renderSliderButtons();
    } else {
        addButton? addButton = false : addButton = true;
    }
}

function showAddButtonBlock() {
    let i = getIndex();
    const fullWeatherContainer = document.querySelector(`#full-weather-container-${i}`)
    addButonBlock.classList.remove("hidden")
    fullWeatherContainer.classList.add("block-container", "opacity")
    fullWeatherContainer.querySelector(".add-city-button-block-1").classList.add("grid")
    fullWeatherContainer.classList.remove("hidden")
}

function hideAddButtonBlock() {
    let i = getIndex();
    const fullWeatherContainer = document.querySelector(`#full-weather-container-${i}`)
    addButonBlock.classList.add("hidden")
    fullWeatherContainer.classList.remove("block-container", "opacity")
    fullWeatherContainer.querySelector(".add-city-button-block-1").classList.remove("grid")
    fullWeatherContainer.classList.add("hidden")
}

function resetAllCities() {
    let number;
    const weatherBlocks = document.querySelectorAll(".mini-weather-container")
    for(let i = 1; i <= Cities.length; i++) {
        const id = weatherBlocks[i-1].id;
        const lastIdPart = id.split("-").pop();
        number = parseInt(lastIdPart, 10)
        let btns = document.querySelectorAll(`.btn-${number}`);
        clearCityWeather(number);
        clearCityHourlyWeather(number);
        clearCityDailyWeather(number)
        btns.forEach(btn => {
            btn.closest(".mini-weather-container")?.classList.remove("grid", "opacity", "glowing-effect")
            btn.closest(".weather")?.classList.remove("grid")
            btn.closest(".full-weather-container")?.classList.add("hidden")
            btn.closest(".full-weather-container")?.classList.remove("opacity")
            btn.closest(".full-weather-container")?.querySelector(".eight-days-weather").classList.remove("glowing-effect")
            btn.closest(".full-weather-container")?.querySelector(".weather-1").classList.remove("glowing-effect")
            btn.closest(".full-weather-container")?.querySelector(".weather-2").classList.remove("glowing-effect")
            btn.innerHTML = `<svg class="btn-svg" xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#434343"><path d="M446.67-446.67H200v-66.66h246.67V-760h66.66v246.67H760v66.66H513.33V-200h-66.66v-246.67Z"/></svg>`
            delete btn.dataset.cityName;
        })
    }
    showButtonH1();
    hideAddButton();
    const fullWeatherContainers = document.querySelectorAll(".full-weather-container")
    autoSwitchByElement(fullWeatherContainers[0])
    Cities.length = 0;
    if(addButton) {
        renderAddButton();
        renderAddButton1();
    }
    addEventListenerForAddButton()
    hideSliderButtons();
    saveCities();
    addButonBlockTop();
    correctAddButtonsPosition();
    weatherBackgroundEasyModeUpdate()
}

function reloadAllCities() {
    const weatherBlocks = document.querySelectorAll(".mini-weather-container")
    for(let i = 1; i <= Cities.length; i++) {
        const id = weatherBlocks[i-1].id;
        const lastIdPart = id.split("-").pop();
        number = parseInt(lastIdPart, 10)
        clearCityWeather(number);
        clearCityHourlyWeather(number);
        clearCityDailyWeather(number)
    }
    renderCitiesWeather();
    renderHourlyCitiesWeather();
    renderDailyCitiesWeather();
}

function saveAddButtonState() {
    localStorage.setItem("AddButton", String(addButton))
}

function loadAddButtonState() {
    const addButtonState = localStorage.getItem("AddButton");
    if (addButtonState === null) {
        return true;
    }
    return addButtonState === "true";
}

function initAddButtonBlock() {
    if(Cities.length < 4) {
        if(!addButton) {
            hideAddButtonBlock();
        } else {
            showAddButtonBlock();
        }
    }
}

function correctAddButtonsPosition() {
    const addButtons = document.querySelectorAll(".add-city-button-block-1")
    if(Cities.length > 0 || addingBlockFromButton || addingBlockFromSearch) {
        addButtons.forEach(el => el.classList.add("top"))
        weatherBackground.classList.add("padding-top")
        weatherProject2.classList.add("min-height")
    }
    else {
        addButtons.forEach(el => el.classList.remove("top"))
        weatherBackground.classList.remove("padding-top")
        weatherProject2.classList.remove("min-height")
    }
}

function weatherBackgroundEasyModeUpdate() {
    weatherProject.classList.remove("zero-weather-blocks", "one-weather-blocks", "two-weather-blocks", "three_and_more-weather-blocks")
    if(Cities.length === 0) {
        weatherProject.classList.add("zero-weather-blocks")
    }
    else if(Cities.length === 1) {
        weatherProject.classList.add("one-weather-blocks")
    }
    else if(Cities.length === 2) {
        weatherProject.classList.add("two-weather-blocks")
    }
    else {
        weatherProject.classList.add("three_and_more-weather-blocks")
    }
}

function renderCard(type, id) {
    const targetTemplate = templates[type]
    const specialId = getLastIndex();
    const previousWeatherBlock = document.querySelector(`#weather-${specialId}`)
    const previousWeatherContainer = document.querySelector(`#full-weather-container-${specialId}`)
    const fragment = document.importNode(targetTemplate.content, true)
    const card = fragment.querySelector(".weather")
    const advancedCard = fragment.querySelector(".full-weather-container")

    if(type === 'easy') {
        card.id = `weather-${id}`
        // weather-1
        card.querySelector(".weather-h1").classList.add(`h1-${id}`)
        card.querySelector(".weather-h1").id = `h1-${id}`
        card.querySelector(".mini-weather-container").id = `mini-weather-container-${id}`
        card.querySelector(".cancel-btn").classList.add(`c-btn-${id}`)
        card.querySelector(".add-btn").classList.add(`btn-${id}`)
        card.querySelector(".weather-details-1").classList.add(`wd-${id}`)
        card.querySelector(".current-time").classList.add(`current-time-${id}`)
        card.querySelector(".temp-rn-p").classList.add(`temp-rn-p-${id}`)
        card.querySelector(".about-rn").classList.add(`about-rn-${id}`)
        card.querySelector(".about-feels").classList.add(`about-feels-${id}`)
        card.querySelector(".wind-field").classList.add(`wind-${id}`)
        card.querySelector(".humidity-field").classList.add(`humidity-${id}`)
        card.querySelector(".visibility-field").classList.add(`visibility-${id}`)
        card.querySelector(".pressure-field").classList.add(`pressure-${id}`)
        card.querySelector(".uv-field").classList.add(`uv-${id}`)
        card.querySelector(".dp-field").classList.add(`dp-${id}`)
        previousWeatherBlock.after(fragment)
    } else {
        advancedCard.id = `full-weather-container-${id}`
        advancedCard.querySelector(".weather-h1").classList.add(`h1-${id}`)
        // weather-1
        advancedCard.querySelector(".weather-container").id = `weather-container-${id}`
        advancedCard.querySelector(".weather-1").querySelector(".cancel-btn").classList.add(`c-btn-${id}`, `mobile-cancel-btn`)
        advancedCard.querySelector(".weather-1").querySelector(".add-btn").classList.add(`btn-${id}`, `mobile-cancel-btn`)
        advancedCard.querySelector(".weather-details-1").classList.add(`wd-${id}`)
        advancedCard.querySelector(".current-time").classList.add(`current-time-${id}`)
        advancedCard.querySelector(".temp-rn-p").classList.add(`temp-rn-p-${id}`)
        advancedCard.querySelector(".about-rn").classList.add(`about-rn-${id}`)
        advancedCard.querySelector(".about-feels").classList.add(`about-feels-${id}`)
        advancedCard.querySelector(".wind-field").classList.add(`wind-${id}`)
        advancedCard.querySelector(".humidity-field").classList.add(`humidity-${id}`)
        advancedCard.querySelector(".visibility-field").classList.add(`visibility-${id}`)
        advancedCard.querySelector(".pressure-field").classList.add(`pressure-${id}`)
        advancedCard.querySelector(".uv-field").classList.add(`uv-${id}`)
        advancedCard.querySelector(".dp-field").classList.add(`dp-${id}`)
        // weather-2
        advancedCard.querySelector(".weather-2").querySelector(".cancel-btn").classList.add(`c-btn-${id}`, `desktop-cancel-btn`)
        advancedCard.querySelector(".weather-2").querySelector(".add-btn").classList.add(`btn-${id}`, `desktop-cancel-btn`)
        const hourlyWeatherBlocks = advancedCard.querySelectorAll(".hourly-weather")
        hourlyWeatherBlocks.forEach((hourlyElement, index) => {
            let hourlyNumber = index + 1;
            hourlyElement.classList.add(`hour-${hourlyNumber}-${id}`)
        })
        advancedCard.querySelector(".eight-days-weather").id = `daily-weather-${id}`
        const dailyWeatherBlocks = advancedCard.querySelectorAll(".daily-weather")
        dailyWeatherBlocks.forEach((dailyElement, index) => {
            let dailyNumber = index + 1;
            dailyElement.classList.add(`day-${dailyNumber}-${id}`)
        })
        previousWeatherContainer.after(fragment)
        weatherSlider.addSlide(0, document.querySelector(`#full-weather-container-${id}`));
        weatherSlider1.addSlide(0, document.querySelector(`#full-weather-container-${id}`));
        currentBtns = document.querySelectorAll(`.btn-${id}`)
    }
}

function renderCards(id) {
    renderCard('easy', id);
    renderCard('advanced', id);
}

function getIndex() {
    let blockIndex;
    const weatherBlocks = document.querySelectorAll(".mini-weather-container")
    for(let i = 1; i <= weatherBlocks.length; i++) {
        if(!weatherBlocks[i-1].classList.contains("grid")) {
            const id = weatherBlocks[i-1].id;
            const lastIdPart = id.split("-").pop();
            blockIndex = parseInt(lastIdPart, 10)
            break;
        }
    }
    return blockIndex;
}

function getLastIndex() {
    let blockIndex;
    const weatherBlocks = document.querySelectorAll(".full-weather-container")
    const id = weatherBlocks[weatherBlocks.length-1].id;
    const lastIdPart = id.split("-").pop();
    blockIndex = parseInt(lastIdPart, 10)
    return blockIndex;
}

document.addEventListener("DOMContentLoaded", ()=> {
    loadCities();
    addButonBlockTop();
    renderCitiesWeather();
    renderHourlyCitiesWeather();
    renderDailyCitiesWeather();
    getIndexForButtons();
    getNamesForButtons();
    renderAddButton1();
    renderAddButton();
    initAddButtonBlock()
    renderSliderButtons();
    weatherSlider = initMySlider("w-arrow1", "w-arrow2", slides1);
    weatherSlider1 = initMySlider("w-arrow3", "w-arrow4", slides1);
    addEventListenerForAddButton();
    correctAddButtonsPosition()
    weatherBackgroundEasyModeUpdate()

    searchInput.addEventListener("input", ()=> {
        currentSearchId++;
        const activeRequestId = currentSearchId;
        if(searchInput.value.length > 0) {
            clearTimeout(timeout)
            timeout = setTimeout(()=> {
                searchForCity(searchInput, activeRequestId);
            }, 500)
        } else {
            deleteNewWeatherBlock();
            correctAddButtonsPosition()
            renderSliderButtons();
        }
        if(addingBlockFromSearch && !searchingWeatherBlocksCleared) {
            if(addButton) {
                renderAddButton1();
            }
            else {
                for(let i = 0; i <= 3; i++) {
                    if(fullWeatherContainers[i].classList.contains("opacity")) {
                        autoSwitchByElement(fullWeatherContainers[i])
                        break;
                    }
                }
            }
            deleteNewWeatherBlock();
            correctAddButtonsPosition()
            renderSliderButtons();
        }
    })
    addCityButton.addEventListener("click", ()=> {
        findTheWeatherBlockButton();
        findTheWeatherBlockButton1();
        correctAddButtonsPosition();
    })
    // ACTION BAR EVENT LISTENERS
    addButtonsToggle.forEach(el => el.addEventListener("click", addButtonsToggleFunction))
    reloadButtons.forEach(el => el.addEventListener("click", reloadAllCities))
    setTimeout(() => {
        resetButtons.forEach(el => el.addEventListener("click", resetAllCities))
    }, 1500);
})