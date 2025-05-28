import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';
import { LoginGuard } from '../../../@security/guards/login.guard';

const routes: Routes = [
	{
		path: '',
		component: AuthComponent,
		children: [
			{
				path: '',
				redirectTo: 'login',
				pathMatch: 'full',
			},
{
				path: 'login',
				canActivate: [LoginGuard],
				data: { title: 'pageTitle.login' },
				component: LoginComponent
			},
      /*
			{
				path: 'change-password',
				canActivate: [LoginGuard],
				data: { title: 'pageTitle.changePassword' },
				loadChildren: (): Promise<typeof ChangePasswordModule> =>
					import('app/modules/auth/pages/change-password/change-password.module').then(
						(m) => m.ChangePasswordModule
					),
			},
			{
				path: 'forgot-password',
				canActivate: [LoginGuard],
				data: { title: 'pageTitle.forgotPassword' },
				loadChildren: (): Promise<typeof ForgotPasswordModule> =>
					import('app/modules/auth/pages/forgot-password/forgot-password.module').then(
						(m) => m.ForgotPasswordModule
					),
			},
			{
				path: 'confirm-forgot-password',
				canActivate: [LoginGuard],
				data: { title: 'pageTitle.confirmForgotPassword' },
				loadChildren: (): Promise<typeof ConfirmForgotPasswordModule> =>
					import(
						'app/modules/auth/pages/confirm-forgot-password/confirm-forgot-password.module'
					).then((m) => m.ConfirmForgotPasswordModule),
			},*/
		],
	},
	/*{
		path: 'confirmuser',
		data: { title: 'pageTitle.confirmUser' },
		loadChildren: (): Promise<typeof ConfirmUserModule> =>
			import('app/modules/auth/pages/confirm-user/confirm-user.module').then(
				(m) => m.ConfirmUserModule
			),
	},*/
];
@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class AuthRoutingModule {}
