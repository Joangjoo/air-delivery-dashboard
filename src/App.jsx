import React, { useEffect, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import useData from './hooks/useData';
import useDashboardStore from './store/useDashboardStore';
import FilterBar from './components/FilterBar';
import Sidebar from './components/Sidebar'; 

import FinancialSummary from './components/FinancialSummary';
import VolumeSummary from './components/VolumeSummary';
import DeliveryMap from './components/DeliveryMap';
import ArmadaUsage from './components/ArmadaUsage';
import DriverPerformance from './components/DriverPerformance';
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
        <p className="text-xl font-semibold">Error memuat data: {errorTransaksi?.message || errorLokasi?.message}.</p>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white text-gray-800 p-4 shadow-md border-b">
          <h1 className="text-2xl font-bold text-center">Dashboard Visual Interaktif Pengiriman Air</h1>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <section className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Filter Data</h2>
            <FilterBar />
          </section>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Routes>
              <Route path="/" element={<FinancialSummary data={filteredData} />} />
              <Route path="/volume" element={<VolumeSummary data={filteredData} />} />
              <Route path="/peta" element={<DeliveryMap data={filteredData} />} />
              <Route path="/armada" element={<ArmadaUsage data={filteredData} />} />
              <Route path="/sopir" element={<DriverPerformance data={filteredData} />} />
              <Route path="/harian" element={<DailyWeeklyPerformance data={filteredData} />} />
              <Route path="/peringatan" element={<PerformanceAlerts data={filteredData} />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
