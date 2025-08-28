import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useDebounce } from './useDebounce';

function SearchForm() {
  const { register, watch } = useForm();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Отслеживаем поле поиска
  const searchTerm = watch('search');
  
  // Используем дебаунс на 500ms
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchData = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedSearchTerm)}`
        );
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedSearchTerm]);

  return (
    <div>
      <form>
        <input
          {...register('search')}
          placeholder="Поиск..."
          type="text"
        />
      </form>

      {loading && <div>Загрузка...</div>}
      
      {results.length > 0 && (
        <div>
          <h3>Результаты:</h3>
          <ul>
            {results.map((result, index) => (
              <li key={index}>{result.name}</li>
            ))}
          </ul>
        </div>
      )}
      
      {debouncedSearchTerm && debouncedSearchTerm.length < 2 && (
        <div>Введите минимум 2 символа</div>
      )}
    </div>
  );
}

export default SearchForm;
