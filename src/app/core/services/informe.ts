import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InformeService {
  private readonly http = inject(HttpClient);

  generarCartaMoroso(hermanoId: number): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/informes/carta-moroso/${hermanoId}`, {
      responseType: 'blob',
    });
  }
}
