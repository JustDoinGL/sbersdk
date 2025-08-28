import { createAsyncThunk } from '@reduxjs/toolkit';
import { QueryParams, ApiResponse } from './types';
import { RootState } from './store';

// Mock API функция (замените на реальный API вызов)
const mockApiCall = async (params: QueryParams): Promise<ApiResponse> => {
  // Имитация задержки сети
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock данные
  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
  ];

  return {
    users: mockUsers,
    totalCount: 100
  };
};

// Реальный API вызов с использованием axios (раскомментируйте если нужно)
/*
import axios from 'axios';

const fetchUsersFromAPI = async (params: QueryParams): Promise<ApiResponse> => {
  const response = await axios.get('/api/users', { params });
  return response.data;
};
*/

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const queryParams = state.users.queryParams;
      
      // Используем mock вызов, замените на реальный API
      const response = await mockApiCall(queryParams);
      
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Неизвестная ошибка'
      );
    }
  }
);


///:///
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UsersState, QueryParams, User } from './types';
import { fetchUsers } from './usersThunk';

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
  queryParams: {
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'name'
  },
  totalCount: 0
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setQueryParams: (state, action: PayloadAction<Partial<QueryParams>>) => {
      state.queryParams = { ...state.queryParams, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    resetUsers: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.users = [];
      });
  }
});

export const { setQueryParams, clearError, resetUsers } = usersSlice.actions;
export default usersSlice.reducer;







export interface User {
  id: number;
  name: string;
  email: string;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
}

export interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  queryParams: QueryParams;
  totalCount: number;
}

export interface ApiResponse {
  users: User[];
  totalCount: number;
}


