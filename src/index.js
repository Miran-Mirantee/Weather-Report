import "./style.css";

const api = "514e1ece08bcd2e992e2242256b805de";
let city = "bangkok";
let weather;
let temperature;

async function fetchWeather(cityName) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${api}`,
      { mode: "cors" }
    );
    const weatherInfo = await response.json();
    return weatherInfo;
  } catch (err) {
    alert(err);
    return "err";
  }
}

const cityDOM = document.querySelector(".city");
const weatherDOM = document.querySelector(".main");
const tempDOM = document.querySelector(".temp");

(async () => {
  const fetchedWeather = await fetchWeather(city);
  temperature = fetchedWeather.main.temp;
  weather = fetchedWeather.weather[0].main;

  cityDOM.textContent = city;
  weatherDOM.textContent = weather;
  tempDOM.textContent = temperature - 273.15;

  console.log(fetchedWeather);
})();
