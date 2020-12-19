import { REQUEST_OPTIONS, SUMMARY_URL } from './consts';
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
    }

    init() {
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

    countriesSort(sortingCriteria) {
        this.countries = this.countries.sort((a, b) => numbersSort(a[sortingCriteria], b[sortingCriteria]));
    }
}
