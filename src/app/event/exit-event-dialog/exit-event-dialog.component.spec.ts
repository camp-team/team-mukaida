import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExitEventDialogComponent } from './exit-event-dialog.component';

describe('ExitEventDialogComponent', () => {
  let component: ExitEventDialogComponent;
  let fixture: ComponentFixture<ExitEventDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExitEventDialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExitEventDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
