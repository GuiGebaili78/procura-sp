const axios = require('axios');

// Teste das múltiplas APIs de geocoding
async function testarAPIs() {
  const endereco = "Avenida Paulista, 789, Bela Vista, São Paulo, SP, Brasil";
  
  console.log(`🔍 Testando geocoding para: ${endereco}\n`);

  // Teste 1: OpenCage (precisa de chave)
  console.log('1️⃣ Testando OpenCage...');
  try {
    const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
      params: {
        q: endereco,
        key: 'YOUR_OPENCAGE_API_KEY', // Substitua pela sua chave
        limit: 1,
        countrycode: 'br'
      },
      timeout: 10000
    });

    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      console.log(`✅ OpenCage: ${result.geometry.lat}, ${result.geometry.lng}`);
    } else {
      console.log('❌ OpenCage: Nenhum resultado');
    }
  } catch (error) {
    console.log(`❌ OpenCage: ${error.message}`);
  }

  // Teste 2: Nominatim (gratuito)
  console.log('\n2️⃣ Testando Nominatim...');
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: endereco,
        format: 'json',
        limit: 1,
        countrycodes: 'br',
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ProcuraSP/1.0; +https://github.com/procura-sp)'
      },
      timeout: 10000
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      console.log(`✅ Nominatim: ${result.lat}, ${result.lon}`);
    } else {
      console.log('❌ Nominatim: Nenhum resultado');
    }
  } catch (error) {
    console.log(`❌ Nominatim: ${error.message}`);
  }

  // Teste 3: MapBox (precisa de token)
  console.log('\n3️⃣ Testando MapBox...');
  try {
    const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(endereco)}.json`, {
      params: {
        access_token: 'YOUR_MAPBOX_TOKEN', // Substitua pelo seu token
        country: 'BR',
        limit: 1
      },
      timeout: 10000
    });

    if (response.data.features && response.data.features.length > 0) {
      const result = response.data.features[0];
      console.log(`✅ MapBox: ${result.center[1]}, ${result.center[0]}`);
    } else {
      console.log('❌ MapBox: Nenhum resultado');
    }
  } catch (error) {
    console.log(`❌ MapBox: ${error.message}`);
  }

  // Teste 4: Coordenadas aproximadas (fallback)
  console.log('\n4️⃣ Testando coordenadas aproximadas...');
  const cep = '01310100';
  const numero = '789';
  
  // Coordenadas específicas para CEPs conhecidos
  const coordenadasEspecificas = {
    '01310100': { lat: -23.5613, lng: -46.6565 }, // Av. Paulista
  };
  
  if (coordenadasEspecificas[cep]) {
    console.log(`✅ Coordenadas específicas: ${coordenadasEspecificas[cep].lat}, ${coordenadasEspecificas[cep].lng}`);
  } else {
    console.log('❌ Coordenadas específicas: CEP não encontrado');
  }
}

// Executar teste
testarAPIs().catch(console.error);


