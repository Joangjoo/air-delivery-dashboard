import React from 'react';
import useDashboardStore from '../store/useDashboardStore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; 
import { id } from 'date-fns/locale'; 

const FilterBar = () => {
  const {
    startDate,
    endDate,
    selectedDriver,
    selectedArmada,
    selectedLocation,
    setStartDate,
    setEndDate,
    setSelectedDriver,
    setSelectedArmada,
    setSelectedLocation,
    driverOptions,
    armadaOptions,
    locationOptions,
  } = useDashboardStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rentang Tanggal:</label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Tanggal Mulai"
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          dateFormat="dd/MM/yyyy"
          locale={id} 
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          placeholderText="Tanggal Akhir"
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-2"
          dateFormat="dd/MM/yyyy"
          locale={id} 
        />
      </div>

      <div>
        <label htmlFor="driver-select" className="block text-sm font-medium text-gray-700 mb-1">Sopir:</label>
        <select
          id="driver-select"
          value={selectedDriver}
          onChange={(e) => setSelectedDriver(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          {driverOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="armada-select" className="block text-sm font-medium text-gray-700 mb-1">Armada:</label>
        <select
          id="armada-select"
          value={selectedArmada}
          onChange={(e) => setSelectedArmada(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          {armadaOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="location-select" className="block text-sm font-medium text-gray-700 mb-1">Lokasi:</label>
        <select
          id="location-select"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          {locationOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterBar;