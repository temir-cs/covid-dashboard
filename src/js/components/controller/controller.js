import State from '../state/state';
import View from '../view/view';

export default class Controller {
    constructor() {
        this.state = new State();
        this.view = new View(this.state);
        this.countriesOptions = {
            'countries-cases': 'totalConfirmed',
            'countries-recovered': 'totalRecovered',
            'countries-deaths': 'totalDeaths',
        };
        this.chartOptions = {
            'chart-cases': 'dailyConfirmedIncrements',
            'chart-recovered': 'dailyRecoveredIncrements',
            'chart-deaths': 'dailyDeathsIncrements',
        };
    }

    start() {
        this.state.init()
            .then(() => {
                this.view.renderState();
                this.addListenersToCountriesList();
                this.addListenersToReturnToGlobalBtns();
                this.addListenersToExpandBtns();
                this.addListenersToCountriesOptions();
                this.addListenersToDetailsToggles();
                this.addListenersToChartOptions();
                this.addListenersToSearchBars();
                this.addListenerToMapMarkers();
            });
    }

    addListenersToCountriesList() {
        const { countries } = this.view;
        countries.forEach((country) => {
            const clickableItem = country.item;
            const countryName = country.country;
            clickableItem.addEventListener('click', () => {
                this.changeDataAccordingToCountry(countryName);
            });
        });
    }

    changeDataAccordingToCountry(countryName) {
        this.state.setCurrentCountry(countryName)
            .then(() => {
                this.view.renderChart();
                this.view.renderCountries();
                this.addListenersToCountriesList();
                this.view.renderDetails(countryName);
                this.view.updateCountryNameInDetailsAndCharts();
                const coordinates = this.state.getCountryCoordinates(countryName);
                this.view.poisitionMapAndPulse(coordinates);
                this.view.clearAllSearchSuggestions();
            });
    }

    addListenersToReturnToGlobalBtns() {
        this.view.returnToGlobalBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                this.changeDataAccordingToCountry();
                this.view.poisitionMapAndPulse();
            });
        });
    }

    addListenersToCountriesOptions() {
        const countriesOptions = document.querySelectorAll('input[name=countries-options]');
        countriesOptions.forEach((radio) => {
            radio.addEventListener('click', () => {
                const sortingCriteria = this.countriesOptions[radio.getAttribute('id')];
                this.state.countriesSort(sortingCriteria);
                this.view.renderCountries(sortingCriteria);
                this.addListenersToCountriesList();
            });
        });
    }

    addListenersToChartOptions() {
        const countriesOptions = document.querySelectorAll('input[name=chart-options]');
        countriesOptions.forEach((radio) => {
            radio.addEventListener('click', () => {
                const selectedCriteria = this.chartOptions[radio.getAttribute('id')];
                this.view.renderChart(selectedCriteria);
            });
        });
    }

    addListenersToDetailsToggles() {
        const periodToggle = document.querySelector('.toggle__btn--period');
        const numsToggle = document.querySelector('.toggle__btn--numbers');
        periodToggle.addEventListener('click', () => {
            this.view.detailsIsTotal = !this.view.detailsIsTotal;
            this.view.renderPeriodToggle(periodToggle);
            this.view.renderDetails();
        });
        numsToggle.addEventListener('click', () => {
            this.view.detailsIsAbs = !this.view.detailsIsAbs;
            this.view.renderNumbersToggle(numsToggle);
            this.view.renderDetails();
        });
    }

    addListenersToSearchBars() {
        const searchFields = document.querySelectorAll('.content__search');
        searchFields.forEach((searchField) => {
            searchField.addEventListener('input', (e) => {
                const input = e.target.value;
                const filteredCountries = this.state.getMatchingCountries(input);
                this.view.renderSearchSuggestions(searchField, filteredCountries);
                this.addListenersToSearchSuggestions();
            });
        });
    }

    addListenersToSearchSuggestions() {
        const suggestions = document.querySelectorAll('.content__search--item');
        if (suggestions.length === 0) {
            return;
        }
        suggestions.forEach((country) => {
            country.addEventListener('click', () => {
                const countryName = country.lastChild.innerText;
                this.changeDataAccordingToCountry(countryName);
            });
        });
    }

    addListenerToMapMarkers() {
        const mapMarkers = document.querySelectorAll('.map__marker');
        mapMarkers.forEach((marker) => {
            marker.addEventListener('click', () => {
                const countryName = marker.id;
                this.changeDataAccordingToCountry(countryName);
            });
        });
    }

    addListenersToExpandBtns() {
        this.view.expandBtns.forEach((btn) => btn.addEventListener('click', () => {
            this.view.toggleExpandBlock(btn);
        }));
    }
}
