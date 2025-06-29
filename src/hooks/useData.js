import { useState, useEffect } from 'react';
import Papa from 'papaparse';

const useData = (filePath) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();

        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const processedData = results.data.map(row => {
              if (filePath.includes('transaksi.csv')) {
                if (row.Tanggal && typeof row.Tanggal === 'string') {
                  const [year, month, day] = row.Tanggal.split('-').map(Number);
                  row.Tanggal = new Date(year, month - 1, day);
                }
                if (typeof row.Pemasukan === 'string') {
                  row.Pemasukan = parseFloat(row.Pemasukan.replace(/,/g, ''));
                }
                if (typeof row.Pengeluaran === 'string') {
                  row.Pengeluaran = parseFloat(row.Pengeluaran.replace(/,/g, ''));
                }
                if (typeof row.Jumlah === 'string') {
                  row.Jumlah = parseFloat(row.Jumlah.replace(/,/g, ''));
                }
                if (typeof row['Volume (L)'] === 'string') {
                  if (row['Volume (L)'] === '-') {
                    row['Volume (L)'] = 0;
                  } else {
                    row['Volume (L)'] = parseFloat(row['Volume (L)']);
                  }
                }
              }
              return row;
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