import './css/styles.css';
import Notiflix from 'notiflix';
import debounce from 'lodash.debounce';

const DEBOUNCE_DELAY = 300;

const refs = {
  inputField: document.querySelector('#search-box'),
  countryList: document.querySelector('.country-list'),
  countryInfo: document.querySelector('.country-info'),
};

refs.inputField.addEventListener('input', debounce(handleInput, DEBOUNCE_DELAY));
// refs.inputField.addEventListener('search', debounce(resetRender, DEBOUNCE_DELAY));

const url = 'https://restcountries.com/v3.1/name/';
let jsonContent;

function handleInput(e) {
  e.preventDefault();

  if (e.target.value !== '') {
    resetRender();
    const inputValue = refs.inputField.value.trim();
    // console.log('inut: ' + inputValue + '.');
    if (inputValue !== '') {
      fetchCountries(inputValue)
        .then(() => {
          const length = Object.keys(jsonContent).length;
          console.log(jsonContent);
          console.log(jsonContent[0]['capital']);
          console.log(length);

          if (length > 10) {
            Notiflix.Notify.info('Too many matches found.Please enter a more specific name.');
          } else if (2 <= length && length <= 10) {
            addListOfCountriesToMarkup(jsonContent);
          } else if (length === 1) {
            addOneCountryToMarkup(jsonContent);
          }
        })
        .catch(() => {
          Notiflix.Notify.failure('Oops, there is no country with that name.');
        });
    }
  } else {
    e.target.value = '';
    resetRender();

  }
}

function resetRender() {
  refs.countryList.innerHTML = '';
  refs.countryInfo.innerHTML = '';
}

function fetchCountries(inputValue) {
  const currentUrl = `${url}${inputValue}?fields=name,capital,population,flags,languages`;
  return fetch(currentUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.status);
      } else {
        return response.json();
      }
    })
    .then(data => {
      //   console.log(data);
      jsonContent = data;
    });
}

function addOneCountryToMarkup(jsonData) {
  const { name, capital, population, flags, languages } = jsonData[0];
  return refs.countryInfo.insertAdjacentHTML(
    'beforeend',
    `<div>
        <img src="${flags.svg}" alt="flag", width="100" height="100"/>
        <h1>${name.official}</h1>
      </div>
      <ul>
        <li>
          <h2>Capital: ${capital}</h2>
        </li>
        <li>
          <h2>Population: ${population}</h2>
        </li>
        <li>
          <h2>Languages: ${Object.values(languages).join(', ')}</h2>
        </li>
      </ul>
    `,

  );
}

function addListOfCountriesToMarkup(jsonDataOne) {
  const markup = jsonDataOne
    .map(item => {
      return `
      <li>
        <img class="flag-list" src="${item.flags.svg}" alt="flag", width="15" height="15" /> ${item.name.official}
      </li>`;
    })
    .join('');

  refs.countryList.insertAdjacentHTML('beforeend', markup);
}
