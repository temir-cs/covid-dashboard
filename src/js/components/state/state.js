import { GLOBAL_URL, COUNTRY_URL, GLOBAL_DAILY_URL, TOTAL_SPREAD_SPEED_LEVELS } from './consts';
import { getJSON, numbersSort, getDataRange, classifyByRange } from './utils';

export default class State {
    constructor() {
        this.lastUpdated = null;
        this.countries = [];
        this.global = {
            population: 0,
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
            dailyConfirmedPer100KIncrements: null,
            dailyDeathsPer100KIncrements: null,
            dailyRecoveredPer100KIncrements: null
        };
        this.currentCountry = null;
    }

    init() {
        return Promise.all([
            this.getGlobal(),
            this.getCountries(),
            this.getDailyForChart(GLOBAL_DAILY_URL),
        ]);
    }

    getGlobal() {
        return (getJSON.call(this, GLOBAL_URL)
            .then((result) => {
                const allData = JSON.parse(result);
                this.lastUpdated = new Date();
                this.global.population = allData.population;
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
                allData.forEach((country) => {
                    this.countries.push({
                        country: country.country || 0,
                        population: country.population || 0,
                        flagPath: country.countryInfo.flag,
                        totalConfirmed: country.cases || 0,
                        totalRecovered: country.recovered || 0,
                        totalDeaths: country.deaths || 0,
                        newConfirmed: country.todayCases || 0,
                        newRecovered: country.todayRecovered || 0,
                        newDeaths: country.todayDeaths || 0,
                        confirmedPer100K: (country.population) ? Math.round((country.cases * 100000) / country.population) : 0,
                        recoveredPer100K: (country.population) ? Math.round((country.recovered * 100000 || 0) / country.population) : 0,
                        deathsPer100K: (country.population) ? Math.round((country.deaths * 100000 || 0) / country.population) : 0,
                        newConfirmedPer100K: (country.population)
                            ? Math.round(((country.todayCases || 0) * 10000000) / country.population) / 100 : 0,
                        newRecoveredPer100K: (country.population)
                            ? Math.round(((country.todayRecovered || 0) * 10000000) / country.population) / 100 : 0,
                        newDeathsPer100K: (country.population)
                            ? Math.round(((country.todayDeaths || 0) * 10000000) / country.population) / 100 : 0,
                        // Location info
                        lat: country.countryInfo.lat || 0,
                        long: country.countryInfo.long || 0,
                    });
                });
                this.countries = this.countries.sort((a, b) => numbersSort(a.totalConfirmed, b.totalConfirmed));
            }));
    }

    getDailyForChart(url, country) {
        return (getJSON.call(this, url)
            .then((result) => {
                const dailyStats = country ? JSON.parse(result).timeline : JSON.parse(result);
                this.fillChartData(dailyStats);
            }));
    }

    fillChartData(dailyStats) {
        const dailyConfirmed = dailyStats.cases;
        const dailyDeaths = dailyStats.deaths;
        const dailyRecovered = dailyStats.recovered;
        this.createIncrementsForGraphs(dailyConfirmed, 'dailyConfirmedIncrements', 'dailyConfirmedPer100KIncrements');
        this.createIncrementsForGraphs(dailyDeaths, 'dailyDeathsIncrements', 'dailyDeathsPer100KIncrements');
        this.createIncrementsForGraphs(dailyRecovered, 'dailyRecoveredIncrements', 'dailyRecoveredPer100KIncrements');
    }

    createIncrementsForGraphs(iniObj, absKey, key100K) {
        this.currentGraph[absKey] = new Map();
        this.currentGraph[key100K] = new Map();
        const population = (this.currentCountry) ? this.currentCountry.population : this.global.population;
        let prevDateCases = 0;
        for (const [date, activeCases] of Object.entries(iniObj)) {
            const value = (activeCases - prevDateCases > 0) ? activeCases - prevDateCases : 0;
            const value100K = Math.round(((value || 0) * 10000000) / population) / 100 || 0;
            this.currentGraph[absKey].set(date, value);
            this.currentGraph[key100K].set(date, value100K);
            prevDateCases = activeCases;
        }
    }

    countriesSort(sortingCriteria) {
        this.countries = this.countries.sort((a, b) => numbersSort(a[sortingCriteria], b[sortingCriteria]));
    }

    getMatchingCountries(input) {
        return this.countries.filter((item) => item.country.toLowerCase().startsWith(input.toLowerCase()));
    }

    setCurrentCountry(countryName) {
        this.currentCountry = (countryName) ? this.findCountry(countryName) : null;
        if (this.currentCountry) {
            const countryDailyUrl = `https://disease.sh/v3/covid-19/historical/${countryName}?lastdays=all`;
            return this.getDailyForChart(countryDailyUrl, countryName);
        }
        return this.getDailyForChart(GLOBAL_DAILY_URL);
    }

    findCountry(countryName) {
        return this.countries.find((country) => country.country === countryName);
    }

    getCountryCoordinates(countryName) {
        if (!countryName) return undefined;
        const { lat, long } = this.findCountry(countryName);
        return [lat, long];
    }

    getSpreadSpeedLevel(countryName, selectedCriteria) {
        const currentCountry = this.findCountry(countryName);
        const currentValue = currentCountry[selectedCriteria];
        const allValues = this.countries.map((country) => country[selectedCriteria]);
        const dataRange = getDataRange(allValues, TOTAL_SPREAD_SPEED_LEVELS);
        const ratio = classifyByRange(currentValue, dataRange);
        return ratio;
    }
}
