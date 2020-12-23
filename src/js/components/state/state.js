import { GLOBAL_URL, COUNTRY_URL, GLOBAL_DAILY_URL } from './consts';
import { getJSON, numbersSort } from './utils';

export default class State {
    constructor() {
        this.lastUpdated = null;
        this.countries = [];
        this.global = {
            totalConfirmed: 0,
            totalRecovered: 0,
            totalDeaths: 0,
            newConfirmed: 0,
            newRecovered: 0,
            newDeaths: 0,
            confirmedPer100K: 0,
            recoveredPer100K: 0,
            deathsPer100K: 0,
            newConfirmedPer100K: 0,
            newRecoveredPer100K: 0,
            newDeathsPer100K: 0,
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
            this.getGlobal(),
            this.getCountries(),
            this.getGlobalDaily(),
        ]);
    }

    getGlobal() {
        return (getJSON.call(this, GLOBAL_URL)
            .then((result) => {
                const allData = JSON.parse(result);
                // console.log(allData);
                this.lastUpdated = new Date();
                this.global.totalConfirmed = allData.cases;
                this.global.totalRecovered = allData.recovered;
                this.global.totalDeaths = allData.deaths;
                this.global.newConfirmed = allData.todayCases;
                this.global.newRecovered = allData.todayDeaths;
                this.global.newDeaths = allData.todayRecovered;
                this.global.confirmedPer100K = Math.round((this.global.totalConfirmed * 100000) / allData.population);
                this.global.recoveredPer100K = Math.round((this.global.totalRecovered * 100000) / allData.population);
                this.global.deathsPer100K = Math.round((this.global.totalDeaths * 100000) / allData.population);
                this.global.newConfirmedPer100K = Math.round((this.global.newConfirmed * 10000000) / allData.population) / 100;
                this.global.newRecoveredPer100K = Math.round((this.global.newRecovered * 10000000) / allData.population) / 100;
                this.global.newDeathsPer100K = Math.round((this.global.newDeaths * 10000000) / allData.population) / 100;
            }));
    }

    getCountries() {
        return (getJSON.call(this, COUNTRY_URL)
            .then((result) => {
                const allData = JSON.parse(result);
                console.log(allData);
                allData.forEach((country) => {
                    this.countries.push({
                        country: country.country || 0,
                        flagPath: country.countryInfo.flag,
                        totalConfirmed: country.cases || 0,
                        totalRecovered: country.recovered || 0,
                        totalDeaths: country.deaths || 0,
                        newConfirmed: country.todayCases || 0,
                        newRecovered: country.todayRecovered || 0,
                        newDeaths: country.todayDeaths || 0,
                        confirmedPer100K: Math.round((country.cases * 100000) / country.population),
                        recoveredPer100K: Math.round((country.recovered * 100000) / country.population),
                        deathsPer100K: Math.round((country.deaths * 100000) / country.population),
                        newConfirmedPer100K: Math.round(((country.todayCases || 0) * 10000000) / country.population) / 100,
                        newRecoveredPer100K: Math.round(((country.todayRecovered || 0) * 10000000) / country.population) / 100,
                        newDeathsPer100K: Math.round(((country.todayDeaths || 0) * 10000000) / country.population) / 100,
                        // Location info
                        lat: country.countryInfo.lat || 0,
                        long: country.countryInfo.long || 0,
                    });
                });
                this.countries = this.countries.sort((a, b) => numbersSort(a.totalConfirmed, b.totalConfirmed));
            }));
    }

    getGlobalDaily() {
        return (getJSON.call(this, GLOBAL_DAILY_URL)
            .then((result) => {
                const dailyStats = JSON.parse(result);
                // console.log(dailyStats);
                const dailyConfirmed = dailyStats.cases;
                const dailyDeaths = dailyStats.deaths;
                const dailyRecovered = dailyStats.recovered;
                this.createIncrementsForGraphs(dailyConfirmed, 'dailyConfirmedIncrements');
                this.createIncrementsForGraphs(dailyDeaths, 'dailyDeathsIncrements');
                this.createIncrementsForGraphs(dailyRecovered, 'dailyRecoveredIncrements');
                // console.log(this.currentGraph);
            }));
    }

    createIncrementsForGraphs(iniObj, key) {
        this.currentGraph[key] = new Map();
        let prevDateCases = 0;
        for (const [date, activeCases] of Object.entries(iniObj)) {
            const value = (activeCases - prevDateCases > 0) ? activeCases - prevDateCases : 0;
            this.currentGraph[key].set(date, value);
            prevDateCases = activeCases;
        }
    }

    countriesSort(sortingCriteria) {
        this.countries = this.countries.sort((a, b) => numbersSort(a[sortingCriteria], b[sortingCriteria]));
    }

    getMatchingCountries(input) {
        return this.countries.filter((item) => item.country.toLowerCase().startsWith(input.toLowerCase()));
    }
}
