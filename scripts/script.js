const API_KEY = '349adfe04241534f6ed0cfe457001bf0';
const URL_REQUEST = 'https://api.openweathermap.org/data/2.5/weather?';

let currentSection = document.querySelector('.current');
let loadingImg = document.querySelector('.loading');

const defaultRequest = {
    lat: 35,
    lon: 139,
    appid: API_KEY
}

let nameRequest = {
    q: 'London',
    appid: API_KEY
}

let coordRequest = {
    lat: 35,
    lon: 139,
    appid: API_KEY
}

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

function iconUrl(code) {
    /*let iconCode = '01d';
    let iconid = Math.trunc(code);
    switch (iconid) {
        case 2:
            iconCode = '11d';
            break;
        case 3:
            iconCode = '09d';
            break;
        case 5: {
            if (code < 511)
                iconCode = '10d';
            else if (code > 511)
                iconCode = '09d';
            else
                iconCode = '13d';
            break;
        }
        case 6:
            iconCode = '13d';
            break;
        case 7:
            iconCode = '50d';
            break;
        case 8: {
            if (code === 800)
                iconCode = '01d';
            else if (code === 801)
                iconCode = '02d';
            else if (code === 802)
                iconCode = '03d';
            else if (code === 803 || code === 804)
                iconCode = '04d';
            break;
        }
        default:
            iconCode = '01d';
    }*/
    return `http://openweathermap.org/img/wn/${code}@2x.png`
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

function addNewCurrentCity(data) {
    newText.wind = data.wind.speed + 'm/s';
    newText.cloudy = data.clouds.all + '%';
    newText.pressure = data.main.pressure + 'hpa';
    newText.humidity = data.main.humidity + '%';
    newText.coord = data.coord.lon + '; ' + data.coord.lat;

    newHeader.city = data.name;
    newHeader.icon = data.weather.icon;
    newHeader.temperature = Math.round((data.weather.temperature - 32) * 5 / 9);
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
        addNewCurrentCity(getByCoord(defaultRequest));
    }
}
const success = (position) => {
    coordRequest.lat = position.coords.latitude;
    coordRequest.lon = position.coords.longitude;
    let resultData = addNewCurrentCity(getByCoord(coordRequest));

    console.log('successResult', resultData);
}
const error = (err) => {
    alert(`ERROR(${err.code}): ${err.message}`);
    addNewCurrentCity(getByCoord(defaultRequest));
}

function getWeather(url) {
    return fetch(url)
        .then((response => {
            return response.json();
        }))
        .then((data => {
            return data;
        }))
        .catch((error) => {
            alert(error.message);
            return Promise.reject();
        })
}

function getByCoord(coordRequest) {
    let urlParams = new URLSearchParams(coordRequest).toString();
    let urlByCoord = URL_REQUEST + urlParams;
    return getWeather(urlByCoord);
}

function getByName(nameRequest) {
    nameRequest.q =  document.querySelector('input').value;
    let urlParams = new URLSearchParams(nameRequest).toString();
    let urlByName = URL_REQUEST + urlParams;
    return getWeather(urlByName);
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
    // console.log('requestResult', requestResult);
});