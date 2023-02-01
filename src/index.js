import "./style.css";

const api = "514e1ece08bcd2e992e2242256b805de";
let city = "bangkok";

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
    return "error";
  }
}

const cityDOM = document.querySelector(".city");
const weatherDOM = document.querySelector(".main");
const tempDOM = document.querySelector(".temp");
const realFeelDom = document.querySelector(".real-feel");
const humidityDOM = document.querySelector(".humidity");
const pressureDOM = document.querySelector(".pressure");
const windSpeedDOM = document.querySelector(".wind-speed");
const cityInput = document.getElementById("search-city");
const form = document.querySelector("form");

const updateWeather = async () => {
  try {
    const weatherInfo = await fetchWeather(city);
    const { name } = weatherInfo;
    const weather = weatherInfo.weather[0].main;
    const temperature = weatherInfo.main.temp;
    const realFeel = weatherInfo.main.feels_like;
    const { humidity } = weatherInfo.main;
    const { pressure } = weatherInfo.main;
    const windSpeed = weatherInfo.wind.speed;

    cityDOM.textContent = name;
    weatherDOM.textContent = weather;
    tempDOM.textContent = temperature - 273.15;
    realFeelDom.textContent = realFeel;
    humidityDOM.textContent = humidity;
    pressureDOM.textContent = pressure;
    windSpeedDOM.textContent = windSpeed;

    console.log(weatherInfo);
  } catch (err) {
    alert(err);
  }
};
updateWeather();

form.addEventListener("submit", () => {
  city = cityInput.value;
  updateWeather();
});
