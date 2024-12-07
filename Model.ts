
import { ObjectId, OptionalId } from "mongodb";

export type userModel = OptionalId<{
    name: string,
    email: string,
    created_at: Date
}>;

export type projectModel = OptionalId<{
    name: string,
    description: string,
    start_date: Date,
    end_date: Date | null,
    user_id:  ObjectId 
}>;

export type taskModel = OptionalId<{
    title: string,
    description: string,
    status: string,
    created_at: Date,
    due_date: Date,
    project_id: ObjectId
}>;

