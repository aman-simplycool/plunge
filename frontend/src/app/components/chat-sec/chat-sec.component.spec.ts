import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatSecComponent } from './chat-sec.component';

describe('ChatSecComponent', () => {
  let component: ChatSecComponent;
  let fixture: ComponentFixture<ChatSecComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatSecComponent]
    });
    fixture = TestBed.createComponent(ChatSecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
