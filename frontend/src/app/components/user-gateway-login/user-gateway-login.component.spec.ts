import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGatewayLoginComponent } from './user-gateway-login.component';

describe('UserGatewayLoginComponent', () => {
  let component: UserGatewayLoginComponent;
  let fixture: ComponentFixture<UserGatewayLoginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserGatewayLoginComponent]
    });
    fixture = TestBed.createComponent(UserGatewayLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
