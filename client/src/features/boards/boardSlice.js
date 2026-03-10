import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/client';
import { normalizeBoard } from './normalizeBoard';

const readStoredIds = (key) => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (_error) {
    return [];
  }
};

const persistIds = (key, ids) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(ids));
};

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

export const fetchBoardFull = createAsyncThunk('boards/fetchBoardFull', async (boardId, thunkAPI) => {
  try {
    const { data } = await api.get(`/boards/${boardId}/full`);
    return normalizeBoard(data.board);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch board');
  }
});

export const updateBoard = createAsyncThunk('boards/updateBoard', async ({ boardId, payload }, thunkAPI) => {
  try {
    const { data } = await api.put(`/boards/${boardId}`, payload);
    return data.board;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update board');
  }
});

export const createList = createAsyncThunk('boards/createList', async (payload, thunkAPI) => {
  try {
    const { data } = await api.post('/lists', payload);
    return data.list;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create list');
  }
});

export const updateList = createAsyncThunk('boards/updateList', async ({ listId, payload }, thunkAPI) => {
  try {
    const { data } = await api.put(`/lists/${listId}`, payload);
    return data.list;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update list');
  }
});

export const deleteList = createAsyncThunk('boards/deleteList', async ({ listId }, thunkAPI) => {
  try {
    await api.delete(`/lists/${listId}`);
    return { listId };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete list');
  }
});

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

export const updateCard = createAsyncThunk('boards/updateCard', async ({ cardId, payload }, thunkAPI) => {
  try {
    const { data } = await api.put(`/cards/${cardId}`, payload);
    return data.card;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update card');
  }
});

export const moveCard = createAsyncThunk('boards/moveCard', async ({ cardId, payload }, thunkAPI) => {
  try {
    await api.put(`/cards/${cardId}/move`, payload);
    return { cardId, payload };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to move card');
  }
});

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

export const updateComment = createAsyncThunk(
  'boards/updateComment',
  async ({ commentId, text }, thunkAPI) => {
    try {
      const { data } = await api.put(`/comments/${commentId}`, { text });
      return data.comment;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update comment');
    }
  },
);

export const deleteComment = createAsyncThunk(
  'boards/deleteComment',
  async ({ commentId, cardId }, thunkAPI) => {
    try {
      await api.delete(`/comments/${commentId}`);
      return { commentId, cardId };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete comment');
    }
  },
);

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

export const searchBoard = createAsyncThunk('boards/searchBoard', async ({ q, boardId }, thunkAPI) => {
  try {
    const { data } = await api.get('/search', { params: { q, boardId } });
    return data.results;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Search failed');
  }
});

const initialState = {
  boards: [],
  boardsMeta: null,
  currentBoard: null,
  status: 'idle',
  boardStatus: 'idle',
  error: null,
  searchResults: null,
  filters: {
    query: '',
    status: '',
    priority: '',
    memberId: '',
    dateRange: '',
    view: 'board',
  },
  recentBoardIds: readStoredIds('trello_clone_recent_boards'),
  favoriteBoardIds: readStoredIds('trello_clone_favorite_boards'),
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
      state.recentBoardIds = [boardId, ...state.recentBoardIds.filter((id) => id !== boardId)].slice(0, 10);
      persistIds('trello_clone_recent_boards', state.recentBoardIds);
    },
    toggleFavoriteBoard(state, action) {
      const boardId = action.payload;
      const exists = state.favoriteBoardIds.includes(boardId);
      state.favoriteBoardIds = exists
        ? state.favoriteBoardIds.filter((id) => id !== boardId)
        : [boardId, ...state.favoriteBoardIds].slice(0, 20);
      persistIds('trello_clone_favorite_boards', state.favoriteBoardIds);
    },
    optimisticReorderList(state, action) {
      if (!state.currentBoard) return;
      const { listId, position } = action.payload;
      const filtered = state.currentBoard.listOrder.filter((id) => id !== listId);
      filtered.splice(position, 0, listId);
      state.currentBoard.listOrder = filtered;
    },
    optimisticMoveCard(state, action) {
      if (!state.currentBoard) return;
      const { cardId, targetListId, targetPosition } = action.payload;
      const card = state.currentBoard.cardsById[cardId];
      if (!card || !state.currentBoard.listsById[targetListId]) return;

      const fromListId = card.listId;
      state.currentBoard.listsById[fromListId].cardIds = state.currentBoard.listsById[
        fromListId
      ].cardIds.filter((id) => id !== cardId);

      const targetIds = [...state.currentBoard.listsById[targetListId].cardIds];
      targetIds.splice(targetPosition, 0, cardId);
      state.currentBoard.listsById[targetListId].cardIds = targetIds;
      state.currentBoard.cardsById[cardId].listId = targetListId;
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
      .addCase(deleteList.fulfilled, (state, action) => {
        if (!state.currentBoard) return;
        const listId = action.payload.listId;
        const list = state.currentBoard.listsById[listId];
        if (!list) return;

        list.cardIds.forEach((cardId) => {
          delete state.currentBoard.cardsById[cardId];
        });
        delete state.currentBoard.listsById[listId];
        state.currentBoard.listOrder = state.currentBoard.listOrder.filter((id) => id !== listId);
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
        state.currentBoard.cardsById[card._id] = {
          ...card,
          commentsData: card.commentsData || [],
          checklists: card.checklists || [],
        };
        state.currentBoard.listsById[card.listId]?.cardIds.push(card._id);
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        if (!state.currentBoard) return;
        const currentCard = state.currentBoard.cardsById[action.payload._id] || {};
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
      .addCase(updateComment.fulfilled, (state, action) => {
        if (!state.currentBoard) return;
        const card = state.currentBoard.cardsById[action.payload.cardId];
        if (!card) return;
        card.commentsData = (card.commentsData || []).map((comment) =>
          comment._id === action.payload._id ? action.payload : comment,
        );
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        if (!state.currentBoard) return;
        const card = state.currentBoard.cardsById[action.payload.cardId];
        if (!card) return;
        card.commentsData = (card.commentsData || []).filter(
          (comment) => comment._id !== action.payload.commentId,
        );
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

export const {
  setFilters,
  clearSearchResults,
  pushRecentBoard,
  toggleFavoriteBoard,
  optimisticReorderList,
  optimisticMoveCard,
} = boardSlice.actions;

export default boardSlice.reducer;
