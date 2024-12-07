
/*

Título: Nombre del libro.
Autores: Lista de IDs de los autores del libro (cada autor se representa por su ID único).
Copias Disponibles: Número de copias disponibles en la biblioteca.

*/

export type userDTO = {
    id: string,
    name: string,
    email: string,
    created_at: Date
}

export type projectDTO = {
    id: string,
    description: string,
    start_date: Date,
    end_date: Date | null,
    user_id: string
}

export type taskDTO = {
    id: string,
    title: string,
    description: string,
    status: string,
    created_at: Date,
    due_date: Date,
    project_id: string 
}





