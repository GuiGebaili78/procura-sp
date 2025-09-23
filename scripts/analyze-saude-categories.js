const fs = require('fs');
const path = require('path');

// Ler o arquivo JSON
const jsonPath = path.join(__dirname, '..', 'public', 'dados', 'estabelecimentos-saude.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log('🏥 Análise das Categorias de Saúde');
console.log('=====================================');

// Extrair categorias únicas
const categorias = [...new Set(data.map(item => item.categoria))].sort();

console.log(`\n📊 Total de categorias: ${categorias.length}`);
console.log('\n📋 Lista de categorias:');
categorias.forEach((cat, i) => {
  console.log(`${i + 1}. ${cat}`);
});

// Analisar quantos estabelecimentos por categoria
console.log('\n📈 Estabelecimentos por categoria:');
const contagem = {};
data.forEach(item => {
  contagem[item.categoria] = (contagem[item.categoria] || 0) + 1;
});

Object.entries(contagem)
  .sort(([,a], [,b]) => b - a)
  .forEach(([categoria, count]) => {
    console.log(`  ${categoria}: ${count} estabelecimentos`);
  });

// Verificar se há estabelecimentos com mesmo lat/lng mas categorias diferentes
console.log('\n🔍 Análise de coordenadas duplicadas:');
const coordenadas = {};
data.forEach(item => {
  if (item.latitude && item.longitude) {
    const key = `${item.latitude},${item.longitude}`;
    if (!coordenadas[key]) {
      coordenadas[key] = [];
    }
    coordenadas[key].push({
      nome: item.nome,
      categoria: item.categoria,
      endereco: item.endereco
    });
  }
});

const duplicados = Object.entries(coordenadas).filter(([, estabelecimentos]) => estabelecimentos.length > 1);
console.log(`\n📍 Coordenadas com múltiplos estabelecimentos: ${duplicados.length}`);

if (duplicados.length > 0) {
  console.log('\nExemplos de coordenadas com múltiplas categorias:');
  duplicados.slice(0, 5).forEach(([coord, estabelecimentos]) => {
    console.log(`\n  📍 ${coord}:`);
    estabelecimentos.forEach(est => {
      console.log(`    - ${est.nome} (${est.categoria})`);
    });
  });
}
