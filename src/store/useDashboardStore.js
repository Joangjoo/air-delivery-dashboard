import { create } from 'zustand';

const useDashboardStore = create((set, get) => ({
  startDate: null,
  endDate: null,
  selectedDriver: 'All',
  selectedArmada: 'All',
  selectedLocation: 'All',
  driverOptions: ['All'],
  armadaOptions: ['All'],
  locationOptions: ['All'],
  filteredData: [],
  setFilteredData: (data) => set({ filteredData: data }),
  setStartDate: (date) => set({ startDate: date }),
  setEndDate: (date) => set({ endDate: date }),
  setSelectedDriver: (driver) => set({ selectedDriver: driver }),
  setSelectedArmada: (armada) => set({ selectedArmada: armada }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  initializeDateRange: (data) => {
    if (get().startDate === null && data.length > 0) {
      const validDates = data
        .map(item => item.Tanggal)
        .filter(date => date instanceof Date && !isNaN(date.getTime()));

      if (validDates.length > 0) {
        const minDate = new Date(Math.min(...validDates));
        const maxDate = new Date(Math.max(...validDates));
        set({ startDate: minDate, endDate: maxDate });
      }
    }
  },
  setFilterOptions: (data) => {
    if (get().driverOptions.length === 1 && data.length > 0) {
      const drivers = ['All', ...new Set(data.map(item => item.Sopir).filter(Boolean))];
      const armadas = ['All', ...new Set(data.map(item => item['Plat Nomor']).filter(Boolean))];
      const locations = ['All', ...new Set(data.filter(item => item['Jenis Transaksi'] === 'Pemasukan').map(item => item.Order).filter(Boolean))];

      set({
        driverOptions: drivers.sort(),
        armadaOptions: armadas.sort(),
        locationOptions: locations.sort(),
      });
    }
  },
}));

export default useDashboardStore;
