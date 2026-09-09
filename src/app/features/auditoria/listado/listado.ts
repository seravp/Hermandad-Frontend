import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { HermanoService } from '../../../core/services/hermano';
import { Hermano } from '../../../core/models/hermanos/hermano';

@Component({
  selector: 'app-listado',
  standalone: true,
  templateUrl: './listado.html',
  styleUrl: './listado.css',
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule],
})
export class ListadoComponent implements OnInit {
  private hermanoService = inject(HermanoService);

  hermanos: Hermano[] = [];

  displayedColumns = ['numeroHermano', 'nombre', 'apellidos', 'dni', 'estado', 'acciones'];

  ngOnInit(): void {
    this.hermanoService.buscar().subscribe({
      next: (page) => {
        this.hermanos = page.content;
      },
    });
  }
}
