import "./style.css";

const api = "514e1ece08bcd2e992e2242256b805de";
let city = "bangkok";

const fetchWeather = async () => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api}`,
      { mode: "cors" }
    );
    const weatherInfo = await response.json();
    console.log(weatherInfo);
  } catch (err) {
    alert("oh no!");
  }
};

fetchWeather();
