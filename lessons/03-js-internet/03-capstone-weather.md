---
title: A weather app
summary: Type a city, get the weather, using two free APIs.
mode: web
capstone: true
---
This app uses a free weather service called **Open-Meteo**. It needs no account and no key. Getting the weather takes **two** requests, one after the other:

1. **Find the city.** The geocoding API turns a name like "Monterrey" into a latitude and longitude.
2. **Get the weather** for that latitude and longitude.

Because we use `await`, the second request simply waits for the first one. It reads top to bottom like normal code.

## Building a web address with data in it

```js
const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
```

- Everything after `?` is a list of **query parameters**: `name=...` and `count=1`, joined by `&`.
- `encodeURIComponent` makes text safe to put in an address (a space becomes `%20`, for example).

## What the APIs send back

The geocoding answer has a `results` array. If the city doesn't exist, there's no `results`, so we check for that and show a friendly message.

The weather answer has a `current` object with `temperature_2m` (°C), `wind_speed_10m` (km/h) and `weather_code`, a number that says what the sky looks like. `describe()` turns the common codes into words and an emoji.

## How the code is organized

- `getCity(name)` and `getWeather(lat, lon)` each do **one** request and return the data.
- `search()` calls them in order and updates the page.
- The form's `submit` event runs `search()`.

Splitting it like this makes each part small enough to understand on its own.

# Answer

```html index.html
<!doctype html>
<html lang="en">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <main class="app">
      <h1>Weather</h1>
      <form id="form">
        <input id="city" value="Monterrey" placeholder="City name" autocomplete="off">
        <button>Search</button>
      </form>
      <p id="status"></p>
      <section id="result" hidden>
        <h2 id="place"></h2>
        <div class="big"><span id="emoji"></span> <span id="temp"></span></div>
        <p id="desc"></p>
        <p class="muted">Wind: <span id="wind"></span></p>
      </section>
    </main>
    <script src="script.js"></script>
  </body>
</html>
```

```css style.css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: linear-gradient(160deg, #74b9ff, #a29bfe);
  min-height: 100vh;
}
.app {
  max-width: 380px;
  margin: 0 auto;
  padding: 24px 16px;
  color: white;
}
form {
  display: flex;
  gap: 8px;
}
input {
  flex: 1;
  font-size: 16px;
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
}
button {
  font-size: 16px;
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  background: #2d3436;
  color: white;
  cursor: pointer;
}
#result {
  margin-top: 24px;
  background: rgba(255, 255, 255, 0.2);
  padding: 16px 20px;
  border-radius: 16px;
}
#place {
  margin: 0;
}
.big {
  font-size: 56px;
  font-weight: 700;
}
.muted {
  opacity: 0.85;
}
```

```js script.js
const form = document.querySelector('#form');
const cityInput = document.querySelector('#city');
const statusEl = document.querySelector('#status');
const result = document.querySelector('#result');

// Request 1: city name -> place with latitude and longitude
async function getCity(name) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('City search failed');
  const data = await response.json();
  if (!data.results) throw new Error(`I couldn't find "${name}"`);
  return data.results[0];
}

// Request 2: latitude and longitude -> current weather
async function getWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Weather request failed');
  const data = await response.json();
  return data.current;
}

// Weather code -> words and an emoji
function describe(code) {
  if (code === 0) return ['Clear sky', '☀️'];
  if (code <= 3) return ['Partly cloudy', '⛅'];
  if (code <= 48) return ['Foggy', '🌫️'];
  if (code <= 67) return ['Rain', '🌧️'];
  if (code <= 77) return ['Snow', '❄️'];
  if (code <= 82) return ['Showers', '🌦️'];
  return ['Thunderstorm', '⛈️'];
}

async function search() {
  statusEl.textContent = 'Loading...';
  result.hidden = true;
  try {
    const place = await getCity(cityInput.value.trim());
    const weather = await getWeather(place.latitude, place.longitude);
    const [words, emoji] = describe(weather.weather_code);

    document.querySelector('#place').textContent = `${place.name}, ${place.country}`;
    document.querySelector('#temp').textContent = Math.round(weather.temperature_2m) + '°C';
    document.querySelector('#emoji').textContent = emoji;
    document.querySelector('#desc').textContent = words;
    document.querySelector('#wind').textContent = weather.wind_speed_10m + ' km/h';

    statusEl.textContent = '';
    result.hidden = false;
  } catch (error) {
    statusEl.textContent = error.message;
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  search();
});

search();
```

# Twist

Also show the temperature in **Fahrenheit** next to Celsius. You already wrote the formula in the functions lesson: `celsius * 9 / 5 + 32`.

# Twist answer

```js script.js
const form = document.querySelector('#form');
const cityInput = document.querySelector('#city');
const statusEl = document.querySelector('#status');
const result = document.querySelector('#result');

// Request 1: city name -> place with latitude and longitude
async function getCity(name) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('City search failed');
  const data = await response.json();
  if (!data.results) throw new Error(`I couldn't find "${name}"`);
  return data.results[0];
}

// Request 2: latitude and longitude -> current weather
async function getWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Weather request failed');
  const data = await response.json();
  return data.current;
}

// Weather code -> words and an emoji
function describe(code) {
  if (code === 0) return ['Clear sky', '☀️'];
  if (code <= 3) return ['Partly cloudy', '⛅'];
  if (code <= 48) return ['Foggy', '🌫️'];
  if (code <= 67) return ['Rain', '🌧️'];
  if (code <= 77) return ['Snow', '❄️'];
  if (code <= 82) return ['Showers', '🌦️'];
  return ['Thunderstorm', '⛈️'];
}

async function search() {
  statusEl.textContent = 'Loading...';
  result.hidden = true;
  try {
    const place = await getCity(cityInput.value.trim());
    const weather = await getWeather(place.latitude, place.longitude);
    const [words, emoji] = describe(weather.weather_code);
    const celsius = Math.round(weather.temperature_2m);
    const fahrenheit = Math.round(weather.temperature_2m * 9 / 5 + 32);

    document.querySelector('#place').textContent = `${place.name}, ${place.country}`;
    document.querySelector('#temp').textContent = `${celsius}°C / ${fahrenheit}°F`;
    document.querySelector('#emoji').textContent = emoji;
    document.querySelector('#desc').textContent = words;
    document.querySelector('#wind').textContent = weather.wind_speed_10m + ' km/h';

    statusEl.textContent = '';
    result.hidden = false;
  } catch (error) {
    statusEl.textContent = error.message;
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  search();
});

search();
```
