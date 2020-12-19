export const REQUEST_OPTIONS = {
    method: 'GET',
    redirect: 'follow',
};

// префикс https://cors-anywhere.herokuapp.com используем для доступа
// к данным с других сайтов если браузер возвращает ошибку Cross-Origin Request Blocked
// from https://codepen.io/irinainina/pen/LYNqmQd
// const corsPrefix = 'https://cors-anywhere.herokuapp.com/';
const corsPrefix = '';

export const SUMMARY_URL = `${corsPrefix}https://api.covid19api.com/summary`;
export const COUNTRY_URL = `${corsPrefix}https://api.covid19api.com/dayone/country/`;

export const FLAGS_URL = 'https://restcountries.eu/rest/v2/all?fields=name;population;flag';
