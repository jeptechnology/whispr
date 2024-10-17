import { configureStore } from '@reduxjs/toolkit'
import supportPackageReducer from './api/SupportPackage'
import { enableMapSet } from 'immer';
import { useDispatch, useSelector } from 'react-redux';

enableMapSet();

export const store = configureStore({
  reducer: {
    supportPackage: supportPackageReducer
  }
})

// Infer the `RootState`,  `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>()
