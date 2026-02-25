const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Endpoint para obtener datos de la API de OSRS Wiki
app.get('/api/osrs/:endpoint', async (req, res) => {
  try {
    const { endpoint } = req.params;
    const url = `https://prices.runescape.wiki/api/v1/osrs/${endpoint}`;
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'OSRS-Tracker-Proxy/1.0'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ 
      error: 'Error al obtener datos de la API',
      message: error.message 
    });
  }
});

// Endpoint para búsqueda de items
app.get('/api/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    
    // Obtener mapping de items
    const mapResponse = await axios.get('https://prices.runescape.wiki/api/v1/osrs/mapping', {
      timeout: 10000
    });
    
    // Obtener precios
    const pricesResponse = await axios.get('https://prices.runescape.wiki/api/v1/osrs/latest', {
      timeout: 10000
    });
    
    const mapData = mapResponse.data;
    const pricesData = pricesResponse.data.data;
    
    // Filtrar items tradeables que coincidan con la búsqueda
    const filtered = mapData
      .filter(item => 
        item.tradeable && 
        item.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 15)
      .map(item => ({
        ...item,
        price: pricesData[item.id] || { high: 0, low: 0 }
      }));
    
    res.json(filtered);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ 
      error: 'Error en la búsqueda',
      message: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
