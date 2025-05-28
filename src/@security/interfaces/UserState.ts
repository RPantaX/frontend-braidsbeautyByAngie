import { User } from "../../app/shared/models/auth/auth.interface";

export interface UserState {
	user: User;
	isLoading: boolean;
	isLoad: boolean;
}
