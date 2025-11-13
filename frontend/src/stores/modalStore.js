// ============================================
// MODAL STORE - Zustand
// Quản lý state cho các modal lồng nhau
// ============================================

import { create } from 'zustand';

const useModalStore = create((set) => ({
  // State của tất cả modals
  modals: {
    customer: { open: false, data: null },
    vehicle: { open: false, data: null },
    payment: { open: false, data: null },
    bienso: { open: false, data: null },
    assessment: { open: false, data: null },
    contract: { open: false, data: null },
  },
  
  // Mở modal với optional data
  openModal: (modalName, data = null) => set((state) => ({
    modals: {
      ...state.modals,
      [modalName]: { open: true, data }
    }
  })),
  
  // Đóng modal và clear data
  closeModal: (modalName) => set((state) => ({
    modals: {
      ...state.modals,
      [modalName]: { open: false, data: null }
    }
  })),
  
  // Đóng tất cả modal (dùng khi cần reset)
  closeAllModals: () => set({
    modals: {
      customer: { open: false, data: null },
      vehicle: { open: false, data: null },
      payment: { open: false, data: null },
      bienso: { open: false, data: null },
      assessment: { open: false, data: null },
      contract: { open: false, data: null },
    }
  }),
}));

export default useModalStore;
