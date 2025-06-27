module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      maxSize: 244 * 1024, // 244KB (меньше чем 250KB для лучшего кэширования)
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        common: {
          name: 'common',
          minChunks: 2, // Минимум 2 чанка используют модуль
          priority: 5,
          reuseExistingChunk: true
        },
        index: {
          test: /[\\/]src[\\/]index\.js$/, // Или путь к вашему index.js
          name: 'index',
          priority: 20,
          enforce: true
        }
      }
    }
  }
}