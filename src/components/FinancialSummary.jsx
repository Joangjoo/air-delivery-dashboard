import React from 'react';
import {
 ResponsiveContainer,
 AreaChart,
 XAxis,
 YAxis,
 Tooltip,
 Area,
 CartesianGrid,
 Legend
} from 'recharts';

const FinancialSummary = ({ data }) => {
 if (!data || data.length === 0) {
  return <div className="text-gray-600">Tidak ada data keuangan untuk ditampilkan.</div>;
 }

 const totalPemasukan = data
  .filter(item => item['Jenis Transaksi'] === 'Pemasukan' && typeof item.Pemasukan === 'number')
  .reduce((sum, item) => sum + item.Pemasukan, 0);

 const totalPengeluaran = data
  .filter(item => item['Jenis Transaksi'] === 'Pengeluaran' && typeof item.Pengeluaran === 'number')
  .reduce((sum, item) => sum + item.Pengeluaran, 0);

 const totalMargin = totalPemasukan - totalPengeluaran;

 const monthlyDataMap = new Map();

 data.forEach(item => {
  if (!item.Tanggal || !(item.Tanggal instanceof Date) || isNaN(item.Tanggal.getTime())) {
   return; 
  }
  const monthYear = item.Tanggal.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
  const sortKey = item.Tanggal.getFullYear() * 100 + item.Tanggal.getMonth();

  if (!monthlyDataMap.has(sortKey)) {
   monthlyDataMap.set(sortKey, {
    name: monthYear,
    pemasukan: 0,
    pengeluaran: 0,
    margin: 0,
    sortKey: sortKey
   });
  }

  const monthlyEntry = monthlyDataMap.get(sortKey);
  if (item['Jenis Transaksi'] === 'Pemasukan' && typeof item.Pemasukan === 'number') {
   monthlyEntry.pemasukan += item.Pemasukan;
  } else if (item['Jenis Transaksi'] === 'Pengeluaran' && typeof item.Pengeluaran === 'number') {
   monthlyEntry.pengeluaran += item.Pengeluaran;
  }
 }); 


 const monthlyData = Array.from(monthlyDataMap.values())
  .sort((a, b) => a.sortKey - b.sortKey)
  .map(entry => ({
    ...entry,
    margin: entry.pemasukan - entry.pengeluaran
  }));

 const avgMarginPerMonth = monthlyData.length > 0 ? monthlyData.reduce((sum, item) => sum + item.margin, 0) / monthlyData.length : 0;
 const bestMonth = monthlyData.length > 0 ? monthlyData.reduce((prev, current) => (prev.margin > current.margin ? prev : current)) : null;
 const worstMonth = monthlyData.length > 0 ? monthlyData.reduce((prev, current) => (prev.margin < current.margin ? prev : current)) : null;

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
   <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. Ringkasan Keuangan</h2>

   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
     <p className="text-sm text-green-700">Total Pemasukan</p>
     <p className="text-xl font-bold text-green-800">{formatRupiah(totalPemasukan)}</p>
    </div>
    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
     <p className="text-sm text-red-700">Total Pengeluaran</p>
     <p className="text-xl font-bold text-red-800">{formatRupiah(totalPengeluaran)}</p>
    </div>
    <div className={`p-4 rounded-lg border ${totalMargin >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
     <p className="text-sm text-gray-700">Total Margin</p>
     <p className="text-xl font-bold text-blue-800">{formatRupiah(totalMargin)}</p>
    </div>
   </div>

   <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
     <p className="text-sm text-purple-700">Rata-rata Margin/Bulan</p>
     <p className="text-xl font-bold text-purple-800">{formatRupiah(avgMarginPerMonth)}</p>
    </div>
    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
     <p className="text-sm text-yellow-700">Bulan Terbaik (Margin)</p>
     <p className="text-lg font-bold text-yellow-800">{bestMonth ? `${bestMonth.name} (${formatRupiah(bestMonth.margin)})` : 'N/A'}</p>
    </div>
    <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
     <p className="text-sm text-pink-700">Bulan Terburuk (Margin)</p>
     <p className="text-lg font-bold text-pink-800">{worstMonth ? `${worstMonth.name} (${formatRupiah(worstMonth.margin)})` : 'N/A'}</p>
    </div>
   </div>

   <h3 className="text-xl font-semibold mb-4 text-gray-800">Tren Pemasukan, Pengeluaran & Margin Bulanan</h3>
   <ResponsiveContainer width="100%" height={300}>
    <AreaChart
     data={monthlyData}
     margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
    >
     <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
     <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
     <YAxis
      tickFormatter={(value) => formatRupiah(value)}
      tick={{ fill: '#6b7280', fontSize: 12 }}
     />
     <Tooltip formatter={(value) => formatRupiah(value)} />
     <Legend wrapperStyle={{ paddingTop: 20 }} />
     <Area
      type="monotone"
      dataKey="pemasukan"
      stackId="1"
      stroke="#4CAF50"
      fill="#81C784"
      name="Pemasukan"
     />
     <Area
      type="monotone"
      dataKey="pengeluaran"
      stackId="1"
      stroke="#FF5722"
      fill="#FFAB91"
      name="Pengeluaran"
     />
     <Area
      type="monotone"
      dataKey="margin"
      stroke="#2196F3"
      fill="#90CAF9"
      name="Margin"
     />
    </AreaChart>
   </ResponsiveContainer>
  </div>
 );
};

export default FinancialSummary;