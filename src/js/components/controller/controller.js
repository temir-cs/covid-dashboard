import State from '../state/state';
import View from '../view/view';

export default class Controller {
    constructor() {
        this.state = new State();
        this.view = new View(this.state);
        this.options = {
            cases: ['totalConfirmed', 'newConfirmed', 'confirmedPer100K', 'newConfirmedPer100K'],
            recovered: ['totalRecovered', 'newRecovered', 'recoveredPer100K', 'newRecoveredPer100K'],
            deaths: ['totalDeaths', 'newDeaths', 'deathsPer100K', 'newDeathsPer100K'],
        };
        this.chartOptions = {
            cases: ['dailyConfirmedIncrements', 'dailyConfirmedPer100KIncrements'],
            recovered: ['dailyRecoveredIncrements', 'dailyRecoveredPer100KIncrements'],
            deaths: ['dailyDeathsIncrements', 'dailyDeathsPer100KIncrements'],
        };
    }

    start() {
        this.state.init()
            .then(() => {
                this.view.renderState();
                this.addListenersToCountriesList();
                this.addListenersToReturnToGlobalBtns();
                this.addListenersToExpandBtns();
                this.addListenersToDetailsToggles();
                this.addListenersToOptions();
                this.addListenersToSearchBars();
                this.addListenersToMapMarkers();
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

    updateCountriesMapMarkersChart(radio) {
        let sortingCriteria;
        let chartCriteria;
        const checkedOption = radio.getAttribute('data-label');
        const [totalAbs, newAbs, totalPer100, newPer100] = this.options[checkedOption];
        const [totalIncrements, per100KIncrements] = this.chartOptions[checkedOption];
        if (this.view.detailsIsAbs) {
            sortingCriteria = (this.view.detailsIsTotal) ? totalAbs : newAbs;
            chartCriteria = totalIncrements;
        } else {
            sortingCriteria = (this.view.detailsIsTotal) ? totalPer100 : newPer100;
            chartCriteria = per100KIncrements;
        }

        this.state.countriesSort(sortingCriteria);
        this.view.renderCountries(sortingCriteria);
        this.view.renderMapMarkers(sortingCriteria);
        this.view.renderChart(chartCriteria);
        this.addListenersToCountriesList();
    }

    addListenersToOptions() {
        this.view.options.forEach((radio) => {
            radio.addEventListener('click', () => {
                this.view.updateOptions(radio);
                this.updateCountriesMapMarkersChart(radio);
            });
        });
    }

    addListenersToDetailsToggles() {
        const periodToggle = document.querySelector('.toggle__btn--period');
        const numsToggle = document.querySelector('.toggle__btn--numbers');
        periodToggle.addEventListener('click', () => {
            this.view.detailsIsTotal = !this.view.detailsIsTotal;
            this.view.renderPeriodToggle(periodToggle);
            this.updateAfterToggling();
        });
        numsToggle.addEventListener('click', () => {
            this.view.detailsIsAbs = !this.view.detailsIsAbs;
            this.view.renderNumbersToggle(numsToggle);
            this.updateAfterToggling();
        });
    }

    updateAfterToggling() {
        this.view.renderDetails();
        const radio = document.querySelector('input[name=countries-options]:checked');
        this.updateCountriesMapMarkersChart(radio);
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

    addListenersToMapMarkers() {
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
