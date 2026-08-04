import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Listado } from './listado';

describe('Listado', () => {
  let component: Listado;
  let fixture: ComponentFixture<Listado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Listado],
    }).compileComponents();

    fixture = TestBed.createComponent(Listado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
