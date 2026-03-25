import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isModalOpen: false,
  target: null, // The cluster being analyzed
  data: null,   // The analysis results
  loading: false,
  error: null,
};

const deepDiveSlice = createSlice({
  name: 'deepDive',
  initialState,
  reducers: {
    openDeepDiveModal: (state, action) => {
      state.isModalOpen = true;
      if (action.payload) state.target = action.payload;
    },
    closeDeepDiveModal: (state) => {
      state.isModalOpen = false;
      state.target = null;
      state.data = null;
      state.loading = false;
    },
    setDeepDiveTarget: (state, action) => {
      state.target = action.payload;
    },
    setDeepDiveData: (state, action) => {
      state.data = action.payload;
    },
    setDeepDiveLoading: (state, action) => {
      state.loading = action.payload;
    },
    setDeepDiveError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  },
});

export const { 
  openDeepDiveModal, 
  closeDeepDiveModal, 
  setDeepDiveTarget, 
  setDeepDiveData, 
  setDeepDiveLoading,
  setDeepDiveError 
} = deepDiveSlice.actions;

export default deepDiveSlice.reducer;
