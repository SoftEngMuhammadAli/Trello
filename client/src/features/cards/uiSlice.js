import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    createBoardOpen: false,
    activeCardId: null,
    boardMenuOpen: false,
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
  },
});

export const { setCreateBoardOpen, setActiveCardId, setBoardMenuOpen } = uiSlice.actions;

export default uiSlice.reducer;
