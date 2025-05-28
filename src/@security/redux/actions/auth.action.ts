
import { createAction, props } from '@ngrx/store';
import { User } from '../../../app/shared/models/auth/auth.interface';

export const loginAction = createAction('[Login Action]', props<{ token: string }>());
export const insertUserLogin = createAction('[InsertUser Action]', props<{ user: User }>());
export const loadAction = createAction('[Load Action]');
export const loadingAction = createAction('[Loading Action]');
export const cancelLoadingAction = createAction('[Cancel Loading Action]');
export const logoutAction = createAction('[Logout Action]');
export const resetStateUserAction = createAction('[Reset State User Action');
export const verifyAuthAction = createAction('[Verify Action]', props<{user: User}>());
