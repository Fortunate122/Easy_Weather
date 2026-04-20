import './styles/jass.css';
import './styles/style.css';

// * All necessary DOM elements selected
const searchForm: HTMLFormElement = document.getElementById(
  'search-form'
) as HTMLFormElement;
const searchInput: HTMLInputElement = document.getElementById(
  'search-input'
) as HTMLInputElement;
const todayContainer = document.querySelector('#today') as HTMLDivElement;
const forecastContainer = document.querySelector('#forecast') as HTMLDivElement;
const searchHistoryContainer = document.getElementById(
  'history'
) as HTMLDivElement;
const heading: HTMLHeadingElement = document.getElementById(
  'search-title'
) as HTMLHeadingElement;
const weatherIcon: HTMLImageElement = document.getElementById(
  'weather-img'
) as HTMLImageElement;
const tempEl: HTMLParagraphElement = document.getElementById(
  'temp'
) as HTMLParagraphElement;
const windEl: HTMLParagraphElement = document.getElementById(
  'wind'
) as HTMLParagraphElement;
const humidityEl: HTMLParagraphElement = document.getElementById(
  'humidity'
) as HTMLParagraphElement;

// trip planner DOM elements
const tripForm = document.getElementById('trip-form') as HTMLFormElement;
const upcomingTripsContainer = document.getElementById(
  'upcoming-trips'
) as HTMLDivElement;

//trip type
type Trip = {
  id: string;
  name: string;
  city: string;
  startDate: string;
  endDate?: string;
  notes?: string;
};

/*

API Calls

*/

const fetchWeather = async (cityName: string) => {
  const response = await fetch('/api/weather/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cityName }),
  });

  const weatherData = await response.json();

  console.log('weatherData: ', weatherData);

  renderCurrentWeather(weatherData[0]);
  renderForecast(weatherData.slice(1));
};

const fetchSearchHistory = async () => {
  const history = await fetch('/api/weather/history', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return history;
};

const deleteCityFromHistory = async (id: string) => {
  await fetch(`/api/weather/history/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/*

Render Functions

*/

const renderCurrentWeather = (currentWeather: any): void => {
  const { city, date, icon, iconDescription, tempF, windSpeed, humidity } =
    currentWeather;

  // convert the following to typescript
  heading.textContent = `${city} (${date})`;
  weatherIcon.setAttribute(
    'src',
    `https://openweathermap.org/img/w/${icon}.png`
  );
  weatherIcon.setAttribute('alt', iconDescription);
  weatherIcon.setAttribute('class', 'weather-img');
  heading.append(weatherIcon);
  tempEl.textContent = `Temp: ${tempF}°F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  if (todayContainer) {
    todayContainer.innerHTML = '';
    todayContainer.append(heading, tempEl, windEl, humidityEl);
  }
};

const renderForecast = (forecast: any): void => {
  const headingCol = document.createElement('div');
  const heading = document.createElement('h4');

  headingCol.setAttribute('class', 'col-12');
  heading.textContent = '5-Day Forecast:';
  headingCol.append(heading);

  if (forecastContainer) {
    forecastContainer.innerHTML = '';
    forecastContainer.append(headingCol);
  }

  for (let i = 0; i < forecast.length; i++) {
    renderForecastCard(forecast[i]);
  }
};

const renderForecastCard = (forecast: any) => {
  const { date, icon, iconDescription, tempF, windSpeed, humidity } = forecast;

  const { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl } =
    createForecastCard();

  // Add content to elements
  cardTitle.textContent = date;
  weatherIcon.setAttribute(
    'src',
    `https://openweathermap.org/img/w/${icon}.png`
  );
  weatherIcon.setAttribute('alt', iconDescription);
  tempEl.textContent = `Temp: ${tempF} °F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  if (forecastContainer) {
    forecastContainer.append(col);
  }
};

const renderSearchHistory = async (searchHistory: any) => {
  const historyList = await searchHistory.json();

  if (searchHistoryContainer) {
    searchHistoryContainer.innerHTML = '';

    if (!historyList.length) {
      searchHistoryContainer.innerHTML =
        '<p class="text-center">No Previous Search History</p>';
        return;
    }

    // * Start at end of history array and count down to show the most recent cities at the top.
    for (let i = historyList.length - 1; i >= 0; i--) {
      const city = historyList[i];
      const historyItem = buildHistoryListItem(city);
      searchHistoryContainer.append(historyItem);
    }
  }
};

// render saved trips
const renderTrips = (): void => {
  const trips = getTrips();

  if (!upcomingTripsContainer) return;

  if (trips.length === 0) {
    upcomingTripsContainer.innerHTML = `
      <p class="empty-trips-message">
        No trips saved yet. Search a city or add a future destination to start planning.
      </p>
    `;
    return;
  }

  trips.sort(
    (a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  upcomingTripsContainer.innerHTML = trips
    .map((trip) => {
      const today = new Date();
      const tripDate = new Date(trip.startDate);
      const diffTime = tripDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return `
        <div class="trip-card" data-trip-city="${trip.city}">
          <div class="trip-card-content">
            <h3>${trip.name || trip.city}</h3>
            <p class="trip-meta"><strong>Destination:</strong> ${trip.city}</p>
            <p class="trip-meta"><strong>Start:</strong> ${trip.startDate}</p>
            ${
              trip.endDate
                ? `<p class="trip-meta"><strong>End:</strong> ${trip.endDate}</p>`
                : ''
            }
            ${
              trip.notes
                ? `<p class="trip-meta"><strong>Notes:</strong> ${trip.notes}</p>`
                : ''
            }
            <p class="trip-countdown">
              ${
                diffDays >= 0
                  ? `${diffDays} day${diffDays === 1 ? '' : 's'} away`
                  : 'Trip passed'
              }
            </p>
          </div>

          <div class="trip-card-actions">
            <button
              type="button"
              class="btn btn-danger delete-trip-btn"
              data-trip-id="${trip.id}"
            >
              Delete
            </button>
          </div>
        </div>
      `;
    })
    .join('');
};


/*

Helper Functions

*/

const createForecastCard = () => {
  const col = document.createElement('div');
  const card = document.createElement('div');
  const cardBody = document.createElement('div');
  const cardTitle = document.createElement('h5');
  const weatherIcon = document.createElement('img');
  const tempEl = document.createElement('p');
  const windEl = document.createElement('p');
  const humidityEl = document.createElement('p');

  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  col.classList.add('col-auto');
  card.classList.add(
    'forecast-card',
    'card',
    'text-white',
    'bg-primary',
    'h-100'
  );
  cardBody.classList.add('card-body', 'p-2');
  cardTitle.classList.add('card-title');
  tempEl.classList.add('card-text');
  windEl.classList.add('card-text');
  humidityEl.classList.add('card-text');

  return {
    col,
    cardTitle,
    weatherIcon,
    tempEl,
    windEl,
    humidityEl,
  };
};

const createHistoryButton = (city: string) => {
  const btn = document.createElement('button');
  btn.setAttribute('type', 'button');
  btn.setAttribute('aria-controls', 'today forecast');
  btn.classList.add('history-btn', 'btn', 'btn-secondary', 'col-10');
  btn.textContent = city;

  return btn;
};

const createDeleteButton = (city: any) => {
  const delBtnEl = document.createElement('button');
  delBtnEl.setAttribute('type', 'button');
  delBtnEl.classList.add(
    'fas',
    'fa-trash-alt',
    'delete-city',
    'btn',
    'btn-danger',
    'col-2'
  );

  delBtnEl.setAttribute("data-city", JSON.stringify(city));
  delBtnEl.addEventListener('click', handleDeleteHistoryClick);
  return delBtnEl;
};

const createHistoryDiv = () => {
  const div = document.createElement('div');
  div.classList.add('display-flex', 'gap-2', 'col-12', 'm-1');
  return div;
};

const buildHistoryListItem = (city: { id: string; name: string}) => {
  const newBtn = createHistoryButton(city.name);
  newBtn.setAttribute("data-id", city.id);

  const deleteBtn = createDeleteButton(city);
  deleteBtn.dataset.city = JSON.stringify(city);

  const historyDiv = createHistoryDiv();
  historyDiv.append(newBtn, deleteBtn);
  return historyDiv;
};

// local storage functions for trips
const getTrips = (): Trip[] => {
  const storedTrips = localStorage.getItem('trips');
  return storedTrips ? JSON.parse(storedTrips) : [];
};

const saveTrip = (trip: Trip): void => {
  const trips = getTrips();
  trips.push(trip);
  localStorage.setItem('trips', JSON.stringify(trips));
};

const deleteTrip = (tripId: string): void => {
  const trips = getTrips().filter((trip) => trip.id !== tripId);
  localStorage.setItem('trips', JSON.stringify(trips));
};

/*

Event Handlers

*/

const handleSearchFormSubmit = (event: any): void => {
  event.preventDefault();

  if (!searchInput.value) {
    throw new Error('City cannot be blank');
  }

  const search: string = searchInput.value.trim();
  fetchWeather(search).then(() => {
    getAndRenderHistory();
  });
  searchInput.value = '';
};

const handleSearchHistoryClick = (event: any) => {
  if (event.target.matches('.history-btn')) {
    const cityName = event.target.textContent;
    fetchWeather(cityName).then(getAndRenderHistory);
  }
};

const handleDeleteHistoryClick = (event: any) => {
  event.stopPropagation();
  console.log("handleDeleteHistoryClick triggered!");

  // ✅ Extract city data
  const cityData = event.target.getAttribute("data-city");
  if (!cityData) {
    console.error("❌ No city data found");
    return;
  }

  // ✅ Parse city object
  const city = JSON.parse(cityData);
  const cityID = city.id;

  console.log(`🗑️ Attempting to delete city: ${city.name} (ID: ${cityID})`);

  // ✅ Call delete function & log result
  deleteCityFromHistory(cityID)
    .then(() => {
      console.log(`✅ Successfully deleted: ${city.name} (ID: ${cityID})`);
      getAndRenderHistory();
    })
    .catch((error) => {
      console.error(`❌ Error deleting ${city.name} (ID: ${cityID}):`, error);
    });
};

// trip form submit handler
const handleTripFormSubmit = (event: Event): void => {
  event.preventDefault();

  const tripName = (document.getElementById('trip-name') as HTMLInputElement)
  .value.trim();
  const tripCity = (document.getElementById('trip-city') as HTMLInputElement)
  .value.trim();
  const tripStartDate = (document.getElementById('trip-start-date') as HTMLInputElement)
    .value;
  const tripEndDate = (document.getElementById('trip-end-date') as HTMLInputElement)
    .value;
  const tripNotes = (document.getElementById('trip-notes') as HTMLTextAreaElement)
    .value.trim();

  if (!tripCity || !tripStartDate) {
    alert('Please provide at least a city and start date for your trip.');
    return;
  }

  const newTrip: Trip = {
    id: Date.now().toString(),
    name: tripName,
    city: tripCity,
    startDate: tripStartDate,
    endDate: tripEndDate,
    notes: tripNotes,
  };

  saveTrip(newTrip);
  renderTrips();
  tripForm.reset();
};

// click saved trip to load weather
// ===== NEW: Click saved trip to load weather =====
const handleTripCardClick = (event: MouseEvent): void => {
  const rawTarget = event.target as Node | null;
  if (!rawTarget) return;

  const element =
    rawTarget instanceof Element ? rawTarget : rawTarget.parentElement;
  if (!element) return;

  // Ignore clicks on delete button
  if (element.closest('.delete-trip-btn')) {
    return;
  }

  const tripCard = element.closest('.trip-card') as HTMLElement | null;
  if (!tripCard) return;

  const cityName = tripCard.dataset.tripCity;
  if (!cityName) return;

  console.log('Loading weather for saved trip city:', cityName);

  fetchWeather(cityName)
    .then(() => {
      getAndRenderHistory();
    })
    .catch((error) => {
      console.error('Error loading trip weather:', error);
    });
};

// ===== NEW: Delete saved trip =====
const handleDeleteTripClick = (event: MouseEvent): void => {
  const rawTarget = event.target as Node | null;
  if (!rawTarget) return;

  const element =
    rawTarget instanceof Element ? rawTarget : rawTarget.parentElement;
  if (!element) return;

  const deleteButton = element.closest('.delete-trip-btn') as HTMLElement | null;
  if (!deleteButton) return;

  event.stopPropagation();

  const tripId = deleteButton.dataset.tripId;
  if (!tripId) return;

  deleteTrip(tripId);
  renderTrips();
};


/*

Initial Render

*/

const getAndRenderHistory = () =>
  fetchSearchHistory().then(renderSearchHistory);

searchForm?.addEventListener('submit', handleSearchFormSubmit);
searchHistoryContainer?.addEventListener('click', handleSearchHistoryClick);

tripForm?.addEventListener('submit', handleTripFormSubmit);

//saved trip interactions
upcomingTripsContainer?.addEventListener('click', handleTripCardClick);
upcomingTripsContainer?.addEventListener('click', handleDeleteTripClick);

getAndRenderHistory();

renderTrips();