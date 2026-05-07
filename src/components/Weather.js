import React, { useState } from "react";
import { Country, City } from "country-state-city";
import DisplayWeather from "./DisplayWeather";
import "./weather.css";

const APIKEY = process.env.REACT_APP_WEATHER_API_KEY;
const allCountries = Country.getAllCountries();

function Weather() {
  const [weather, setWeather] = useState([]);
  const [countryCode, setCountryCode] = useState("");
  const [city, setCity] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [showCityDrop, setShowCityDrop] = useState(false);
  const [showCountryDrop, setShowCountryDrop] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredCountries = allCountries.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const allCities = countryCode ? City.getCitiesOfCountry(countryCode) || [] : [];
  const filteredCities = allCities.filter((c) =>
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  async function weatherData(e) {
    e.preventDefault();
    if (!city) return setError("Please select a city.");
    if (!countryCode) return setError("Please select a country.");
    if (!APIKEY) return setError("API key is missing. Set REACT_APP_WEATHER_API_KEY in your .env file.");

    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city},${countryCode}&APPID=${APIKEY}`
      );

      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid API key. Please check your configuration.");
        if (res.status === 404) throw new Error(`"${city}" not found. Try a different city name.`);
        if (res.status === 429) throw new Error("Too many requests. Please wait a moment and try again.");
        throw new Error(`Unexpected error (${res.status}). Please try again.`);
      }

      const data = await res.json();
      setWeather({ data });
    } catch (err) {
      if (err.message === "Failed to fetch") {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(err.message);
      }
      setWeather([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="weather">
      <span className="title">Weather App</span>
      <br />
      <form>
        {/* Country input with dropdown */}
        <div className="dropdown-wrapper">
          <input
            type="text"
            placeholder="Country"
            value={countrySearch}
            onChange={(e) => { setCountrySearch(e.target.value); setShowCountryDrop(true); setError(""); }}
            onFocus={() => setShowCountryDrop(true)}
            onBlur={() => setTimeout(() => setShowCountryDrop(false), 200)}
          />
          {showCountryDrop && filteredCountries.length > 0 && (
            <ul className="dropdown-list">
              {filteredCountries.map((c) => (
                <li
                  key={c.isoCode}
                  className="dropdown-item"
                  onMouseDown={() => {
                    setCountryCode(c.isoCode);
                    setCountrySearch(c.name);
                    setCity("");
                    setCitySearch("");
                    setShowCountryDrop(false);
                    setError("");
                  }}
                >
                  {c.name}
                </li>
              ))}
            </ul>
          )}
          {showCountryDrop && countrySearch && filteredCountries.length === 0 && (
            <ul className="dropdown-list">
              <li className="dropdown-item" style={{ color: "gray" }}>No countries found</li>
            </ul>
          )}
        </div>
        &nbsp;&nbsp;&nbsp;&nbsp;
        {/* City input with dropdown */}
        <div className="dropdown-wrapper">
          <input
            type="text"
            placeholder={countryCode ? "City" : "Select country first"}
            value={citySearch}
            onChange={(e) => { setCitySearch(e.target.value); setShowCityDrop(true); setError(""); }}
            onFocus={() => setShowCityDrop(true)}
            onBlur={() => setTimeout(() => setShowCityDrop(false), 200)}
            disabled={!countryCode}
          />
          {showCityDrop && filteredCities.length > 0 && (
            <ul className="dropdown-list">
              {filteredCities.map((c, i) => (
                <li
                  key={i}
                  className="dropdown-item"
                  onMouseDown={() => {
                    setCity(c.name);
                    setCitySearch(c.name);
                    setShowCityDrop(false);
                    setError("");
                  }}
                >
                  {c.name}
                </li>
              ))}
            </ul>
          )}
          {showCityDrop && citySearch && filteredCities.length === 0 && (
            <ul className="dropdown-list">
              <li className="dropdown-item" style={{ color: "gray" }}>No cities found</li>
            </ul>
          )}
        </div>
        <button className="getweather" onClick={weatherData} disabled={loading}>
          {loading ? "Loading..." : "Submit"}
        </button>
      </form>

      {error && <p className="error-msg">{error}</p>}

      {weather.data !== undefined ? (
        <div>
          <DisplayWeather data={weather.data} />
        </div>
      ) : null}
    </div>
  );
}

export default Weather;
