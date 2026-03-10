import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';
  return window.localStorage.getItem('trello_clone_theme') || 'light';
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    createBoardOpen: false,
    activeCardId: null,
    boardMenuOpen: false,
    sidebarOpen: false,
    theme: getInitialTheme(),
  },
  reducers: {
    setCreateBoardOpen(state, action) {
      state.createBoardOpen = action.payload;
    },
    setActiveCardId(state, action) {
      state.activeCardId = action.payload;
    },
    setBoardMenuOpen(state, action) {
      state.boardMenuOpen = action.payload;
    },
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload;
    },
    setTheme(state, action) {
      state.theme = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const {
  setCreateBoardOpen,
  setActiveCardId,
  setBoardMenuOpen,
  setSidebarOpen,
  setTheme,
  toggleTheme,
} = uiSlice.actions;

export default uiSlice.reducer;
