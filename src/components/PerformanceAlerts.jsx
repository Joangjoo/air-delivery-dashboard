import React from 'react';

const PerformanceAlerts = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-gray-600">Tidak ada data untuk analisis kinerja.</div>;
  }

  const driverPerformanceMap = new Map();
  const driverDeliveryData = data.filter(item =>
    item.Sopir && item['Jenis Transaksi'] === 'Pemasukan' &&
    typeof item['Volume (L)'] === 'number' && item['Volume (L)'] > 0
  );

  driverDeliveryData.forEach(item => {
    const driverName = item.Sopir;
    if (!driverPerformanceMap.has(driverName)) {
      driverPerformanceMap.set(driverName, {
        name: driverName,
        totalVolume: 0,
        totalTrips: 0,
      });
    }
    const entry = driverPerformanceMap.get(driverName);
    entry.totalVolume += item['Volume (L)'];
    entry.totalTrips += 1;
  });
  const driverSummary = Array.from(driverPerformanceMap.values());

  const totalVolumeAllDrivers = driverSummary.reduce((sum, d) => sum + d.totalVolume, 0);
  const totalTripsAllDrivers = driverSummary.reduce((sum, d) => sum + d.totalTrips, 0);
  const avgVolumePerDriver = driverSummary.length > 0 ? totalVolumeAllDrivers / driverSummary.length : 0;
  const avgTripsPerDriver = driverSummary.length > 0 ? totalTripsAllDrivers / driverSummary.length : 0;

  const volumeThreshold = avgVolumePerDriver * 0.8;
  const tripsThreshold = avgTripsPerDriver * 0.8;

  const underperformingDrivers = driverSummary.filter(d =>
    d.totalVolume < volumeThreshold || d.totalTrips < tripsThreshold
  ).sort((a, b) => a.totalVolume - b.totalVolume); 


  const armadaPerformanceMap = new Map();
  const armadaRelevantData = data.filter(item => item['Plat Nomor']); 

  armadaRelevantData.forEach(item => {
    const platNomor = item['Plat Nomor'];
    if (!armadaPerformanceMap.has(platNomor)) {
      armadaPerformanceMap.set(platNomor, {
        name: platNomor,
        totalVolume: 0,
        totalMaintenanceCost: 0,
        totalTrips: 0,
      });
    }
    const entry = armadaPerformanceMap.get(platNomor);

    if (item['Jenis Transaksi'] === 'Pemasukan' && typeof item['Volume (L)'] === 'number') {
      entry.totalVolume += item['Volume (L)'];
      entry.totalTrips += 1;
    } else if (item['Jenis Transaksi'] === 'Pengeluaran' && typeof item.Pengeluaran === 'number') {
      const expenseTypes = ['ganti oli', 'isi solar', 'perbaikan ban', 'servis mesin', 'cuci truk'];
      if (item.Order && expenseTypes.some(type => item.Order.toLowerCase().includes(type))) {
        entry.totalMaintenanceCost += item.Pengeluaran;
      }
    }
  });
  const armadaSummary = Array.from(armadaPerformanceMap.values());
  const processedArmada = armadaSummary.map(a => ({
    ...a,
    efficiency: a.totalMaintenanceCost > 0 ? a.totalVolume / a.totalMaintenanceCost : (a.totalVolume > 0 ? Infinity : 0)
  }));

  const efficientArmadas = processedArmada.filter(a => a.totalMaintenanceCost > 0 && a.totalVolume > 0);
  const avgEfficiencyPerArmada = efficientArmadas.length > 0 ? efficientArmadas.reduce((sum, a) => sum + a.efficiency, 0) / efficientArmadas.length : 0;
  const efficiencyThreshold = avgEfficiencyPerArmada * 0.8; 
  const underperformingArmadas = processedArmada.filter(a =>
    a.totalVolume < volumeThreshold || 
    (a.totalMaintenanceCost > 0 && a.efficiency < efficiencyThreshold) 
  ).sort((a, b) => a.efficiency - b.efficiency); 
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
      <h2 className="text-2xl font-semibold mb-4 text-gray-800"> Alert Kinerja</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3 text-red-700">Sopir dengan Kinerja di Bawah Rata-rata</h3>
        {underperformingDrivers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {underperformingDrivers.map((driver) => (
              <div key={driver.name} className="bg-red-100 p-4 rounded-lg border border-red-300">
                <p className="font-bold text-red-800">{driver.name}</p>
                <p className="text-sm text-red-700">Total Volume: {formatNumber(driver.totalVolume)} L (Rata-rata: {formatNumber(avgVolumePerDriver)} L)</p>
                <p className="text-sm text-red-700">Total Trip: {formatNumber(driver.totalTrips)} (Rata-rata: {formatNumber(avgTripsPerDriver)})</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Semua sopir menunjukkan kinerja di atas ambang batas rata-rata.</p>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-3 text-red-700">Armada dengan Kinerja/Efisiensi di Bawah Rata-rata</h3>
        {underperformingArmadas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {underperformingArmadas.map((armada) => (
              <div key={armada.name} className="bg-red-100 p-4 rounded-lg border border-red-300">
                <p className="font-bold text-red-800">{armada.name}</p>
                <p className="text-sm text-red-700">Total Volume: {formatNumber(armada.totalVolume)} L</p>
                <p className="text-sm text-red-700">Total Biaya Perawatan: {formatRupiah(armada.totalMaintenanceCost)}</p>
                {armada.totalVolume > 0 && armada.totalMaintenanceCost > 0 && (
                    <p className="text-sm text-red-700">Efisiensi: {formatNumber(armada.efficiency.toFixed(2))} L/IDR (Rata-rata: {formatNumber(avgEfficiencyPerArmada.toFixed(2))} L/IDR)</p>
                )}
                {armada.totalVolume === 0 && <p className="text-sm text-red-700">Tidak ada pengiriman terdata.</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Semua armada menunjukkan kinerja/efisiensi di atas ambang batas rata-rata.</p>
        )}
      </div>
    </div>
  );
};

export default PerformanceAlerts;