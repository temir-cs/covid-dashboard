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
    }

    start() {
        this.state.init()
            .then(() => {
                this.view.renderState();
                this.addListenersToCountriesOptions();
                this.addListenersToDetailsToggles();
            });
    }

    addListenersToCountriesOptions() {
        const countriesOptions = document.querySelectorAll('input[name=countries-options]');
        countriesOptions.forEach((radio) => {
            radio.addEventListener('click', () => {
                const sortingCriteria = this.countriesOptions[radio.getAttribute('id')];
                this.state.countriesSort(sortingCriteria);
                this.view.renderCountries(sortingCriteria);
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
        console.log(this.state.lastUpdated);
    }
}
