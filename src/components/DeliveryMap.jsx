import React, { useMemo } from 'react'; // Pastikan useMemo diimpor
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


const DeliveryMap = ({ data }) => {
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
      if (!locationName || locationName.toLowerCase().includes('oli') || locationName.toLowerCase().includes('solar') || locationName.toLowerCase().includes('servis') || locationName.toLowerCase().includes('ban') || locationName.toLowerCase().includes('truk') || locationName.toLowerCase().includes('cuci')) {
          return; 
      }

      if (!map.has(locationName)) {
        map.set(locationName, {
          name: locationName,
          latitude: item.Latitude,
          longitude: item.Longitude,
          totalVolume: 0,
          totalRevenue: 0,
          deliveryCount: 0
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
      return locationsData
          .slice() 
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .slice(0, 5);
  }, [locationsData]); 

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">3 & 6. Demografi Pengiriman Air & Sebaran Peta</h2>
        <p className="text-gray-600">Tidak ada data untuk ditampilkan.</p>
      </div>
    );
  }


  if (locationsData.length === 0) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">3 & 6. Demografi Pengiriman Air & Sebaran Peta</h2>
          <p className="text-gray-600">Tidak ada lokasi pengiriman air yang valid dengan koordinat untuk ditampilkan di peta setelah filtering.</p>
        </div>
      );
  }

  const centerLat = locationsData.reduce((sum, loc) => sum + loc.latitude, 0) / locationsData.length;
  const centerLng = locationsData.reduce((sum, loc) => sum + loc.longitude, 0) / locationsData.length;
  const initialCenter = [centerLat || -7.7956, centerLng || 110.3676]; 

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
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">3 & 6. Demografi Pengiriman Air & Sebaran Peta</h2>

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

      <div className="w-full flex-grow relative" style={{ minHeight: '400px' }}>
        <MapContainer
          center={initialCenter}
          zoom={10}
          scrollWheelZoom={true}
          className="w-full h-full rounded-lg shadow-inner"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {locationsData.map((loc, index) => (
            <Marker key={index} position={[loc.latitude, loc.longitude]}>
              <Popup>
                <div className="font-semibold text-gray-800">{loc.name}</div>
                <p className="text-sm text-gray-700">Total Pengiriman: {loc.deliveryCount} kali</p>
                <p className="text-sm text-gray-700">Total Volume: {formatNumber(loc.totalVolume)} L</p>
                <p className="text-sm text-gray-700">Total Pendapatan: {formatRupiah(loc.totalRevenue)}</p>
              </Popup>
            </Marker>
          ))}

          {locationsData.map((loc, index) => {
              const radius = Math.sqrt(loc.totalVolume / 1000) * 3;
              const maxVolume = top5LocationsByRevenue.length > 0 ? top5LocationsByRevenue[0].totalVolume : 1;
              const opacity = Math.min(0.8, loc.totalVolume / maxVolume);

              return (
                  <CircleMarker
                      key={`circle-${index}`}
                      center={[loc.latitude, loc.longitude]}
                      radius={Math.max(5, Math.min(20, radius))}
                      pathOptions={{
                          color: '#ff7800',
                          fillColor: '#fe8d36',
                          fillOpacity: Math.max(0.3, Math.min(0.7, opacity)),
                          weight: 1
                      }}
                  >
                      <Popup>
                          <div className="font-semibold text-gray-800">{loc.name}</div>
                          <p className="text-sm text-gray-700">Total Volume: {formatNumber(loc.totalVolume)} L</p>
                      </Popup>
                  </CircleMarker>
              );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default DeliveryMap;