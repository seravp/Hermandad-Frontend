import { MatPaginatorIntl } from '@angular/material/paginator';

export function getSpanishPaginatorIntl(): MatPaginatorIntl {
  const paginatorIntl = new MatPaginatorIntl();

  paginatorIntl.itemsPerPageLabel = 'Elementos por página:';

  paginatorIntl.nextPageLabel = 'Página siguiente';

  paginatorIntl.previousPageLabel = 'Página anterior';

  paginatorIntl.firstPageLabel = 'Primera página';

  paginatorIntl.lastPageLabel = 'Última página';

  paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }

    const startIndex = page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, length);

    return `${startIndex + 1} - ${endIndex} de ${length}`;
  };

  return paginatorIntl;
}
