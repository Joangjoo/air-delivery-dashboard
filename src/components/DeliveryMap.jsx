import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; 
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function MapRefresher({ map }) {
  useEffect(() => {
    if (map) {
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 100); 

      return () => clearTimeout(timer);
    }
  }, [map]);

  return null; 
}


const DeliveryMap = ({ data }) => {
  const [map, setMap] = useState(null); 
  const validDeliveryLocations = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.filter(item =>
      item['Jenis Transaksi'] === 'Pemasukan' &&
      typeof item.Latitude === 'number' && item.Latitude !== null &&
      typeof item.Longitude === 'number' && item.Longitude !== null
    );
  }, [data]);

  const locationSummaryMap = useMemo(() => {
    const map = new Map();
    validDeliveryLocations.forEach(item => {
      const locationName = item.Order;
      if (!locationName || ['ganti oli', 'isi solar', 'servis mesin', 'perbaikan ban', 'cuci truk'].includes(locationName.toLowerCase())) {
        return;
      }
      if (!map.has(locationName)) {
        map.set(locationName, {
          name: locationName, latitude: item.Latitude, longitude: item.Longitude,
          totalVolume: 0, totalRevenue: 0, deliveryCount: 0
        });
      }
      const entry = map.get(locationName);
      entry.totalVolume += item['Volume (L)'] || 0;
      entry.totalRevenue += item.Pemasukan || 0;
      entry.deliveryCount += 1;
    });
    return map;
  }, [validDeliveryLocations]);

  const locationsData = useMemo(() => Array.from(locationSummaryMap.values()), [locationSummaryMap]);

  const top5LocationsByRevenue = useMemo(() => {
    return [...locationsData]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
  }, [locationsData]);
  if (locationsData.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Demografi Pengiriman & Sebaran Peta</h2>
        <div className="text-center p-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Tidak ada data lokasi pengiriman untuk ditampilkan.</p>
          <p className="text-sm text-gray-400">Coba ubah filter tanggal atau filter lainnya.</p>
        </div>
      </div>
    );
  }

  const centerLat = locationsData.reduce((sum, loc) => sum + loc.latitude, 0) / locationsData.length;
  const centerLng = locationsData.reduce((sum, loc) => sum + loc.longitude, 0) / locationsData.length;
  const initialCenter = [centerLat || -7.7956, centerLng || 110.3676];

  const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  const formatNumber = (number) => new Intl.NumberFormat('id-ID').format(number);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Demografi Pengiriman & Sebaran Peta</h2>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-700">Top 5 Lokasi (Berdasarkan Pendapatan)</h3>
        <ul className="list-disc list-inside text-gray-600">
          {top5LocationsByRevenue.map((loc, index) => (
            <li key={index} className="mb-1">
              <span className="font-semibold text-blue-700">{loc.name}:</span> {formatRupiah(loc.totalRevenue)} (Volume: {formatNumber(loc.totalVolume)} L)
            </li>
          ))}
        </ul>
      </div>
      <div className="w-full h-[500px] rounded-lg shadow-inner overflow-hidden">
        <MapContainer
          center={initialCenter}
          zoom={11}
          scrollWheelZoom={true}
          className="w-full h-full"
          whenCreated={setMap} 
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapRefresher map={map} /> 

          {locationsData.map((loc) => (
            <Marker key={loc.name} position={[loc.latitude, loc.longitude]}>
              <Popup>
                <div className="font-semibold text-gray-800">{loc.name}</div>
                <p>Total Pengiriman: {loc.deliveryCount}x</p>
                <p>Total Volume: {formatNumber(loc.totalVolume)} L</p>
                <p>Total Pendapatan: {formatRupiah(loc.totalRevenue)}</p>
              </Popup>
            </Marker>
          ))}
          {locationsData.map((loc) => {
            const radius = Math.sqrt(loc.totalVolume / 500);
            const maxVolume = top5LocationsByRevenue.length > 0 ? top5LocationsByRevenue[0].totalVolume : 1;
            const opacity = Math.min(0.7, (loc.totalVolume / maxVolume) * 0.8);
            return (
              <CircleMarker
                key={`circle-${loc.name}`}
                center={[loc.latitude, loc.longitude]}
                radius={Math.max(5, Math.min(25, radius))}
                pathOptions={{ color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: Math.max(0.2, opacity), weight: 1 }}
              />
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default DeliveryMap;
