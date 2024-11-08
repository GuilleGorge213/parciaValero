
import { OptionalId } from "mongodb";

/*

Título: Nombre del libro.
Autores: Lista de IDs de los autores del libro (cada autor se representa por su ID único).
Copias Disponibles: Número de copias disponibles en la biblioteca.

*/

export type LibroModel = OptionalId<{
    titulo: string,
    copiasDisponibles: number,
    autores: OptionalId[]
}>;

/*
Nombre Completo: Nombre completo del autor.
Biografía: Breve biografía del autor.
*/

export type AutorModel = OptionalId<{
    nombre: string,
    biografia: string
}>;
