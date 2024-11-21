
import { OptionalId } from "mongodb";


/*
Nombre Completo: Nombre completo del autor.
Biografía: Breve biografía del autor.
*/

export type tareaModel = OptionalId<{
    title: string,
    completed: boolean
}>;
