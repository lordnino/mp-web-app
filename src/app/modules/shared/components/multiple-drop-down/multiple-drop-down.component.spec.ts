import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleDropDownComponent } from './multiple-drop-down.component';

describe('MultipleDropDownComponent', () => {
  let component: MultipleDropDownComponent;
  let fixture: ComponentFixture<MultipleDropDownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultipleDropDownComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MultipleDropDownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
