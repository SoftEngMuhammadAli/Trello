import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/client';
import { normalizeBoard } from './normalizeBoard';

export const fetchBoards = createAsyncThunk('boards/fetchBoards', async (params, thunkAPI) => {
  try {
    const { data } = await api.get('/boards', { params });
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch boards');
  }
});

export const createBoard = createAsyncThunk('boards/createBoard', async (payload, thunkAPI) => {
  try {
    const { data } = await api.post('/boards', payload);
    return data.board;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create board');
  }
});

export const fetchBoardFull = createAsyncThunk(
  'boards/fetchBoardFull',
  async (boardId, thunkAPI) => {
    try {
      const { data } = await api.get(`/boards/${boardId}/full`);
      return normalizeBoard(data.board);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch board');
    }
  },
);

export const updateBoard = createAsyncThunk(
  'boards/updateBoard',
  async ({ boardId, payload }, thunkAPI) => {
    try {
      const { data } = await api.put(`/boards/${boardId}`, payload);
      return data.board;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update board');
    }
  },
);

export const createList = createAsyncThunk('boards/createList', async (payload, thunkAPI) => {
  try {
    const { data } = await api.post('/lists', payload);
    return data.list;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create list');
  }
});

export const updateList = createAsyncThunk(
  'boards/updateList',
  async ({ listId, payload }, thunkAPI) => {
    try {
      const { data } = await api.put(`/lists/${listId}`, payload);
      return data.list;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update list');
    }
  },
);

export const reorderList = createAsyncThunk(
  'boards/reorderList',
  async ({ listId, position, boardId }, thunkAPI) => {
    try {
      await api.put(`/lists/${listId}/position`, { position });
      return { listId, position, boardId };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to reorder list');
    }
  },
);

export const createCard = createAsyncThunk('boards/createCard', async (payload, thunkAPI) => {
  try {
    const { data } = await api.post('/cards', payload);
    return data.card;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create card');
  }
});

export const updateCard = createAsyncThunk(
  'boards/updateCard',
  async ({ cardId, payload }, thunkAPI) => {
    try {
      const { data } = await api.put(`/cards/${cardId}`, payload);
      return data.card;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update card');
    }
  },
);

export const moveCard = createAsyncThunk(
  'boards/moveCard',
  async ({ cardId, payload }, thunkAPI) => {
    try {
      await api.put(`/cards/${cardId}/move`, payload);
      return { cardId, payload };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to move card');
    }
  },
);

export const deleteCard = createAsyncThunk('boards/deleteCard', async (cardId, thunkAPI) => {
  try {
    await api.delete(`/cards/${cardId}`);
    return cardId;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete card');
  }
});

export const createComment = createAsyncThunk('boards/createComment', async (payload, thunkAPI) => {
  try {
    const { data } = await api.post('/comments', payload);
    return data.comment;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to add comment');
  }
});

export const uploadAttachment = createAsyncThunk(
  'boards/uploadAttachment',
  async ({ cardId, file }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post(`/cards/${cardId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { cardId, attachment: data.attachment };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to upload file');
    }
  },
);

export const searchBoard = createAsyncThunk(
  'boards/searchBoard',
  async ({ q, boardId }, thunkAPI) => {
    try {
      const { data } = await api.get('/search', { params: { q, boardId } });
      return data.results;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  },
);

const initialState = {
  boards: [],
  boardsMeta: null,
  currentBoard: null,
  status: 'idle',
  boardStatus: 'idle',
  error: null,
  searchResults: null,
  filters: {
    memberId: '',
    labelColor: '',
    query: '',
  },
  recentBoardIds: [],
};

const boardSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSearchResults(state) {
      state.searchResults = null;
    },
    pushRecentBoard(state, action) {
      const boardId = action.payload;
      state.recentBoardIds = [
        boardId,
        ...state.recentBoardIds.filter((id) => id !== boardId),
      ].slice(0, 8);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const firstPage = action.payload.meta?.page === 1;
        state.boards = firstPage ? action.payload.data : [...state.boards, ...action.payload.data];
        state.boardsMeta = action.payload.meta;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.boards.unshift(action.payload);
      })
      .addCase(fetchBoardFull.pending, (state) => {
        state.boardStatus = 'loading';
      })
      .addCase(fetchBoardFull.fulfilled, (state, action) => {
        state.boardStatus = 'succeeded';
        state.currentBoard = action.payload;
      })
      .addCase(fetchBoardFull.rejected, (state, action) => {
        state.boardStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(updateBoard.fulfilled, (state, action) => {
        if (!state.currentBoard || state.currentBoard._id !== action.payload._id) return;
        state.currentBoard = { ...state.currentBoard, ...action.payload };
      })
      .addCase(createList.fulfilled, (state, action) => {
        if (!state.currentBoard) return;
        state.currentBoard.listsById[action.payload._id] = {
          ...action.payload,
          cardIds: [],
        };
        state.currentBoard.listOrder.push(action.payload._id);
      })
      .addCase(updateList.fulfilled, (state, action) => {
        if (!state.currentBoard || !state.currentBoard.listsById[action.payload._id]) return;
        state.currentBoard.listsById[action.payload._id] = {
          ...state.currentBoard.listsById[action.payload._id],
          ...action.payload,
        };
      })
      .addCase(reorderList.fulfilled, (state, action) => {
        if (!state.currentBoard) return;
        const filtered = state.currentBoard.listOrder.filter((id) => id !== action.payload.listId);
        filtered.splice(action.payload.position, 0, action.payload.listId);
        state.currentBoard.listOrder = filtered;
      })
      .addCase(createCard.fulfilled, (state, action) => {
        if (!state.currentBoard) return;
        const card = action.payload;
        state.currentBoard.cardsById[card._id] = { ...card, commentsData: [] };
        state.currentBoard.listsById[card.listId]?.cardIds.push(card._id);
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        if (!state.currentBoard) return;
        const currentCard = state.currentBoard.cardsById[action.payload._id];
        state.currentBoard.cardsById[action.payload._id] = {
          ...currentCard,
          ...action.payload,
        };
      })
      .addCase(moveCard.fulfilled, (state, action) => {
        if (!state.currentBoard) return;
        const card = state.currentBoard.cardsById[action.payload.cardId];
        if (!card) return;

        const fromListId = card.listId;
        const toListId = action.payload.payload.targetListId;
        const toIndex = action.payload.payload.targetPosition;

        state.currentBoard.listsById[fromListId].cardIds = state.currentBoard.listsById[
          fromListId
        ].cardIds.filter((id) => id !== card._id);

        const toListCards = [...state.currentBoard.listsById[toListId].cardIds];
        toListCards.splice(toIndex, 0, card._id);
        state.currentBoard.listsById[toListId].cardIds = toListCards;
        state.currentBoard.cardsById[card._id].listId = toListId;
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        if (!state.currentBoard) return;
        const card = state.currentBoard.cardsById[action.payload];
        if (!card) return;
        state.currentBoard.listsById[card.listId].cardIds = state.currentBoard.listsById[
          card.listId
        ].cardIds.filter((id) => id !== action.payload);
        delete state.currentBoard.cardsById[action.payload];
      })
      .addCase(createComment.fulfilled, (state, action) => {
        if (!state.currentBoard) return;
        const card = state.currentBoard.cardsById[action.payload.cardId];
        if (!card) return;
        card.commentsData = [action.payload, ...(card.commentsData || [])];
      })
      .addCase(uploadAttachment.fulfilled, (state, action) => {
        if (!state.currentBoard) return;
        const card = state.currentBoard.cardsById[action.payload.cardId];
        if (!card) return;
        card.attachments = [...(card.attachments || []), action.payload.attachment];
      })
      .addCase(searchBoard.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      });
  },
});

export const { setFilters, clearSearchResults, pushRecentBoard } = boardSlice.actions;
export default boardSlice.reducer;
