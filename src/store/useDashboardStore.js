import { create } from 'zustand';
const getMinMaxDates = (data) => {
    const dates = data
        .filter(item => item.Tanggal instanceof Date && !isNaN(item.Tanggal.getTime()))
        .map(item => item.Tanggal.getTime()); 

    if (dates.length === 0) {
        return { minDate: null, maxDate: null };
    }

    const min = new Date(Math.min(...dates));
    const max = new Date(Math.max(...dates));

    min.setHours(0, 0, 0, 0);
    max.setHours(23, 59, 59, 999);

    return { minDate: min, maxDate: max };
};

const useDashboardStore = create((set) => ({
  startDate: null,
  endDate: null,
  selectedDriver: 'All', 
  selectedArmada: 'All', 
  selectedLocation: 'All', 

  setStartDate: (date) => set({ startDate: date }),
  setEndDate: (date) => set({ endDate: date }),
  setSelectedDriver: (driver) => set({ selectedDriver: driver }),
  setSelectedArmada: (armada) => set({ selectedArmada: armada }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),

  filteredData: [],
  setFilteredData: (data) => set({ filteredData: data }),

  initializeDateRange: (data) => {
    const { minDate, maxDate } = getMinMaxDates(data);
    if (minDate && maxDate) {
      set({
        startDate: minDate,
        endDate: maxDate,
      });
    }
  },

  driverOptions: ['All'],
  armadaOptions: ['All'],
  locationOptions: ['All'],
  setFilterOptions: (data) => {
    const drivers = ['All', ...new Set(data.map(item => item.Sopir).filter(Boolean).sort())];
    const armadas = ['All', ...new Set(data.map(item => item['Plat Nomor']).filter(Boolean).sort())];
    // Filter lokasi agar hanya yang relevan dengan pengiriman (bukan pengeluaran)
    const locations = ['All', ...new Set(
        data.filter(item =>
            item['Jenis Transaksi'] === 'Pemasukan' &&
            item.Order &&
            !item.Order.toLowerCase().includes('oli') &&
            !item.Order.toLowerCase().includes('solar') &&
            !item.Order.toLowerCase().includes('servis') &&
            !item.Order.toLowerCase().includes('ban') &&
            !item.Order.toLowerCase().includes('truk') &&
            !item.Order.toLowerCase().includes('cuci')
        ).map(item => item.Order).filter(Boolean).sort()
    )];
    set({ driverOptions: drivers, armadaOptions: armadas, locationOptions: locations });
  }
}));

export default useDashboardStore;