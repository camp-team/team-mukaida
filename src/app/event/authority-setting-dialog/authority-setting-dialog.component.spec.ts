import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthoritySettingDialogComponent } from './authority-setting-dialog.component';

describe('AuthoritySettingDialogComponent', () => {
  let component: AuthoritySettingDialogComponent;
  let fixture: ComponentFixture<AuthoritySettingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AuthoritySettingDialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthoritySettingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
