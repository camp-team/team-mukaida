import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultEventComponent } from './default-event.component';

describe('DefaultEventComponent', () => {
  let component: DefaultEventComponent;
  let fixture: ComponentFixture<DefaultEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DefaultEventComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
