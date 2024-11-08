
/*

Título: Nombre del libro.
Autores: Lista de IDs de los autores del libro (cada autor se representa por su ID único).
Copias Disponibles: Número de copias disponibles en la biblioteca.

*/

export type Libro = {
    id: string,
    titulo: string,
    copias: number,
    autores: Autor[]
}

/*
Nombre Completo: Nombre completo del autor.
Biografía: Breve biografía del autor.
*/

export type Autor = {
    id: string,
    nombre: string,
    biografia: string
}