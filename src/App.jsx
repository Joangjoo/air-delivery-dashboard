import React, { useEffect, useMemo } from 'react';
import useData from './hooks/useData';
import useDashboardStore from './store/useDashboardStore';

import FinancialSummary from './components/FinancialSummary';
import VolumeSummary from './components/VolumeSummary';
import DeliveryMap from './components/DeliveryMap';
import ArmadaUsage from './components/ArmadaUsage';
import DriverPerformance from './components/DriverPerformance';
import FilterBar from './components/FilterBar';
import DailyWeeklyPerformance from './components/DailyWeeklyPerformance';
import PerformanceAlerts from './components/PerformanceAlerts';

function App() {

  const { data: transaksiData, loading: loadingTransaksi, error: errorTransaksi } = useData('/data/transaksi.csv');
  const { data: lokasiData, loading: loadingLokasi, error: errorLokasi } = useData('/data/lokasi.csv');

  const {
    startDate,
    endDate,
    selectedDriver,
    selectedArmada,
    selectedLocation,
    filteredData,
    setFilteredData,
    initializeDateRange,
    setFilterOptions,
  } = useDashboardStore();

  const mergedRawData = useMemo(() => {
    if (!transaksiData || !lokasiData) return [];
    return transaksiData.map(transaksi => {
      const lokasiMatch = lokasiData.find(lokasi => lokasi['Nama Lokasi'] === transaksi.Order);
      return {
        ...transaksi,
        Latitude: lokasiMatch ? lokasiMatch.Latitude : null,
        Longitude: lokasiMatch ? lokasiMatch.Longitude : null,
      };
    });
  }, [transaksiData, lokasiData]);

  useEffect(() => {
    if (mergedRawData.length > 0) {
      initializeDateRange(mergedRawData);
      setFilterOptions(mergedRawData);
    }
  }, [mergedRawData, initializeDateRange, setFilterOptions]);

  useEffect(() => {
    if (mergedRawData.length === 0) {
      setFilteredData([]);
      return;
    }

    let currentFilteredData = mergedRawData;

    if (startDate && endDate) {
      currentFilteredData = currentFilteredData.filter(item => {
        if (!(item.Tanggal instanceof Date) || isNaN(item.Tanggal.getTime())) return false;
        return item.Tanggal >= startDate && item.Tanggal <= endDate;
      });
    }

    if (selectedDriver !== 'All') {
      currentFilteredData = currentFilteredData.filter(item => item.Sopir === selectedDriver);
    }

    if (selectedArmada !== 'All') {
      currentFilteredData = currentFilteredData.filter(item => item['Plat Nomor'] === selectedArmada);
    }

    if (selectedLocation !== 'All') {
      currentFilteredData = currentFilteredData.filter(item =>
        item['Jenis Transaksi'] === 'Pemasukan' && item.Order === selectedLocation
      );
    }

    setFilteredData(currentFilteredData);
  }, [mergedRawData, startDate, endDate, selectedDriver, selectedArmada, selectedLocation, setFilteredData]);

  if (loadingTransaksi || loadingLokasi) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl font-semibold text-gray-700">Memuat data dashboard...</p>
      </div>
    );
  }

  if (errorTransaksi || errorLokasi) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-700">
        <p className="text-xl font-semibold">Error memuat data: {errorTransaksi?.message || errorLokasi?.message}. Pastikan file CSV ada di public/data/ dan formatnya benar.</p>
      </div>
    );
  }
  const validDatesForDisplay = filteredData.filter(item =>
    item.Tanggal instanceof Date && !isNaN(item.Tanggal.getTime())
  );
  const sortedValidDatesForDisplay = [...validDatesForDisplay].sort((a, b) => a.Tanggal.getTime() - b.Tanggal.getTime());

  const firstDate = sortedValidDatesForDisplay.length > 0 ? sortedValidDatesForDisplay[0].Tanggal : null;
  const lastDate = sortedValidDatesForDisplay.length > 0 ? sortedValidDatesForDisplay[sortedValidDatesForDisplay.length - 1].Tanggal : null;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-3xl font-bold text-center">Dashboard Visual Interaktif Pengiriman Air</h1>
      </header>

      <main className="container mx-auto p-4 py-8">
        <section className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Filter Data</h2>
          <FilterBar />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">Status Pemuatan Data</h2>
            <p className="text-gray-600">Total Baris Data Transaksi (Filtered): <span className="font-bold text-blue-700">{filteredData.length}</span></p>
            <p className="text-gray-600">Transaksi Pemasukan (Filtered): <span className="font-bold text-green-700">{filteredData.filter(d => d['Jenis Transaksi'] === 'Pemasukan').length}</span> baris</p>
            <p className="text-gray-600">Transaksi Pengeluaran (Filtered): <span className="font-bold text-red-700">{filteredData.filter(d => d['Jenis Transaksi'] === 'Pengeluaran').length}</span> baris</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">Rentang Waktu Data</h2>
            <p className="text-gray-600">
              Tanggal Data Pertama: <span className="font-bold">
                {firstDate ? firstDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
              </span>
            </p>
            <p className="text-gray-600">
              Tanggal Data Terakhir: <span className="font-bold">
                {lastDate ? lastDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
              </span>
            </p>
          </div>

        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
            <FinancialSummary data={filteredData} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <VolumeSummary data={filteredData} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
            <DeliveryMap data={filteredData} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <ArmadaUsage data={filteredData} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <DriverPerformance data={filteredData} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
            <DailyWeeklyPerformance data={filteredData} /> 
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
            <PerformanceAlerts data={filteredData} /> 
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;