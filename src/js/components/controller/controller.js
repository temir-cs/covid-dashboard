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
        // console.log(countriesOptions);
        console.log(this.state.lastUpdated);
    }
}
