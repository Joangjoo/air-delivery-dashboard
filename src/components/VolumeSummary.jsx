import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  CartesianGrid,
} from 'recharts';

const VolumeSummary = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-gray-600">Tidak ada data volume pengiriman untuk ditampilkan.</div>;
  }

  const deliveryData = data.filter(item =>
    item['Jenis Transaksi'] === 'Pemasukan' &&
    typeof item['Volume (L)'] === 'number' &&
    item['Volume (L)'] > 0
  );

  const totalVolume = deliveryData.reduce((sum, item) => sum + item['Volume (L)'], 0);

  const monthlyVolumeMap = new Map();
  const activeDaysMap = new Map(); 

  deliveryData.forEach(item => {
    if (!item.Tanggal || !(item.Tanggal instanceof Date) || isNaN(item.Tanggal.getTime())) {
            console.warn("Skipping item due to invalid date:", item); 
            return; 
        }

    const monthYear = item.Tanggal.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
    const sortKey = item.Tanggal.getFullYear() * 100 + item.Tanggal.getMonth();
    const dateString = item.Tanggal.toISOString().split('T')[0]; 
    if (!monthlyVolumeMap.has(sortKey)) {
      monthlyVolumeMap.set(sortKey, {
        name: monthYear,
        volume: 0,
        sortKey: sortKey
      });
    }
    monthlyVolumeMap.get(sortKey).volume += item['Volume (L)'];

    if (!activeDaysMap.has(sortKey)) {
        activeDaysMap.set(sortKey, new Set());
    }
    activeDaysMap.get(sortKey).add(dateString);
  });

  const monthlyVolumeData = Array.from(monthlyVolumeMap.values())
    .sort((a, b) => a.sortKey - b.sortKey);

  let totalActiveDays = 0;
  activeDaysMap.forEach(daySet => {
      totalActiveDays += daySet.size;
  });

  const avgVolumePerActiveDay = totalActiveDays > 0 ? totalVolume / totalActiveDays : 0;
  const peakVolumeMonth = monthlyVolumeData.length > 0 ? monthlyVolumeData.reduce((prev, current) => (prev.volume > current.volume ? prev : current)) : null;

  const formatNumber = (number) => {
    return new Intl.NumberFormat('id-ID').format(number);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Ringkasan Volume Pengiriman Air</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">Total Volume Terkirim</p>
          <p className="text-xl font-bold text-blue-800">{formatNumber(totalVolume)} L</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-700">Rata-rata Volume per Hari Aktif</p>
          <p className="text-xl font-bold text-green-800">{formatNumber(avgVolumePerActiveDay)} L</p>
        </div>
      </div>

      <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <p className="text-sm text-yellow-700">Bulan dengan Pengiriman Volume Tertinggi (Peak Season)</p>
        <p className="text-lg font-bold text-yellow-800">{peakVolumeMonth ? `${peakVolumeMonth.name} (${formatNumber(peakVolumeMonth.volume)} L)` : 'N/A'}</p>
      </div>

      <h3 className="text-xl font-semibold mb-4 text-gray-800">Tren Volume Pengiriman Air Bulanan</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={monthlyVolumeData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis
            tickFormatter={(value) => formatNumber(value)}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{ value: 'Volume (L)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
          />
          <Tooltip formatter={(value) => `${formatNumber(value)} L`} />
          <Bar dataKey="volume" fill="#4CAF50" name="Volume Terkirim" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VolumeSummary;