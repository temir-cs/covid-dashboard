/* eslint-disable max-len */
import Controller from './components/controller/controller';

const controller = new Controller();
controller.start();

// const searchField = document.querySelector('.content__search--countries');

// searchField.addEventListener('input', (e) => {
//     const input = e.target.value;
//     const filteredCountries = controller.state.getMatchingCountries(input);
//     controller.view.renderSearchSuggestions(filteredCountries);
// });
