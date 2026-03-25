import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  projects: [],
  isModalOpen: false,
  clusterToSave: null,
  loading: false,
  error: null,
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action) => {
      state.projects = action.payload;
    },
    openProjectModal: (state, action) => {
      state.isModalOpen = true;
      state.clusterToSave = action.payload || null;
    },
    closeProjectModal: (state) => {
      state.isModalOpen = false;
      state.clusterToSave = null;
    },
    addProject: (state, action) => {
      state.projects.unshift(action.payload);
    },
    removeProject: (state, action) => {
      state.projects = state.projects.filter(p => p._id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  },
});

export const { 
  setProjects, 
  openProjectModal, 
  closeProjectModal, 
  addProject, 
  removeProject,
  setLoading,
  setError 
} = projectSlice.actions;

export default projectSlice.reducer;
