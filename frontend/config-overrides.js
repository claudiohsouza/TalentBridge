module.exports = function override(config, env) {
  // Configurações para lidar com problemas de CORS
  process.env.DANGEROUSLY_DISABLE_HOST_CHECK = 'true';
  
  // Configuração do proxy e headers para o webpack-dev-server
  config.devServer = {
    ...(config.devServer || {}),
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Endereço do backend
        changeOrigin: true,
        secure: false,
        headers: {
          Connection: 'keep-alive'
        }
      }
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    }
  };
  
  return config;
}; 