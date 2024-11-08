import { Collection } from "mongodb";
import { Autor, AutorInserted, Libro } from "./Dtos.ts";
import { AutorModel, LibroModel } from "./Model.ts";




export const fromLibroModelToDto = async (libroModel : LibroModel, autorCollection:  Collection<AutorModel> ) : Promise<Libro> => {
    const autores = await autorCollection.find({_id : {$in : libroModel.autores}}).toArray();
    return {
        id: libroModel._id?.toString(),
        titulo: libroModel.titulo,
        copiasDisponibles: libroModel.copiasDisponibles,
        autores: autores.map((u) => fromAutorModelToDto(u))
    }
}

export const fromAutorModelToDto = (autorModel: AutorModel) : Autor => {
    return {
        id : autorModel._id?.toString(),
        nombre: autorModel.nombre,
        biografia: autorModel.biografia
    }
}

export const fromAutorToDtoReturned = (autorModel: AutorModel) : AutorInserted => {
    return {
        id : autorModel._id?.toString(),
        nombre: autorModel.nombre,
    }
}

