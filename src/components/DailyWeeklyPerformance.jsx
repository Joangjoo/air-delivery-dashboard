import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  Bar,
  Legend
} from 'recharts';

const DailyWeeklyPerformance = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-gray-600">Tidak ada data kinerja harian/mingguan untuk ditampilkan.</div>;
  }

  const validData = data.filter(item =>
    item.Tanggal instanceof Date && !isNaN(item.Tanggal.getTime())
  );

  const dailyDataMap = new Map();
  validData.forEach(item => {
    const dateString = item.Tanggal.toISOString().split('T')[0]; 
    if (!dailyDataMap.has(dateString)) {
      dailyDataMap.set(dateString, {
        date: dateString,
        pemasukan: 0,
        pengeluaran: 0,
        volume: 0,
        margin: 0,
        timestamp: item.Tanggal.getTime() 
      });
    }
    const dailyEntry = dailyDataMap.get(dateString);
    if (item['Jenis Transaksi'] === 'Pemasukan' && typeof item.Pemasukan === 'number') {
      dailyEntry.pemasukan += item.Pemasukan;
      dailyEntry.volume += item['Volume (L)'] || 0;
    } else if (item['Jenis Transaksi'] === 'Pengeluaran' && typeof item.Pengeluaran === 'number') {
      dailyEntry.pengeluaran += item.Pengeluaran;
    }
    dailyEntry.margin = dailyEntry.pemasukan - dailyEntry.pengeluaran;
  });

  const dailyPerformanceData = Array.from(dailyDataMap.values()).sort((a, b) => a.timestamp - b.timestamp);


  const weeklyDataMap = new Map();
  validData.forEach(item => {
    const date = item.Tanggal;
    const day = date.getDay(); 
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);  
    const startOfWeek = new Date(date.getFullYear(), date.getMonth(), diff);
    const weekString = startOfWeek.toISOString().split('T')[0]; 

    if (!weeklyDataMap.has(weekString)) {
      weeklyDataMap.set(weekString, {
        weekStart: weekString,
        pemasukan: 0,
        pengeluaran: 0,
        volume: 0,
        margin: 0,
        timestamp: startOfWeek.getTime() 
      });
    }
    const weeklyEntry = weeklyDataMap.get(weekString);
    if (item['Jenis Transaksi'] === 'Pemasukan' && typeof item.Pemasukan === 'number') {
      weeklyEntry.pemasukan += item.Pemasukan;
      weeklyEntry.volume += item['Volume (L)'] || 0;
    } else if (item['Jenis Transaksi'] === 'Pengeluaran' && typeof item.Pengeluaran === 'number') {
      weeklyEntry.pengeluaran += item.Pengeluaran;
    }
    weeklyEntry.margin = weeklyEntry.pemasukan - weeklyEntry.pengeluaran;
  });

  const weeklyPerformanceData = Array.from(weeklyDataMap.values()).sort((a, b) => a.timestamp - b.timestamp);


  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };
  const formatNumber = (number) => {
    return new Intl.NumberFormat('id-ID').format(number);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800"> Kinerja Harian & Mingguan</h2>

      <h3 className="text-xl font-semibold mb-4 text-gray-700">Tren Harian (Pemasukan, Pengeluaran, Volume)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={dailyPerformanceData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} />
          <YAxis yAxisId="left" tickFormatter={(value) => formatRupiah(value)} label={{ value: 'IDR', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${formatNumber(value)} L`} label={{ value: 'Volume', angle: 90, position: 'insideRight', fill: '#6b7280', fontSize: 10 }} />
          <Tooltip formatter={(value, name) => {
              if (name === 'pemasukan' || name === 'pengeluaran' || name === 'margin') return [`${formatRupiah(value)}`, name];
              if (name === 'volume') return [`${formatNumber(value)} L`, name];
              return value;
          }} />
          <Legend wrapperStyle={{ paddingTop: 20 }} />
          <Line yAxisId="left" type="monotone" dataKey="pemasukan" stroke="#4CAF50" name="Pemasukan" />
          <Line yAxisId="left" type="monotone" dataKey="pengeluaran" stroke="#FF5722" name="Pengeluaran" />
          <Line yAxisId="left" type="monotone" dataKey="margin" stroke="#2196F3" name="Margin" />
          <Line yAxisId="right" type="monotone" dataKey="volume" stroke="#00C49F" name="Volume" />
        </LineChart>
      </ResponsiveContainer>

      <h3 className="text-xl font-semibold mt-8 mb-4 text-gray-700">Tren Mingguan (Pemasukan, Pengeluaran, Volume)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={weeklyPerformanceData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="weekStart" tick={{ fill: '#6b7280', fontSize: 10 }} />
          <YAxis yAxisId="left" tickFormatter={(value) => formatRupiah(value)} label={{ value: 'IDR', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${formatNumber(value)} L`} label={{ value: 'Volume', angle: 90, position: 'insideRight', fill: '#6b7280', fontSize: 10 }} />
          <Tooltip formatter={(value, name) => {
              if (name === 'pemasukan' || name === 'pengeluaran' || name === 'margin') return [`${formatRupiah(value)}`, name];
              if (name === 'volume') return [`${formatNumber(value)} L`, name];
              return value;
          }} />
          <Legend wrapperStyle={{ paddingTop: 20 }} />
          <Bar yAxisId="left" dataKey="pemasukan" fill="#4CAF50" name="Pemasukan" />
          <Bar yAxisId="left" dataKey="pengeluaran" fill="#FF5722" name="Pengeluaran" />
          <Line yAxisId="left" type="monotone" dataKey="margin" stroke="#2196F3" name="Margin" />
          <Line yAxisId="right" type="monotone" dataKey="volume" stroke="#00C49F" name="Volume" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyWeeklyPerformance;