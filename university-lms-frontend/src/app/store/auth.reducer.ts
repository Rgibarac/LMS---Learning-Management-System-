import { createReducer, on } from '@ngrx/store';
import { User } from '../core/models/user.model';
import { loginSuccess, logout } from './auth.actions';

export interface AuthState {
  user: User | null;
}

export const initialState: AuthState = {
  user: null
};

export const authReducer = createReducer(
  initialState,
  on(loginSuccess, (state, { user }) => ({ ...state, user })),
  on(logout, state => ({ ...state, user: null }))
);