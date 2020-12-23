import Chart from 'chart.js';
// import { MONTH_NAMES, COUNTRY_NAMES } from './consts';
import { MONTH_NAMES, WORLD_BOUNDS, DEFAULT_MAP_ZOOM, DEFAULT_COUNTRY_ZOOM, CHART_TOOLTIPS } from './consts';
import { getSeverityCoefficient } from '../state/utils';

const L = require('leaflet');

export default class View {
    constructor(state) {
        this.state = state;
        this.countryMarker = 'totalConfirmed';
        this.detailsIsTotal = true;
        this.detailsIsAbs = true;
        this.chartContainer = document.querySelector('.chart-container');
        this.chart = null;
        this.map = null;
        this.countries = [];
        this.returnToGlobalBtns = document.querySelectorAll('.content__to-global-btn');
        this.expandBtns = document.querySelectorAll('.content__expand-btn');
        this.searchSuggestionsContainers = document.querySelectorAll('.content__search--suggestions');
        this.searchBars = document.querySelectorAll('.content__search');
    }

    renderState() {
        this.renderDate();
        this.renderGlobalCases();
        this.renderCountries();
        this.renderDetails();
        this.renderMap();
        this.renderChart();
    }

    renderDate() {
        const lastUpdated = document.querySelector('.content__accent--date');
        // console.log(this.state.lastUpdated);
        lastUpdated.innerText = this.state.lastUpdated.toLocaleDateString('en-GB');
    }

    renderGlobalCases() {
        const globalCases = document.querySelector('.content__accent--total');
        globalCases.innerText = this.state.global.totalConfirmed.toLocaleString('de-DE');
    }

    renderCountries(sortingCriteria) {
        const countriesContainer = document.querySelector('.countries');
        countriesContainer.innerHTML = '';
        this.countryMarker = sortingCriteria || this.countryMarker;
        if (this.state.currentCountry) {
            const countryItem = this.renderLineInCountryList(this.state.currentCountry);
            countriesContainer.appendChild(countryItem);
        } else {
            this.countries = [];
            this.state.countries.forEach((country) => {
                const countryItem = this.renderLineInCountryList(country);
                countriesContainer.appendChild(countryItem);
            });
        }
    }

    renderLineInCountryList(country) {
        const listItem = document.createElement('li');
        listItem.classList.add('countries__item');
        listItem.innerHTML = `<span class="countries__number">
                    ${country[this.countryMarker].toLocaleString('de-DE')}
                </span>
                <span class="countries__name">${country.country}</span>
                <div class="countries__flag"><img src="${country.flagPath}"></div>`;
        if (!this.state.currentCountry) {
            this.countries.push({ country: country.country, item: listItem });
        }
        return listItem;
    }

    renderSearchSuggestions(searchFieldElement, countries) {
        const suggestionsContainer = searchFieldElement.nextElementSibling;
        suggestionsContainer.innerHTML = '';
        if (countries.length === this.state.countries.length) return;
        countries.forEach((country) => {
            const countryItem = document.createElement('div');
            countryItem.classList.add('content__search--item');
            countryItem.innerHTML = `<span class="countries__flag"><img src="${country.flagPath}"></span>
                                    <span class="content__search--name">${country.country}</span>`;
            suggestionsContainer.appendChild(countryItem);
        });
    }

    clearAllSearchSuggestions() {
        this.searchSuggestionsContainers.forEach((element) => {
            const container = element;
            container.innerHTML = '';
        });
        this.searchBars.forEach((element) => {
            const bar = element;
            bar.value = '';
        });
    }

    renderDetails(countryName) {
        const source = (countryName) ? this.state.currentCountry : this.state.global;
        let cases = (this.detailsIsTotal) ? 'totalConfirmed' : 'newConfirmed';
        let deaths = (this.detailsIsTotal) ? 'totalDeaths' : 'newDeaths';
        let recovered = (this.detailsIsTotal) ? 'totalRecovered' : 'newRecovered';
        if (!this.detailsIsAbs) {
            cases = (this.detailsIsTotal) ? 'confirmedPer100K' : 'newConfirmedPer100K';
            deaths = (this.detailsIsTotal) ? 'deathsPer100K' : 'newDeathsPer100K';
            recovered = (this.detailsIsTotal) ? 'recoveredPer100K' : 'newRecoveredPer100K';
        }

        const detailsCases = document.querySelector('.stats__number--cases');
        const detailsDeaths = document.querySelector('.stats__number--deaths');
        const detailsRecovered = document.querySelector('.stats__number--recovered');
        detailsCases.innerText = source[cases].toLocaleString('de-DE');
        detailsDeaths.innerText = source[deaths].toLocaleString('de-DE');
        detailsRecovered.innerText = source[recovered].toLocaleString('de-DE');
    }

    renderPeriodToggle(periodToggle) {
        const toggle = periodToggle;
        toggle.classList.toggle('toggle__btn--toggled');
        const toggleText = document.querySelector('.toggle__txt--period');
        toggleText.innerText = (this.detailsIsTotal) ? 'Total period' : 'Last updated';
    }

    renderNumbersToggle(numsToggle) {
        const toggle = numsToggle;
        toggle.classList.toggle('toggle__btn--toggled');
        const toggleText = document.querySelector('.toggle__txt--numbers');
        toggleText.innerText = (this.detailsIsAbs) ? 'Absolute' : 'Per 100K';
    }

    updateCountryNameInDetailsAndCharts() {
        const nameToDisplay = (this.state.currentCountry) ? this.state.currentCountry.country : 'Global';
        const nameHeaders = document.querySelectorAll('.content__country-name');
        nameHeaders.forEach((header) => {
            const lineToChange = header;
            lineToChange.innerText = nameToDisplay;
        });
        this.returnToGlobalBtns.forEach((btn) => {
            if (this.state.currentCountry) {
                if (btn.classList.contains('content__to-global-btn--hidden')) {
                    btn.classList.remove('content__to-global-btn--hidden');
                }
            } else {
                if (!btn.classList.contains('content__to-global-btn--hidden')) {
                    btn.classList.add('content__to-global-btn--hidden');
                }
            }
        });
    }

    renderChart(selectedCriteria) {
        const key = selectedCriteria || 'dailyConfirmedIncrements';
        const tooltipTxt = CHART_TOOLTIPS[selectedCriteria] || 'Daily Confirmed Rates';
        const dates = [...this.state.currentGraph[key].keys()].map((x) => x.slice(0, 10));
        const values = [...this.state.currentGraph[key].values()];
        if (this.chart) { this.chart.destroy(); }
        const ctx = document.getElementById('myChart').getContext('2d');

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dates,
                datasets: [{
                    label: key,
                    data: values,
                    barPercentage: 1.0,
                    categoryPercentage: 1.0,
                    hoverBackgroundColor: 'rgba(0, 0, 0, 0.4)'
                }]
            },
            options: {
                legend: false,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            callback(value) {
                                return (value > 1000 ? `${`${value}`.slice(0, -3)}K` : value);
                            }
                        },
                    }],
                    xAxes: [{
                        gridLines: {
                            display: false,
                            offsetGridLines: false
                        },
                        ticks: {
                            maxTicksLimit: 8,
                            maxRotation: 0,
                            minRotation: 0,
                            callback(value) {
                                return MONTH_NAMES[parseInt(value.slice(0, 2), 10) - 1];
                            }
                        }
                    }]

                },
                tooltips: {
                    callbacks: {
                        label(tooltipItem) {
                            return `${tooltipTxt} ${tooltipItem.yLabel}`;
                        }
                    }
                }
            }
        });
    }

    renderMap() {
        const worldBounds = L.latLngBounds(WORLD_BOUNDS);
        this.map = new L.Map('map-container', {
            center: worldBounds.getCenter(),
            zoom: DEFAULT_MAP_ZOOM,
            minZoom: 2,
            maxBounds: worldBounds,
            maxBoundsViscosity: 0.75,
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '',
            noWrap: false,
        }).addTo(this.map);

        setTimeout(() => {
            this.fixMapSize();
        }, 100);
        this.createMapMarkers();
    }

    createMapMarkers() {
        const countryPointToLayer = (feature, latlng) => {
            const { properties } = feature;
            const {
                country,
                totalConfirmed,
                totalDeaths,
                totalRecovered,
            } = properties;
            const casesStr = `${totalConfirmed > 1000 ? `${`${totalConfirmed}`.slice(0, -3)}k` : totalConfirmed}`;
            const severity = getSeverityCoefficient(totalConfirmed);
            const html = `
            <span class="map__marker map__marker--${severity}" id="${country}">
                <span class="map__tooltip">
                    <h2 class="map__tooltip-title">${country}</h2>
                    <ul class="map__tooltip-list">
                        <li class="map__tooltip-list-item"><strong>Total confirmed:</strong> ${totalConfirmed}</li>
                        <li class="map__tooltip-list-item"><strong>Total deaths:</strong> ${totalDeaths}</li>
                        <li class="map__tooltip-list-item"><strong>Total recovered:</strong> ${totalRecovered}</li>
                    </ul>
                </span>
                ${casesStr}
            </span>`;
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: 'icon',
                    html,
                }),
                riseOnHover: true,
            });
        };

        const { countries } = this.state;
        const geoJson = {
            type: 'FeatureCollection',
            features: countries.map((country) => {
                const { lat, long: lng } = country;
                return {
                    type: 'Feature',
                    properties: {
                        ...country,
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [lng, lat],
                    }
                };
            })
        };
        const geoJsonLayers = new L.GeoJSON(geoJson, {
            pointToLayer: countryPointToLayer,
        });
        geoJsonLayers.addTo(this.map);
    }

    poisitionMapAndPulse(coordinates) {
        if (coordinates) {
            const [lat, lng] = coordinates;
            this.map.flyTo(new L.LatLng(lat, lng), DEFAULT_COUNTRY_ZOOM);
            this.pulseCountryMarker();
        } else {
            const center = L.latLngBounds(WORLD_BOUNDS).getCenter();
            this.map.flyTo(center, DEFAULT_MAP_ZOOM);
        }
    }

    fixMapSize() {
        this.map.invalidateSize();
    }

    pulseCountryMarker() {
        const marker = document.getElementById(`${this.state.currentCountry.country}`);
        marker.classList.add('pulse');
        setTimeout(() => marker.classList.remove('pulse'), 3000);
    }

    toggleExpandBlock(btn) {
        const parent = btn.parentNode;
        parent.classList.toggle('content__expandable--expanded');
        btn.classList.toggle('content__expand-btn--expanded');
        if (parent.classList.contains('content__center')) {
            setTimeout(() => {
                // --- need to fix map configs in fullscreen mode
                this.fixMapSize();
            }, 100);
        }
    }
}
