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
        // this.state.getTotals()
        this.state.init()
            .then(() => {
                // this.state.getDaily();
                this.view.renderState();
                this.addListenersToCountriesOptions();
                this.addListenersToDetailsToggles();
                this.addListenersToChartOptions();
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

    addListenersToChartOptions() {
        const countriesOptions = document.querySelectorAll('input[name=chart-options]');
        countriesOptions.forEach((radio) => {
            radio.addEventListener('click', () => {
                const selectedCriteria = this.chartOptions[radio.getAttribute('id')];
                console.log('click');
                this.view.renderGraphs(selectedCriteria);
                // this.view.renderGraphs(selectedCriteria);
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
        // console.log(this.state.lastUpdated);
    }
}
