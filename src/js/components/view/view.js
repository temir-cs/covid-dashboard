export default class View {
    constructor(state) {
        this.state = state;
        this.countryMarker = 'totalConfirmed';
    }

    renderState() {
        this.renderDate();
        this.renderGlobalCases();
        this.renderCountries();
        this.renderDetails();
    }

    renderDate() {
        const lastUpdated = document.querySelector('.content__accent--date');
        lastUpdated.innerText = this.state.lastUpdated.slice(0, 10);
        // console.log(this.state.lastUpdated);
    }

    renderGlobalCases() {
        const globalCases = document.querySelector('.content__accent--total');
        globalCases.innerText = this.state.global.totalConfirmed.toLocaleString('de-DE');
        // console.log(this.state.global.totalConfirmed.toLocaleString());
    }

    renderCountries(sortingCriteria) {
        const countriesContainer = document.querySelector('.countries');
        countriesContainer.innerHTML = '';
        this.countryMarker = sortingCriteria || this.countryMarker;
        this.state.countries.forEach((country) => {
            const countryItem = this.renderLineInCountryList(country);
            countriesContainer.appendChild(countryItem);
        });
        // console.log('left column bottom block');
        // console.log(this.state.countries);
    }

    renderLineInCountryList(country) {
        // console.log(this.countryMarker);
        const listItem = document.createElement('li');
        listItem.classList.add('countries__item');
        listItem.innerHTML = `<span class="countries__number">
                    ${country[this.countryMarker].toLocaleString('de-DE')}
                </span>
                <span class="countries__name">${country.country}</span>
                <div class="countries__flag"></div>`;
        return listItem;
    }

    renderDetails() {
        console.log('right column top block');
        console.log(this.state.global.totalConfirmed);
        console.log(this.state.global.totalDeaths);
        console.log(this.state.global.totalRecovered);
    }
}
