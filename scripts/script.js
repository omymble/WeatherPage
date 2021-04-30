const API_KEY = '349adfe04241534f6ed0cfe457001bf0';
const URL_REQUEST = 'https://api.openweathermap.org/data/2.5/weather?';

let currentSection = document.body.querySelector('.current');
let loadingImg = document.body.querySelector('.loading');

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

const makeURL = (obj) => { return URL_REQUEST + new URLSearchParams(obj).toString() }
const iconUrl = (code) => { return `http://openweathermap.org/img/wn/${code}@2x.png` }
const convertDeg = (temperature) => { return Math.round(temperature - 273.15) }

//buttons
let updateLocation = document.body.querySelector('.header__button');
let deleteCity = document.body.querySelector('.city-header_button');
let addCity = document.body.querySelector('.favourite_new-city_button');


let newHeader = {
    city: 'London',
    icon: '01d',
    temperature: 10
}
let newText = {
    wind: 'Moderate breeze',
    cloudy: 'broken clouds',
    pressure: '1013 hpa',
    humidity: '52%',
    coord: '(59.88, 30.42)'
}


function pendingCurrent() {
    currentSection.classList.add('invisible');
    loadingImg.classList.add('visible');
}
function gotCurrent() {
    currentSection.classList.remove('invisible');
    loadingImg.classList.remove('visible');
}
function pendingFavourite() {
    let favInfo = document.body.getElementsByClassName('details')[1];
    favInfo.classList.add('invisible');
    loadingImg.classList.add('visible');
}
function gotFavourite() {
    let favInfo = document.body.getElementsByClassName('details')[1];
    favInfo.classList.remove('invisible');
    loadingImg.classList.remove('visible');
}

//data - response in JSON
function addCurrentToDOM(data) {
    console.log('our json');
    console.log(data);
    newText.wind = data.wind.speed + 'm/s';
    newText.cloudy = data.clouds.all + '%';
    newText.pressure = data.main.pressure + 'hpa';
    newText.humidity = data.main.humidity + '%';
    newText.coord = data.coord.lon + '; ' + data.coord.lat;

    newHeader.city = data.name;
    newHeader.icon = data.weather.icon;
    newHeader.temperature = Math.round((data.weather.temperature - 32) * 5 / 9);
    return data;
    // console.log('newText', newText);
    // console.log('newHeader', newHeader);
}

//get your current-position weather
function currentGeo() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    }
    else {
        alert('Impossible to get your geolocation');
        // addCurrentToDOM(getCityJSON(makeURL(defaultRequest)));
    }
}
const success = async (position) => {
    if (simpleRequest.q) {delete simpleRequest.q}
    simpleRequest.lat = position.coords.latitude;
    simpleRequest.lon = position.coords.longitude;
    let response = await getCityJSON(makeURL(simpleRequest));
    //addCurrentToDOM()
    console.log('successResult', response);
}
const error = (err) => {
    alert(`ERROR(${err.code}): ${err.message}`);
    addCurrentToDOM(makeURL(defaultRequest));
    console.log(`ERROR(${err.code}): ${err.message}`);
}


//get json information about a city by url
const getCityJSON = async (stringUrl) => {
    //add loader
    try {
        let response = await fetch(stringUrl);
        if (response.status !== 200) {
            throw new Error(`error ${response.statusText}`);
        }
        return response.json();
    } catch (err) {
        alert(err.message);
    }
}

function favourites() {
    let cityList = JSON.parse(localStorage.getItem('favCities'));
}

function getListOfFavourite() {
    myStorage = window.localStorage;
    if(!myStorage.getItem('favCities')) {
        //if list is empty
    } else {
        setCities();
    }
}


updateLocation.addEventListener('click', async ()=> {
    await currentGeo();
});