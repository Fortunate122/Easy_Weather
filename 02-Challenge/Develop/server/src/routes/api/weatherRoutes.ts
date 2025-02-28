import { Router, type Request, type Response } from 'express';
import historyService from '../../service/historyService.js';
import weatherService from '../../service/weatherService.js';

const router = Router();

// ✅ POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  try {
    const { cityName } = req.body;
    if (!cityName) {
      return res.status(400).json({ error: "City name is required" });
    }

    console.log(`📍 Received request for city: ${cityName}`);

    const weatherData = await weatherService.getWeatherForCity(cityName);

    // ✅ Save city to search history
    await historyService.addCity(cityName);

    return res.json(weatherData);
  } catch (error) {
    console.error("❌ Error in weatherRoutes:", error);
    return res.status(500).json({ error: "Failed to retrieve weather data" });
  }
});

// ✅ GET search history
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const history = await historyService.getCities();

    const formattedHistory = history.map(city => ({ id: city.id, name: city.name}));

    res.json(formattedHistory);
  } catch (error) {
    console.error('❌ Error retrieving history:', error);
    res.status(500).json({ error: 'Failed to retrieve search history' });
  }
});

// ✅ BONUS: DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await historyService.removeCity(id);
    return res.json({ message: '✅ City removed from history' });
  } catch (error) {
    console.error('❌ Error deleting history:', error);
    return res.status(500).json({ error: 'Failed to delete city from search history' });
  }
});

export default router;
