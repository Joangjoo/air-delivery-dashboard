import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57'];

const ArmadaUsage = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-gray-600">Tidak ada data armada untuk ditampilkan.</div>;
  }

  const armadaData = data.filter(item => item['Plat Nomor'] !== null && item['Plat Nomor'] !== undefined);

  const armadaSummaryMap = new Map();

  armadaData.forEach(item => {
    const platNomor = item['Plat Nomor'];
    if (!armadaSummaryMap.has(platNomor)) {
      armadaSummaryMap.set(platNomor, {
        name: platNomor,
        tripCount: 0,
        totalVolume: 0,
        totalMaintenanceCost: 0,
        activeMonths: new Set(), 
      });
    }

    const entry = armadaSummaryMap.get(platNomor);

    if (item['Jenis Transaksi'] === 'Pemasukan' && typeof item['Volume (L)'] === 'number') {
      entry.tripCount += 1;
      entry.totalVolume += item['Volume (L)'];
    } else if (item['Jenis Transaksi'] === 'Pengeluaran' && typeof item.Pengeluaran === 'number') {
      const expenseTypes = ['ganti oli', 'isi solar', 'perbaikan ban', 'servis mesin', 'cuci truk'];
      if (expenseTypes.some(type => item.Order && item.Order.toLowerCase().includes(type))) {
        entry.totalMaintenanceCost += item.Pengeluaran;
      }
    }

    if (item.Tanggal instanceof Date && !isNaN(item.Tanggal.getTime())) {
      entry.activeMonths.add(item.Tanggal.getFullYear() + '-' + item.Tanggal.getMonth());
    }
  });

  const armadaSummary = Array.from(armadaSummaryMap.values());
  const processedArmadaData = armadaSummary.map(armada => {
    const avgVolumePerMonth = armada.activeMonths.size > 0 ? armada.totalVolume / armada.activeMonths.size : 0;
    const efficiency = armada.totalMaintenanceCost > 0 ? armada.totalVolume / armada.totalMaintenanceCost : (armada.totalVolume > 0 ? Infinity : 0); // Infinity jika biaya 0 tapi volume ada

    return {
      ...armada,
      avgVolumePerMonth: avgVolumePerMonth,
      efficiency: efficiency,
      activeMonthCount: armada.activeMonths.size,
    };
  });

  const leastUsedArmada = [...processedArmadaData].sort((a, b) => a.tripCount - b.tripCount)[0];

  const formatNumber = (number) => {
    return new Intl.NumberFormat('id-ID').format(number);
  };
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. Demografi Penggunaan Armada</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-700">Armada Paling Jarang Digunakan (berdasarkan Trip)</p>
          <p className="text-lg font-bold text-purple-800">{leastUsedArmada ? `${leastUsedArmada.name} (${leastUsedArmada.tripCount} Trip)` : 'N/A'}</p>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-4 text-gray-800">Frekuensi Penggunaan Armada (Berdasarkan Jumlah Trip)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={processedArmadaData}
            dataKey="tripCount"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {processedArmadaData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${formatNumber(value)} Trip`, name]} />
          <Legend wrapperStyle={{ paddingTop: 20 }} />
        </PieChart>
      </ResponsiveContainer>

      <h3 className="text-xl font-semibold mt-6 mb-4 text-gray-800">Rata-rata Volume Terangkut per Bulan per Armada</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={processedArmadaData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis
            tickFormatter={(value) => `${formatNumber(value)} L`}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{ value: 'Volume (L)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
          />
          <Tooltip formatter={(value, name) => [`${formatNumber(value)} L`, name]} />
          <Legend wrapperStyle={{ paddingTop: 20 }} />
          <Bar dataKey="avgVolumePerMonth" fill="#82ca9d" name="Rata-rata Volume per Bulan" />
        </BarChart>
      </ResponsiveContainer>

      <h3 className="text-xl font-semibold mt-6 mb-4 text-gray-800">Detail Biaya & Efisiensi Armada</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Plat Nomor</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Total Trip</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Total Volume</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Total Biaya Perawatan</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Efisiensi (Volume/Biaya)</th>
            </tr>
          </thead>
          <tbody>
            {processedArmadaData.sort((a, b) => b.totalVolume - a.totalVolume).map((armada, index) => (
              <tr key={armada.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="py-2 px-4 border-b text-sm text-gray-800 font-semibold">{armada.name}</td>
                <td className="py-2 px-4 border-b text-sm text-gray-700">{formatNumber(armada.tripCount)}</td>
                <td className="py-2 px-4 border-b text-sm text-gray-700">{formatNumber(armada.totalVolume)} L</td>
                <td className="py-2 px-4 border-b text-sm text-gray-700">{formatRupiah(armada.totalMaintenanceCost)}</td>
                <td className="py-2 px-4 border-b text-sm text-gray-700">
                  {armada.efficiency === Infinity ? 'Sangat Efisien (Biaya 0)' : `${formatNumber(armada.efficiency.toFixed(2))} L/IDR`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArmadaUsage;