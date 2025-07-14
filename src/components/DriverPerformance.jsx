import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  CartesianGrid,
  Legend,
  ComposedChart,
  Line
} from 'recharts';

const DriverPerformance = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-gray-600">Tidak ada data sopir untuk ditampilkan.</div>;
  }

  const driverDeliveryData = data.filter(item =>
    item.Sopir !== null && item.Sopir !== undefined &&
    item['Jenis Transaksi'] === 'Pemasukan' &&
    typeof item['Volume (L)'] === 'number' &&
    item['Volume (L)'] > 0 &&
    item.Tanggal instanceof Date && !isNaN(item.Tanggal.getTime())
  );

  const driverTotalSummaryMap = new Map();
  driverDeliveryData.forEach(item => {
    const driverName = item.Sopir;
    if (!driverTotalSummaryMap.has(driverName)) {
      driverTotalSummaryMap.set(driverName, {
        name: driverName,
        totalTrips: 0,
        totalVolume: 0,
        totalRevenue: 0,
      });
    }
    const entry = driverTotalSummaryMap.get(driverName);
    entry.totalTrips += 1;
    entry.totalVolume += item['Volume (L)'];
    entry.totalRevenue += item.Pemasukan;
  });
  const driverTotalSummary = Array.from(driverTotalSummaryMap.values());

  const driverMonthlySummaryMap = new Map();
  driverDeliveryData.forEach(item => {
    const driverName = item.Sopir;
    const monthYear = item.Tanggal.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
    const sortKey = item.Tanggal.getFullYear() * 100 + item.Tanggal.getMonth();

    if (!driverMonthlySummaryMap.has(driverName)) {
      driverMonthlySummaryMap.set(driverName, new Map());
    }
    const monthlyMap = driverMonthlySummaryMap.get(driverName);

    if (!monthlyMap.has(sortKey)) {
      monthlyMap.set(sortKey, {
        name: monthYear,
        volume: 0,
        trips: 0,
        sortKey: sortKey
      });
    }
    const monthlyEntry = monthlyMap.get(sortKey);
    monthlyEntry.volume += item['Volume (L)'];
    monthlyEntry.trips += 1;
  });

  const driverMonthlyPerformance = Array.from(driverMonthlySummaryMap.entries()).map(([driver, monthlyMap]) => {
    const monthlyData = Array.from(monthlyMap.values()).sort((a, b) => a.sortKey - b.sortKey);
    return {
      driverName: driver,
      monthlyData: monthlyData
    };
  });

  const mostActiveDriver = driverTotalSummary.length > 0 ? [...driverTotalSummary].sort((a, b) => b.totalVolume - a.totalVolume)[0] : null;
  const leastActiveDriver = driverTotalSummary.length > 0 ? [...driverTotalSummary].sort((a, b) => a.totalVolume - b.totalVolume)[0] : null;


  const formatNumber = (number) => {
    return new Intl.NumberFormat('id-ID').format(number);
  };



  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">5. Frekuensi Kerja Sopir & Kinerja Individu</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">Sopir Paling Aktif (Volume)</p>
          <p className="text-xl font-bold text-blue-800">{mostActiveDriver ? `${mostActiveDriver.name} (${formatNumber(mostActiveDriver.totalVolume)} L)` : 'N/A'}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-red-700">Sopir Kurang Aktif (Volume)</p>
          <p className="text-xl font-bold text-red-800">{leastActiveDriver ? `${leastActiveDriver.name} (${formatNumber(leastActiveDriver.totalVolume)} L)` : 'N/A'}</p>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-4 text-gray-800">Perbandingan Total Volume Pengiriman antar Sopir</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={driverTotalSummary.sort((a, b) => b.totalVolume - a.totalVolume)} // Urutkan berdasarkan volume
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis
            tickFormatter={(value) => `${formatNumber(value)} L`}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{ value: 'Volume (L)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
          />
          <Tooltip formatter={(value) => [`${formatNumber(value)} L`, 'Total Volume']} />
          <Legend wrapperStyle={{ paddingTop: 20 }} />
          <Bar dataKey="totalVolume" fill="#00C49F" name="Total Volume Terkirim" />
        </BarChart>
      </ResponsiveContainer>

      <h3 className="text-xl font-semibold mt-6 mb-4 text-gray-800">Performa Individu Sopir (Volume & Trips per Bulan)</h3>
      {driverMonthlyPerformance.map((driverData) => (
        <div key={driverData.driverName} className="mb-8">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">Sopir: {driverData.driverName}</h4>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart
              data={driverData.monthlyData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} />
              <YAxis yAxisId="left" tickFormatter={(value) => `${formatNumber(value)}L`} label={{ value: 'Volume (L)', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 10 }} allowDecimals={false} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${formatNumber(value)}x`} label={{ value: 'Trip', angle: 90, position: 'insideRight', fill: '#6b7280', fontSize: 10 }} allowDecimals={false} />
              <Tooltip formatter={(value, name) => {
                if (name === 'volume') return [`${formatNumber(value)} L`, 'Volume'];
                if (name === 'trips') return [`${formatNumber(value)}x`, 'Trip'];
                return value;
              }} />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <Bar yAxisId="left" dataKey="volume" fill="#8884d8" name="Volume Terkirim" />
              <Line yAxisId="right" type="monotone" dataKey="trips" stroke="#ff7300" name="Jumlah Trip" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
};

export default DriverPerformance;