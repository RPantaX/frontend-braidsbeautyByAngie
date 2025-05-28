import { createSelector } from "@ngrx/store";
import { SecurityState } from "../../interfaces/SecurityState";
import { UserState } from "../../interfaces/UserState";


export const selectAuthState = (state: SecurityState): UserState => state.userState;

export const isLoadingLogin = createSelector(selectAuthState, (userState) => userState.isLoading);

export const isLoadLogin = createSelector(selectAuthState, (userState) => userState.isLoad);

export const currentUser = createSelector(selectAuthState, (userState) => userState.user);
