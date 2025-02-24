import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// TODO: Define a class for the Weather object
class Weather {
  constructor(
    public city: string,
    public date: string,
    public icon: string,
    public iconDecscription: string,
    public tempF: number,
    public windSpeed: number,
    public humidity: number,
  ) {}
}

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  // TODO: Create fetchLocationData method
  // private async fetchLocationData(query: string) {}
  private async fetchLocationData(city: string): Promise<Coordinates> {
    const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch location data');

  // TODO: Create destructureLocationData method
  // private destructureLocationData(locationData: Coordinates): Coordinates {}
  // TODO: Create buildGeocodeQuery method
  // private buildGeocodeQuery(): string {}
  // TODO: Create buildWeatherQuery method
  // private buildWeatherQuery(coordinates: Coordinates): string {}
    const data = await response.json() as { coord: { lat: number, lon: number } };
    return { lat: data.coord.lat, lon: data.coord.lon };
  }

  // TODO: Create fetchAndDestructureLocationData method
  // private async fetchAndDestructureLocationData() {}
  // TODO: Create fetchWeatherData method
  // private async fetchWeatherData(coordinates: Coordinates) {}
private async fetchWeatherData(coordinates: Coordinates) {
  const url = `${BASE_URL}/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&exlude=minutely,hourly,alerts&units=imperial&appid=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch weather data');

  return await response.json();
}

  // TODO: Build parseCurrentWeather method
  // private parseCurrentWeather(response: any) {}
private parseCurrentWeather(data: any, city: string): Weather {
  return new Weather(
    city,
    new Date(data.current.dt * 1000).toLocaleDateString(),
    data.current.weather[0].icon,
    data.current.weather[0].description,
    data.current.temp,
    data.current.wind_speed,
    data.current.humidity,
  );
}

  // TODO: Complete buildForecastArray method
  // private buildForecastArray(currentWeather: Weather, weatherData: any[]) {}
private buildForecastArray(data:any): Weather[] {
  return data.daily.slice(1, 6).map((day: any) => new Weather(
    '',
    new Date(day.dt * 1000).toLocaleDateString(),
    day.weather[0].icon,
    day.weather[0].description,
    day.temp.day,
    day.wind_speed,
    day.humidity,
  ));
}

  // TODO: Complete getWeatherForCity method
  // async getWeatherForCity(city: string) {}
  async getWeatherForCity(city: string): Promise<Weather[]> {
    const coordinates = await this.fetchLocationData(city);
    const weatherData = await this.fetchWeatherData(coordinates);

    const currentWeather = this.parseCurrentWeather(weatherData, city);
    const forecast = this.buildForecastArray(weatherData);

    return [currentWeather, ...forecast];
  }
}

export default new WeatherService();
