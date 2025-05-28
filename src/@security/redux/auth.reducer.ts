import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import { UserState } from "../interfaces/UserState";
import { ActionReducerMap } from '@ngrx/store';
import { loginReducer } from './reducers/auth.reducer';



export interface AuthState {
  userState: UserState;
  router: RouterReducerState;
}

export const securityReducer : ActionReducerMap<AuthState> = {
  userState: loginReducer,
  router: routerReducer
};
