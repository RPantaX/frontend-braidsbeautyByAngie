import { createReducer, on } from "@ngrx/store";
import { UserState } from "../../interfaces/UserState";
import { User } from '../../../app/shared/models/auth/auth.interface';

import { cancelLoadingAction,
  insertUserLogin,
  loadAction,
  loadingAction,
  loginAction,
  logoutAction,
  resetStateUserAction,
  verifyAuthAction } from "../actions/auth.action";


export const userInitialState: UserState = {
  user : <User>{},
  isLoading: false,
  isLoad: false,
};

export const loginReducer = createReducer(
  userInitialState,
  on(loginAction, (state) => ({ ...state, isLoading: true, isLoad: false })),
  on(loadingAction, (state) => ({ ...state, isLoading: true, isLoad: false })),
  on(insertUserLogin, (state, { user }) => ({ ...state, user: { ...user } })),
  on(loadAction, (state) => ({ ...state, isLoading: false, isLoad: true })),
  on(cancelLoadingAction, (state) => ({ ...state, isLoading: false})),
  on(logoutAction, (state) => ({ ...state})),
  on(resetStateUserAction, (state) => ({ ...state, ...userInitialState })),
	on(verifyAuthAction, (state) => ({ ...state }))
);
