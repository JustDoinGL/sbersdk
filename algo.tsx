optimization: {
  splitChunks: {
    chunks: 'all',
    maxSize: 244000, // ~244KB (меньше 256KB для лучшего кэширования)
    cacheGroups: {
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        priority: 10,
        reuseExistingChunk: true
      },
      styles: {
        test: /\.s?[ac]ss$/i,
        name: 'styles',
        chunks: 'all',
        enforce: true,
        priority: 20
      },
      // Новое правило для разбиения index.js
      indexCommon: {
        test: /[\\/]src[\\/]index\.js$|components[\\/]/,
        name(module, chunks, cacheGroupKey) {
          const moduleFileName = module.identifier().split('/').pop().split('.')[0];
          return `index-${moduleFileName}`;
        },
        priority: 30,
        minSize: 10000, // 10KB минимальный размер для выделения в отдельный чанк
        minChunks: 1,
        reuseExistingChunk: true
      },
      common: {
        name: 'common',
        minChunks: 2, // Минимум 2 чанка используют модуль
        priority: 5,
        reuseExistingChunk: true
      }
    }
  }
}