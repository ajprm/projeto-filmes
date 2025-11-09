const axios = require('axios');

// !! IMPORTANTE !!
// Você DEVE definir a variável de ambiente 'API_ENDPOINT' 
// no seu Lambda com a URL do API Gateway (vamos criar na Fase 3)
const API_ENDPOINT = process.env.API_ENDPOINT;

exports.handler = async (event) => {
  if (!API_ENDPOINT) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API_ENDPOINT não está configurado nas variáveis de ambiente do Lambda.' }),
    };
  }

  try {
    // 1. Chamar a API (via API Gateway) para pegar todos os filmes
    const response = await axios.get(`${API_ENDPOINT}/filmes`);
    const filmes = response.data;

    if (!Array.isArray(filmes)) {
       return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Resposta da API não foi um array.' }),
      };
    }

    // 2. Calcular estatísticas
    const totalFilmes = filmes.length;

    const filmesPorGenero = filmes.reduce((acc, filme) => {
      const genero = filme.genero || 'Sem Gênero';
      acc[genero] = (acc[genero] || 0) + 1;
      return acc;
    }, {});

    // 3. Montar o relatório
    const relatorio = {
      totalFilmes: totalFilmes,
      filmesPorGenero: filmesPorGenero,
      dataGeracao: new Date().toISOString()
    };

    // 4. Retornar o JSON
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(relatorio),
    };

  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Erro ao chamar a API de filmes.', 
        details: error.message 
      }),
    };
  }
};