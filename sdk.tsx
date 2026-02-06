function getAllKeys(obj, prefix = '') {
  const keys = [];
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      keys.push(fullPath);
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys.push(...getAllKeys(obj[key], fullPath));
      }
    }
  }
  
  return keys;
}

// Пример использования
const data = {
  name: 'John',
  address: {
    street: 'Main St',
    city: 'NYC',
    geo: {
      lat: 40.7128,
      lng: -74.0060
    }
  },
  tags: ['js', 'ts']
};

console.log(getAllKeys(data));
// ['name', 'address', 'address.street', 'address.city', 'address.geo', 'address.geo.lat', 'address.geo.lng']