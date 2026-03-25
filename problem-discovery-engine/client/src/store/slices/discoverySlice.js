import { createSlice } from '@reduxjs/toolkit';

const ALL_SOURCES = ['Reddit', 'Hacker News', 'X', 'Product Hunt'];

const initialState = {
  keyword: '',
  selectedSources: ALL_SOURCES,
  clusters: [],
  loading: false,
  error: null,
};

const discoverySlice = createSlice({
  name: 'discovery',
  initialState,
  reducers: {
    setKeyword: (state, action) => {
      state.keyword = action.payload;
    },
    toggleSource: (state, action) => {
      const source = action.payload;
      if (state.selectedSources.includes(source)) {
        if (state.selectedSources.length > 1) {
          state.selectedSources = state.selectedSources.filter(s => s !== source);
        }
      } else {
        state.selectedSources.push(source);
      }
    },
    setDiscoveryStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    setDiscoverySuccess: (state, action) => {
      state.loading = false;
      state.clusters = action.payload;
    },
    setDiscoveryFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateClusters: (state, action) => {
       state.clusters = action.payload;
    }
  },
});

export const { 
  setKeyword, 
  toggleSource, 
  setDiscoveryStart, 
  setDiscoverySuccess, 
  setDiscoveryFailure,
  updateClusters 
} = discoverySlice.actions;

export default discoverySlice.reducer;
