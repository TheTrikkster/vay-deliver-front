import { useState, useEffect } from 'react';
import axios from 'axios';
import { handleApiError } from '../utils/errorHandling';

interface UseAPIOptions<T> {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  transform?: (data: any) => T[];
  mockData?: T[];
}

export function useAPI<T>({ url, method = 'GET', body, transform, mockData }: UseAPIOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const source = axios.CancelToken.source();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios({
          method,
          url,
          data: body,
          cancelToken: source.token,
        });

        const processedData = transform ? transform(response.data) : response.data;
        setData(processedData);
      } catch (err) {
        const errorMessage = handleApiError(err);
        setError(errorMessage);

        if (mockData) {
          setData(mockData);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      source.cancel('Component unmounted');
    };
  }, [url, method, JSON.stringify(body)]);

  return { data, loading, error };
}
