import './js/widget';
import './js/time';
import './js/citat';
import './js/chart';
import './js/fivedays';
import './js/ref';
import './js/active-btn-fivedays-card';
import './js/moreinfo';
import './js/more-info-scroll-btn';
import './js/five-days-scroll-btn';
import './js/api';

import { getCityImage, getWeather } from './js/api';
import {
  getLocalStorage,
  addLocalStorage,
  removeFromLocalStorage,
} from './js/utils';
import { addBackgroundImage, updateWidget } from './js/widget';
import { createChart } from './js/chart';

import { createCityElement } from './js/searchBar';
import { sunTime, intervalTime } from './js/time';

const form = document.querySelector('.form');
const cityContainer = document.querySelector('.slider');

let timerOnload = null;
let itemsSearch = [];

/**
 * functie care updateaza componentele la schimbarea orasului
 * @param {*} data
 */
function changeCity(data) {
  updateWidget(data);
  createChart(data);
  sunTime(data.city.sunrise, data.city.sunset, data.city.timezone);
}

//! form aici (eventListener)
form.addEventListener('submit', async event => {
  event.preventDefault();
  const {
    elements: { search },
  } = event.currentTarget;

  const data = await getWeather(search.value);
  changeCity(data);

  const backgroundImage = await getCityImage(search.value);
  addBackgroundImage(backgroundImage);

  const citySearch = { id: Date.now(), city: search.value };
  itemsSearch.push(citySearch);

  addLocalStorage(itemsSearch);

  createCityElement(citySearch.id, citySearch.city);


  clearInterval(timerOnload);
  timerOnload = setInterval(() => {
    intervalTime(data.city.timezone);
  }, 1000);

  


  form.reset();
});

//! load cand se incarca pagina
window.addEventListener('load', () => {
  itemsSearch = getLocalStorage() === null ? [] : getLocalStorage();

  // folosesc functia din wiget.js cu ultimul element din localStorage
  // itemsSearch[itemsSearch.length - 1];

  if (itemsSearch.length !== 0) {
    getCityImage(itemsSearch[itemsSearch.length - 1].city).then(data =>
      addBackgroundImage(data)
    );

    getWeather(itemsSearch[itemsSearch.length - 1].city).then(data => {
      updateWidget(data);
      sunTime(data.city.sunrise, data.city.sunset, data.city.timezone);
      timerOnload = setInterval(() => {
        intervalTime(data.city.timezone);
      }, 1000);
    });

    // createCityElement(itemsSearch);
    itemsSearch.map(data => createCityElement(data.id, data.city));
    // folosesc functia din wiget.js cu ultimul element din localStorage
  } else {
    getCityImage('Cluj').then(data => addBackgroundImage(data));
    getWeather('Cluj').then(data => {
      updateWidget(data);
      createChart(data);
      sunTime(data.city.sunrise, data.city.sunset, data.city.timezone);
      timerOnload = setInterval(() => {
        intervalTime(data.city.timezone);
      }, 1000);
    });
  }
});

//! incarca orasul cand apesi pe cityDiv
cityContainer.addEventListener('click', async event => {
  const uniqId = event.target.parentElement.dataset.id;

  if (event.target.tagName === 'BUTTON') {
    itemsSearch = itemsSearch.filter(city => +city.id !== +uniqId);
    removeFromLocalStorage(uniqId);
    event.target.parentElement.remove();
  }
  if (event.target.tagName === 'H2') {
    const searchValue = event.target.innerText;
    const data = await getWeather(searchValue).then(data => {
      clearInterval(timerOnload);
      timerOnload = setInterval(() => {
        intervalTime(data.city.timezone);
      }, 1000);

      return data;
    });
    updateWidget(data);
    const backgroundImage = await getCityImage(searchValue);
    addBackgroundImage(backgroundImage);
  }
});
