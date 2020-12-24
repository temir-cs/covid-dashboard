export const REQUEST_OPTIONS = {
    method: 'GET',
    redirect: 'follow',
};

export const GLOBAL_URL = 'https://disease.sh/v3/covid-19/all?yesterday=false&twoDaysAgo=0&allowNull=true';
export const COUNTRY_URL = 'https://disease.sh/v3/covid-19/countries?yesterday=false&twoDaysAgo=false&allowNull=true';
export const GLOBAL_DAILY_URL = 'https://disease.sh/v3/covid-19/historical/all?lastdays=all';

export const TOTAL_SPREAD_SPEED_LEVELS = 10;

export const INVALID_GEO_NAMES = ['Anguilla', 'Aruba', 'Bermuda', 'British Virgin Islands', 'Caribbean Netherlands', 'Cayman Islands',
    'Channel Islands', 'Curaçao', 'Falkland Islands (Malvinas)', 'Faroe Islands', 'French Guiana', 'French Polynesia',
    'Gibraltar', 'Greenland', 'Guadeloupe', 'Holy See (Vatican City State)', 'Hong Kong', 'Isle of Man', 'Macao',
    'Martinique', 'Mayotte', 'Montserrat', 'Myanmar', 'New Caledonia', 'Palestine', 'Réunion', 'Saint Martin',
    'Saint Pierre Miquelon', 'Sint Maarten', 'St. Barth', 'Turks and Caicos Islands', 'Wallis and Futuna', 'Western Sahara'];
