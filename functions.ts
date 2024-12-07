import { projectDTO, taskDTO, userDTO } from "./Dtos.ts";
import { projectModel, taskModel, userModel } from "./Model.ts";

export const fromUserModelToDto = (userModel: userModel): userDTO => ({
    id: userModel._id!.toString(),
    name: userModel.name,
    email: userModel.email,
    created_at: userModel.created_at
  });

  export const fromProjectModelToDto = (projectModel: projectModel): projectDTO => ({
    id: projectModel._id!.toString(),
    description: projectModel.description,
    start_date: projectModel.start_date,
    end_date: projectModel.end_date,
    user_id: projectModel.user_id
  });


  export const fromTaskModelToDto = (taskModel: taskModel): taskDTO => ({
    id: taskModel._id!.toString(),
    title: taskModel.title,
    description: taskModel.description,
    status: taskModel.status,
    created_at: taskModel.created_at,
    due_date: taskModel.due_date,
    project_id: taskModel.project_id
  });



