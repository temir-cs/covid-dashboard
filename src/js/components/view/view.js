import Chart from 'chart.js';
import MONTH_NAMES from './consts';

export default class View {
    constructor(state) {
        this.state = state;
        this.countryMarker = 'totalConfirmed';
        this.detailsIsTotal = true;
        this.detailsIsAbs = true;
        this.chartContainer = document.querySelector('.chart-container');
        this.chart = null;
    }

    renderState() {
        this.renderDate();
        this.renderGlobalCases();
        this.renderCountries();
        this.renderDetails();
        this.renderGraphs();
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
        const cases = (this.detailsIsTotal) ? 'totalConfirmed' : 'newConfirmed';
        const deaths = (this.detailsIsTotal) ? 'totalDeaths' : 'newDeaths';
        const recovered = (this.detailsIsTotal) ? 'totalRecovered' : 'newRecovered';

        const detailsCases = document.querySelector('.stats__number--cases');
        const detailsDeaths = document.querySelector('.stats__number--deaths');
        const detailsRecovered = document.querySelector('.stats__number--recovered');
        detailsCases.innerText = this.state.global[cases].toLocaleString('de-DE');
        detailsDeaths.innerText = this.state.global[deaths].toLocaleString('de-DE');
        detailsRecovered.innerText = this.state.global[recovered].toLocaleString('de-DE');
    }

    renderPeriodToggle(periodToggle) {
        const toggle = periodToggle;
        toggle.classList.toggle('toggle__btn--toggled');
        const toggleText = document.querySelector('.toggle__txt--period');
        toggleText.innerText = (this.detailsIsTotal) ? 'Total period' : 'Last updated date';
    }

    renderNumbersToggle(numsToggle) {
        const toggle = numsToggle;
        toggle.classList.toggle('toggle__btn--toggled');
        const toggleText = document.querySelector('.toggle__txt--numbers');
        toggleText.innerText = (this.detailsIsAbs) ? 'Absolute numbers' : 'Incidence Rate';
    }

    renderGraphs(selectedCriteria) {
        const key = selectedCriteria || 'dailyConfirmedIncrements';
        // console.log(this.state.currentGraph);
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
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        },
                    }],
                    xAxes: [{
                        gridLines: {
                            display: false,
                            offsetGridLines: false
                        },
                        ticks: {
                            maxTicksLimit: 5,
                            maxRotation: 0,
                            minRotation: 0,
                            callback(value) {
                                return MONTH_NAMES[parseInt(value.slice(5, 7), 10) - 1];
                            }
                        }
                    }]

                }
            }
        });
        // console.log(myChart);
    }
}
