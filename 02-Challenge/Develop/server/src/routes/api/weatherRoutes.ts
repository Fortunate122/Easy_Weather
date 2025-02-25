import { Router, type Request, type Response } from 'express';
// import HistoryService from '../../service/historyService.js';
// import WeatherService from '../../service/weatherService.js';
import historyService from '../../service/historyService.js';
import weatherService from '../../service/weatherService.js';

const router = Router();

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  // TODO: GET weather data from city name
  const { cityName } = req.body;

  if (!cityName) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    const weatherData = await weatherService.getWeatherForCity(cityName);

    // TODO: save city to search history
    await historyService.addCity(cityName);

    return res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather:', error);
    return res.status(500).json({ error: 'Failed to retreieve weather data;' });
  }
});

// TODO: GET search history
router.get('/history', async (_req: Request, res: Response) => {
    try {
      const history = await historyService.getCities();
      res.json(history);
    } catch (error) {
      console.error('Error retrieving history:', error);
      res.status(500).json({ error: 'Failed to retrieve search history' });
    }
  });

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await historyService.removeCity(id);
    res.json({ message: 'City removed from history' });
  } catch (error) {
    console.error('Error deleting history:', error);
    res.status(500).json({ error: 'Failed to delete city from search history' });
  }
});

export default router;
