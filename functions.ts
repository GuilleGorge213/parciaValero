import { Collection } from "mongodb";
import { tareaDTO } from "./Dtos.ts";
import { tareaModel } from "./Model.ts";



export const fromTaskModelToTaskDTO = (tareaModel: tareaModel) : tareaDTO => {
    return {
        id : tareaModel._id?.toString(),
        title: tareaModel.title,
        completed: tareaModel.completed
    }
}



