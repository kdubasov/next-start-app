import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ILayout {
  isAuth: boolean;
}

const initialState: ILayout = {
  isAuth: true,
};

export const layout = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    setIsAuth: (state, action: PayloadAction<boolean>) => {
      state.isAuth = action.payload;
    },
  },
});

export const { setIsAuth } = layout.actions;
export default layout.reducer;
