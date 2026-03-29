import { useState, useEffect } from 'react';

export function useData(endpointList) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    try {
      setError(null);
      const results = {};
      await Promise.all(
        endpointList.map(async (endpoint) => {
          const res = await fetch(`/api/${endpoint}?t=${Date.now()}`);
          if (!res.ok) {
            throw new Error(`API Endpoint /api/${endpoint} returned ${res.status}`);
          }
          const json = await res.json();
          results[endpoint] = json;
        })
      );
      setData(results);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshData = () => {
    fetchItems();
  };

  return { ...data, loading, error, refreshData };
}