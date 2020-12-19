import { REQUEST_OPTIONS, SUMMARY_URL, COUNTRY_URL, FLAGS_URL } from './consts';
import { getJSON, numbersSort } from './utils';

export default class State {
    constructor() {
        this.lastUpdated = null;
        this.countries = [];
        this.global = {
            totalConfirmed: 0,
            totalRecovered: 0,
            totalDeaths: 0,
        };
        this.currentGraph = {
            dailyConfirmedIncrements: null,
            dailyDeathsIncrements: null,
            dailyRecoveredIncrements: null,
        };
        this.flagsAndPopulation = null;
    }

    init() {
        return Promise.all([
            this.getTotals(),
            this.getDaily(),
            this.getFlagsAndPopulation()
        ]);
    }

    getTotals() {
        return (getJSON.call(this, SUMMARY_URL, REQUEST_OPTIONS)
            .then((result) => {
                const allData = JSON.parse(result);
                if (!allData.Message) {
                    // console.log(allData.Message);
                    getJSON.call(this, SUMMARY_URL, REQUEST_OPTIONS);
                }

                // console.log(allData);
                // this.lastUpdated = allData.Date.slice(0, 10);
                this.lastUpdated = allData.Date;
                this.global.totalConfirmed = allData.Global.TotalConfirmed;
                this.global.totalRecovered = allData.Global.TotalRecovered;
                this.global.totalDeaths = allData.Global.TotalDeaths;
                this.global.newConfirmed = allData.Global.NewConfirmed;
                this.global.newRecovered = allData.Global.NewRecovered;
                this.global.newDeaths = allData.Global.NewDeaths;
                allData.Countries.forEach((country) => {
                    this.countries.push({
                        date: country.Date.slice(0, 10),
                        country: country.Country,
                        slug: country.Slug,
                        countryCode: country.CountryCode,
                        totalConfirmed: country.TotalConfirmed,
                        totalRecovered: country.TotalDeaths,
                        totalDeaths: country.TotalRecovered,
                        newConfirmed: country.NewConfirmed,
                        newRecovered: country.NewDeaths,
                        newDeaths: country.NewRecovered,
                    });
                });
                this.countries = this.countries.sort((a, b) => numbersSort(a.totalConfirmed, b.totalConfirmed));
                // console.log(this.global);
                // console.log(this.lastUpdated);
                // console.log(this.countries[5]);
            }));
    }

    getDaily() {
        // istead of country should be country.slug to form correct url for country
        // const country = 'kazakhstan';
        const country = 'iran';
        const url = `${COUNTRY_URL}${country}`;
        // console.log(url);

        return (getJSON.call(this, url, REQUEST_OPTIONS)
            .then((result) => {
                const dailyStats = JSON.parse(result);
                // console.log(dailyStats);
                const dailyConfirmed = new Map();
                const dailyDeath = new Map();
                const dailyRecovered = new Map();
                dailyStats.forEach((line) => {
                    dailyConfirmed.set(line.Date, line.Confirmed);
                    dailyDeath.set(line.Date, line.Deaths);
                    dailyRecovered.set(line.Date, line.Recovered);
                });
                this.createIncrementsForGraphs(dailyConfirmed, 'dailyConfirmedIncrements');
                this.createIncrementsForGraphs(dailyDeath, 'dailyDeathsIncrements');
                this.createIncrementsForGraphs(dailyRecovered, 'dailyRecoveredIncrements');
            }));
    }

    createIncrementsForGraphs(iniMap, key) {
        this.currentGraph[key] = new Map();
        let prevDateCases = 0;
        iniMap.forEach((activeCases, date) => {
            this.currentGraph[key].set(date, activeCases - prevDateCases);
            prevDateCases = activeCases;
        });
    }

    countriesSort(sortingCriteria) {
        this.countries = this.countries.sort((a, b) => numbersSort(a[sortingCriteria], b[sortingCriteria]));
    }

    getFlagsAndPopulation() {
        return (getJSON.call(this, FLAGS_URL)
            .then((result) => {
                const data = JSON.parse(result);
                this.flagsAndPopulation = data;
            }));
    }
}
