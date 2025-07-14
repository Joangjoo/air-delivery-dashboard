import { useState, useEffect } from 'react';
import Papa from 'papaparse';

const parseDateString = (dateString) => {
  if (!dateString || typeof dateString !== 'string') {
    return null;
  }

  if (dateString.includes('-')) {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      if (year > 1900 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return new Date(year, month - 1, day);
      }
    }
  }

  if (dateString.includes('/')) {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const part1 = parseInt(parts[0], 10);
      const part2 = parseInt(parts[1], 10);
      let year = parseInt(parts[2], 10);

      if (year < 100) {
        year += 2000;
      }
      if (part2 > 12 && part1 <= 12) {
        return new Date(year, part1 - 1, part2); 
      }
      if (part1 <= 31 && part2 <= 12) {
        return new Date(year, part2 - 1, part1); 
      }
    }
  }
  return null;
};


const useData = (filePath) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();

        Papa.parse(text, {
          header: true,
          dynamicTyping: false, 
          skipEmptyLines: true,
          complete: (results) => {
            const processedData = results.data.map(row => {
              const tanggalObjek = parseDateString(row.Tanggal);

              return {
                ...row,
                Pemasukan: parseFloat(String(row.Pemasukan).replace(/,/g, '')) || 0,
                Pengeluaran: parseFloat(String(row.Pengeluaran).replace(/,/g, '')) || 0,
                Jumlah: parseFloat(String(row.Jumlah).replace(/,/g, '')) || 0,
                'Volume (L)': row['Volume (L)'] === '-' ? 0 : parseFloat(String(row['Volume (L)'])) || 0,
                Tanggal: tanggalObjek,
              };
            });
            setData(processedData);
            setLoading(false);
          },
          error: (err) => {
            setError(err);
            setLoading(false);
          }
        });
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [filePath]);

  return { data, loading, error };
};

export default useData;
