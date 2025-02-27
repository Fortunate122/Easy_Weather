// import dotenv from 'dotenv';
// import fetch from 'node-fetch';

// dotenv.config();

// const API_KEY = process.env.WEATHER_API_KEY;
// const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// // TODO: Define an interface for the Coordinates object
// interface Coordinates {
//   lat: number;
//   lon: number;
// }

// // TODO: Define a class for the Weather object
// class Weather {
//   constructor(
//     public city: string,
//     public date: string,
//     public icon: string,
//     public iconDecscription: string,
//     public tempF: number,
//     public windSpeed: number,
//     public humidity: number,
//   ) {}
// }

// // TODO: Complete the WeatherService class
// class WeatherService {
//   // TODO: Define the baseURL, API key, and city name properties
//   // TODO: Create fetchLocationData method
//   // private async fetchLocationData(query: string) {}
//   private async fetchLocationData(city: string): Promise<Coordinates> {
//     const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}`;
//     const response = await fetch(url);
//     if (!response.ok) throw new Error('Failed to fetch location data');

//   // TODO: Create destructureLocationData method
//   // private destructureLocationData(locationData: Coordinates): Coordinates {}
//   // TODO: Create buildGeocodeQuery method
//   // private buildGeocodeQuery(): string {}
//   // TODO: Create buildWeatherQuery method
//   // private buildWeatherQuery(coordinates: Coordinates): string {}
//     const data = await response.json() as { coord: { lat: number, lon: number } };
//     return { lat: data.coord.lat, lon: data.coord.lon };
//   }

//   // TODO: Create fetchAndDestructureLocationData method
//   // private async fetchAndDestructureLocationData() {}
//   // TODO: Create fetchWeatherData method
//   // private async fetchWeatherData(coordinates: Coordinates) {}
// private async fetchWeatherData(coordinates: Coordinates) {
//   const url = `${BASE_URL}/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&exlude=minutely,hourly,alerts&units=imperial&appid=${API_KEY}`;
//   const response = await fetch(url);
//   if (!response.ok) throw new Error('Failed to fetch weather data');

//   return await response.json();
// }

//   // TODO: Build parseCurrentWeather method
//   // private parseCurrentWeather(response: any) {}
// private parseCurrentWeather(data: any, city: string): Weather {
//   return new Weather(
//     city,
//     new Date(data.current.dt * 1000).toLocaleDateString(),
//     data.current.weather[0].icon,
//     data.current.weather[0].description,
//     data.current.temp,
//     data.current.wind_speed,
//     data.current.humidity,
//   );
// }

//   // TODO: Complete buildForecastArray method
//   // private buildForecastArray(currentWeather: Weather, weatherData: any[]) {}
// private buildForecastArray(data:any): Weather[] {
//   return data.daily.slice(1, 6).map((day: any) => new Weather(
//     '',
//     new Date(day.dt * 1000).toLocaleDateString(),
//     day.weather[0].icon,
//     day.weather[0].description,
//     day.temp.day,
//     day.wind_speed,
//     day.humidity,
//   ));
// }

//   // TODO: Complete getWeatherForCity method
//   // async getWeatherForCity(city: string) {}
//   async getWeatherForCity(city: string): Promise<Weather[]> {
//     const coordinates = await this.fetchLocationData(city);
//     const weatherData = await this.fetchWeatherData(coordinates);

//     const currentWeather = this.parseCurrentWeather(weatherData, city);
//     const forecast = this.buildForecastArray(weatherData);

//     return [currentWeather, ...forecast];
//   }
// }

// export default new WeatherService();

import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const API_KEY = process.env.API_KEY; // Ensure this matches .env variable
const GEO_API_URL = 'https://api.openweathermap.org/geo/1.0/direct';

// ✅ Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// ✅ Define a class for the Weather object
class Weather {
  constructor(
    public city: string,
    public date: string,
    public icon: string,
    public iconDescription: string,
    public tempF: number,
    public windSpeed: number,
    public humidity: number,
  ) {}
}

class WeatherService {
  // ✅ Correct fetchLocationData method (Fixed API endpoint)
  private async fetchLocationData(city: string): Promise<Coordinates> {
    const url = `${GEO_API_URL}?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;

    console.log(`🌍 Fetching city location from: ${url}`); // Debugging log

    const response = await fetch(url);
    if (!response.ok) throw new Error(`❌ Failed to fetch location data: ${response.statusText}`);

    const data = await response.json() as { lat: number, lon: number }[];
    if (data.length === 0) throw new Error(`❌ City not found: ${city}`);

    console.log("✅ Location data:", data);
    return { lat: data[0].lat, lon: data[0].lon };
  }

  // ✅ Correct fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${API_KEY}`;
  
    console.log(`🌍 Fetching 5-day forecast data from: ${url}`);
  
    const response = await fetch(url);
    if (!response.ok) throw new Error(`❌ Failed to fetch forecast data: ${response.statusText}`);
  
    const data = await response.json();
    console.log("✅ Forecast data received:", data);
    return data;
  }
  

  // ✅ Parse current weather from API response
  private parseCurrentWeather(data: any, city: string): Weather {
    console.log("📌 Extracting current weather from /forecast API...");
  
    if (!data.list || data.list.length === 0) {
      throw new Error("❌ No forecast data available in API response.");
    }
  
    // Use the first available forecast entry
    const currentWeather = data.list[0];
  
    return new Weather(
      city,
      new Date(currentWeather.dt * 1000).toLocaleDateString(),
      currentWeather.weather?.[0]?.icon || "unknown", // ✅ Prevents undefined errors
      currentWeather.weather?.[0]?.description || "No description",
      currentWeather.main?.temp || 0, // ✅ Handles missing values
      currentWeather.wind?.speed || 0,
      currentWeather.main?.humidity || 0
    );
  }
  
  

  // ✅ Build 5-day forecast array
  private buildForecastArray(data: any): Weather[] {
    console.log("📊 Filtering 5-day forecast from /forecast API...");
  
    // OpenWeather /forecast API returns data every 3 hours (40 entries)
    // We extract 1 forecast per day (roughly every 8th entry)
    const dailyForecasts: any[] = [];
  
    const datesProcessed = new Set(); // Track unique days
  
    for (const forecast of data.list) {
      const date = new Date(forecast.dt * 1000).toLocaleDateString();
  
      // Ensure we pick only 1 forecast per day
      if (!datesProcessed.has(date)) {
        dailyForecasts.push(forecast);
        datesProcessed.add(date);
      }
  
      // Stop when we have 5 days of forecasts
      if (dailyForecasts.length === 5) break;
    }
  
    console.log("✅ Extracted 5-day forecast:", dailyForecasts);
  
    return dailyForecasts.map((day: any) => new Weather(
      '',
      new Date(day.dt * 1000).toLocaleDateString(),
      day.weather[0].icon,
      day.weather[0].description,
      day.main.temp,
      day.wind.speed,
      day.main.humidity,
    ));
  }
  

  // ✅ Complete getWeatherForCity method
  async getWeatherForCity(city: string): Promise<Weather[]> {
    const coordinates = await this.fetchLocationData(city);
    const weatherData = await this.fetchWeatherData(coordinates);

    const currentWeather = this.parseCurrentWeather(weatherData, city);
    const forecast = this.buildForecastArray(weatherData);

    return [currentWeather, ...forecast];
  }
}

export default new WeatherService();
