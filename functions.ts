import { Collection } from "mongodb";
import { AutorModel, LibroModel } from "./Model.ts";
import { Autor, Libro } from "./Dtos.ts";




export const fromLibroModelToDto = async (libroModel : LibroModel, autorCollection:  Collection<AutorModel> ) : Promise<Libro> => {
    const autores = await autorCollection.find({_id : {$in : libroModel.autores}}).toArray();
    return {
        id: libroModel._id?.toString(),
        titulo: libroModel.titulo,
        copias: libroModel.copias,
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