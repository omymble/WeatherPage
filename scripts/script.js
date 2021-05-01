const API_KEY = '349adfe04241534f6ed0cfe457001bf0';
const URL_REQUEST = 'https://api.openweathermap.org/data/2.5/weather?';

const defaultRequest = {
    lat: 51.5085,
    lon: -0.1257,
    appid: API_KEY
}
let simpleRequest = {
    q: 'London',
    lat: 51.5085,
    lon: -0.1257,
    appid: API_KEY
}

const generateEmptyTemplate = () => {
    return document.querySelector('#favourite-city-template').content;
}
let currentSection = document.body.querySelector('.current');
let favouriteSection = document.body.querySelector('.favourite');

const setLoadingCurrent = (flag) => {
    let geoLoader = document.querySelector('.loading-geo');
    if (!flag) {
        currentSection.classList.remove('invisible');
        // geoLoader.classList.remove('visible');
        // currentSection.classList.add('visible');
        geoLoader.classList.add('invisible');
    } else {
        // currentSection.classList.remove('visible');
        geoLoader.classList.remove('invisible');
        currentSection.classList.add('invisible');
        // geoLoader.classList.add('visible');
    }
}

const setLoadingFav = (flag) => {
    let favLoader = document.querySelector('.loading-fav');
    if (!flag) {
        favouriteSection.classList.remove('invisible');
        // favLoader.classList.remove('visible');
        // favouriteSection.classList.add('visible');
        favLoader.classList.add('invisible');
    } else {
        // favouriteSection.classList.remove('visible');
        favLoader.classList.remove('invisible');
        favouriteSection.classList.add('invisible');
        // favLoader.classList.add('visible');
    }
}

const makeURL = (obj) => { return URL_REQUEST + new URLSearchParams(obj).toString() }
const iconUrl = (code) => { return `http://openweathermap.org/img/wn/${code}@2x.png` }
const convertDeg = (temperature) => { return Math.round(temperature - 273.15) }

//buttons
let updateLocation = document.body.querySelector('.header__button');
let deleteCity = document.body.querySelector('.city-header_button');

const currentToDOM = (cityInfo) => {
    currentSection.querySelector('.city_name').innerHTML = cityInfo.name;
    currentSection.querySelector('.degree').innerHTML = `${convertDeg(cityInfo.main.temp)} &degC`;
    currentSection.querySelector('.icon').setAttribute('src', iconUrl(cityInfo.weather[0].icon));
    addCityParams(currentSection.querySelector('.details'), cityInfo)
}



const addCityParams = (searchParams, weatherData) => {
    let paramArray = searchParams.querySelectorAll('.details_item')

    paramArray[0].querySelector('.details_item__name').innerHTML  = 'Ветер'
    paramArray[1].querySelector('.details_item__name').innerHTML  = 'Облачность'
    paramArray[2].querySelector('.details_item__name').innerHTML  = 'Давление'
    paramArray[3].querySelector('.details_item__name').innerHTML  = 'Влажность'
    paramArray[4].querySelector('.details_item__name').innerHTML  = 'Координаты'

    paramArray[0].querySelector('.details_item__value').innerHTML  = weatherData.wind.speed
    paramArray[1].querySelector('.details_item__value').innerHTML  = weatherData.clouds.all
    paramArray[2].querySelector('.details_item__value').innerHTML  = weatherData.main.pressure
    paramArray[3].querySelector('.details_item__value').innerHTML  = weatherData.main.humidity
    paramArray[4].querySelector('.details_item__value').innerHTML  = '[ ' + weatherData.coord.lat + ', ' + weatherData.coord.lon + ' ]'
}

//get your current-position weather
function currentGeo() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    }
    else {
        alert('Impossible to get your geolocation');
        currentToDOM(getCityJSON(makeURL(defaultRequest)));
    }
}
const success = async (position) => {
    setLoadingCurrent(true);
    if (simpleRequest.q) {delete simpleRequest.q}
    simpleRequest.lat = position.coords.latitude;
    simpleRequest.lon = position.coords.longitude;
    let response = await getCityJSON(makeURL(simpleRequest));
    currentToDOM(response);
    setLoadingCurrent(false);
}
const error = async (err) => {
    setLoadingCurrent(true);
    alert(`ERROR(${err.code}): ${err.message}`);
    let response = await getCityJSON(makeURL(defaultRequest));
    currentToDOM(response);
    setLoadingCurrent(false);
}


//get json information about a city by url
const getCityJSON = async (stringUrl) => {
    let response;
    try {
        response = await fetch(stringUrl);
        if (response.status === 404){
            throw new Error('Impossible to find this city. Does not exist');
        }
        if (response.status === 401){
            throw new Error('Token problems');
        }
        if (response.status === 403){
            throw new Error('Forbidden');
        }
        if (response.status === 500){
            throw new Error('Internal error');
        }
        if (response.status === 503){
            throw new Error('Service is not available');
        }
    } catch (err) {
        alert(err.message);
        setLoadingCurrent(false);
        setLoadingFav(false);
    }
    if (response.ok) {
        return await response.json();
    }
}


const addNewCity = async (cityName, isNew) => {
    let favList = document.querySelector('.favourite-list');
    simpleRequest.q = cityName;
    if (simpleRequest.lat && simpleRequest.lon) {
        delete simpleRequest.lat;
        delete simpleRequest.lon;
    }
    setLoadingFav(true);
    let response = await getCityJSON(makeURL(simpleRequest));
    if (response.id && localStorage.getItem(response.id) !== null && isNew){
        alert('Already added');
    } else {
        localStorage.setItem(response.id, cityName);
        let template = generateEmptyTemplate();
        let favouriteCity = document.importNode(template, true);
        favouriteCity.querySelector('.city_name').setAttribute('custom_id', response.id);
        attachRemoveEvents(favouriteCity.querySelector('.delete'));
        favouriteCity.querySelector('.city_name').innerHTML = response.name;
        favouriteCity.querySelector('.degree').innerHTML = `${convertDeg(response.main.temp)} &degC`;
        favouriteCity.querySelector('.icon').setAttribute('src', iconUrl(response.weather[0].icon));
        addCityParams(favouriteCity, response)
        favList.appendChild(favouriteCity);
    }
    setLoadingFav(false);
}

setFavorites = () => {
    if (localStorage.length === 0) {
        setLoadingFav(false);
    }
    else {
        for (let i = 0; i < localStorage.length; i++) {
            addNewCity(localStorage.getItem(localStorage.key(i)), false);
        }
    }
}


const attachAddEvents = () => {
    const input = document.querySelector('#new-city');
    let addCityBtn = document.body.querySelector('.favourite_new-city_button');
    addCityBtn.addEventListener('click', event => {
        event.preventDefault();
        if (input.value === ''){
            alert('Write smth');
            return;
        }
        addNewCity(input.value, true);
        input.value = '';
    })
}

const attachRemoveEvents = (removeBtn) => {
    removeBtn.addEventListener('click', (event) => {
        event.preventDefault()
        const mainList = removeBtn.parentNode.parentNode.parentNode
        if(removeBtn.parentNode.parentNode){
            mainList.removeChild(removeBtn.parentNode.parentNode)
            localStorage.removeItem(removeBtn.parentNode.querySelector('.city_name').getAttribute('custom_id'))
        }
    })
}


updateLocation.addEventListener('click', async ()=> {
    await currentGeo();
});

currentGeo();
setFavorites();
attachAddEvents();