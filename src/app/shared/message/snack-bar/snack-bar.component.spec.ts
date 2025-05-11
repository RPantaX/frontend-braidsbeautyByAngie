import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule, MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

import { SnackBarComponent } from './snack-bar.component';

describe('SnackBarComponent', () => {
	let component: SnackBarComponent;
	let fixture: ComponentFixture<SnackBarComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [SnackBarComponent],
			imports: [MatSnackBarModule],
			providers: [
				{ provide: MatSnackBarRef, useValue: {} },
				{ provide: MAT_SNACK_BAR_DATA, useValue: {} },
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(SnackBarComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
