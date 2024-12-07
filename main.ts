import { MongoClient, ObjectId } from "mongodb";
import { projectModel, taskModel, userModel } from "./Model.ts";
import { fromProjectModelToDto, fromTaskModelToDto, fromUserModelToDto } from "./functions.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");
if (!MONGO_URL) {
    console.error("MONGO_URL uri not set on .env");
    Deno.exit(1);
}

const client = new MongoClient(MONGO_URL);
await client.connect();
console.log("Connected to the dabase")

const db = client.db("Tareas")

const usersCollection = db.collection<userModel>("users");
const projectsCollection = db.collection<projectModel>("projects");
const tasksCollection = db.collection<taskModel>("tasks");

const handler = async (req: Request): Promise<Response> => {
    const method = req.method;
    const url = new URL(req.url);
    const path = url.pathname;

    if (method === "GET") {
        if (path === "/users") {
            const usersDB = await usersCollection.find().toArray();
            if (usersDB.length === 0) return new Response(JSON.stringify({
                error: true,
                status: "404",
                message: "The requested resource was not found."
            }), { status: 404 })
            const users = await Promise.all(
                usersDB.map((u) => fromUserModelToDto(u)));
            return new Response(JSON.stringify(users));
        } else if (path === "/projects") {
            const projectsDB = await projectsCollection.find().toArray();
            if (projectsDB.length === 0) return new Response(JSON.stringify({
                error: true,
                status: "404",
                message: "The requested resource was not found."
            }), { status: 404 })
            const projects = await Promise.all(
                projectsDB.map((u) => fromProjectModelToDto(u)));
            return new Response(JSON.stringify(projects));
        } else if (path === "/tasks") {
            const tasksDB = await tasksCollection.find().toArray();
            if (tasksDB.length === 0) return new Response(JSON.stringify({
                error: true,
                status: "404",
                message: "The requested resource was not found."
            }), { status: 404 })
            const tasks = await Promise.all(
                tasksDB.map((u) => fromTaskModelToDto(u)));
            return new Response(JSON.stringify(tasks));
        } else if (path === "/tasks/by-project") {
            const id = url.searchParams.get("id");
            if (!id) return new Response("Bad request", { status: 400 });
            const taskByProjectsDB = await tasksCollection.find({
                project_id: new ObjectId(id),
            }).toArray();
            if (taskByProjectsDB.length === 0) return new Response(JSON.stringify({
                error: true,
                status: "404",
                message: "The requested resource was not found."
            }), { status: 404 })
            const tasksByProject = await Promise.all(
                taskByProjectsDB.map((u) => fromTaskModelToDto(u))
            );
            return new Response(JSON.stringify(tasksByProject), { status: 200 })
        } else if (path === "/projects/by-user") {
            const id = url.searchParams.get("id");
            if (!id) return new Response("Bad request", { status: 400 });
            const projectsByUser = await projectsCollection.find({
                user_id: new ObjectId(id),
            }).toArray();
            if (projectsByUser.length === 0) return new Response(JSON.stringify({
                error: true,
                status: "404",
                message: "The requested resource was not found."
            }), { status: 404 })
            const tasksByProject = await Promise.all(
                projectsByUser.map((u) => fromProjectModelToDto(u))
            );

            return new Response(JSON.stringify(tasksByProject), { status: 200 })
        }
        else
            return new Response("Metodo no contemplado", { status: 400 })
    } else if (method == "POST") {
        if (path === "/users") {
            const usersToSave = await req.json();
            if (!usersToSave.name || !usersToSave.email) {
                return new Response("Bad request", { status: 400 });
            }
            const userDB = await usersCollection.findOne({
                email: usersToSave.email,
            });
            if (userDB) return new Response("User already exists", { status: 409 });
            const dateInserted = new Date();
            const { insertedId } = await usersCollection.insertOne({
                name: usersToSave.name,
                email: usersToSave.email,
                created_at: dateInserted
            });

            const userInserted = {
                id: insertedId,
                name: usersToSave.name,
                email: usersToSave.email,
                creadted_at: dateInserted
            }
            return new Response(JSON.stringify(userInserted));
        } else if (path === "/projects") {
            const projectToSave = await req.json();
            if (!projectToSave.name || !projectToSave.description || !projectToSave.start_date || !projectToSave.user_id) {
                return new Response("Bad request", { status: 400 });
            }
            const userWithProject = await projectsCollection.findOne({
                user_id: new ObjectId(projectToSave.user_id),
            });

            if (userWithProject) {
                return new Response("User already with a project", { status: 400 });
            }
            const { insertedId } = await projectsCollection.insertOne({
                name: projectToSave.name,
                description: projectToSave.description,
                start_date: projectToSave.start_date,
                end_date: null,
                user_id: projectToSave.user_id
            });

            const projectInserted = {
                id: insertedId,
                name: projectToSave.name,
                description: projectToSave.description,
                start_date: projectToSave.start_date,
                end_date: null,
                user_id: projectToSave.user_id
            }
            return new Response(JSON.stringify(projectInserted));
        } else if (path === "/tasks") {
            const taskToSave = await req.json();
            if (!taskToSave.title || !taskToSave.description || !taskToSave.status || !taskToSave.due_date || !taskToSave.project_id) {
                return new Response("Bad request", { status: 400 });
            }
            const userWithProject = await tasksCollection.findOne({
                project_id: new ObjectId(taskToSave.project_id),
            });
            if (userWithProject)
                return new Response("The project does not exist", { status: 400 });
            const date = new Date();
            const { insertedId } = await tasksCollection.insertOne({
                title: taskToSave.title,
                description: taskToSave.description,
                status: taskToSave.status,
                due_date: taskToSave.due_date,
                created_at: date,
                project_id: taskToSave.project_id
            });

            const taskInserted = {
                id: insertedId,
                title: taskToSave.title,
                description: taskToSave.description,
                status: taskToSave.status,
                due_date: taskToSave.due_date,
                project_id: taskToSave.project_id
            }
            return new Response(JSON.stringify(taskInserted));
        }
        else
            return new Response("Endpoint no encontrado", { status: 400 })
    } else if (method == "DELETE") {
        if (path === "/users") {
            const id = url.searchParams.get("id");
            if (!id) return new Response("Bad request", { status: 400 });
            const { deletedCount } = await usersCollection.deleteOne({
                _id: new ObjectId(id),
            });

            if (deletedCount === 0)
                return new Response("User not found", { status: 404 });
            return new Response("Deleted", { status: 200 });
        }
        else if (path === "/projects") {
            const id = url.searchParams.get("id");
            if (!id) return new Response("Bad request", { status: 400 });
            const { deletedCount } = await projectsCollection.deleteOne({
                _id: new ObjectId(id),
            });
            if (deletedCount === 0)
                return new Response("Project not found", { status: 404 });
            return new Response("Deleted", { status: 200 });
        } else if (path === "/tasks") {
            const id = url.searchParams.get("id");
            if (!id) return new Response("Bad request", { status: 400 });
            const { deletedCount } = await tasksCollection.deleteOne({
                _id: new ObjectId(id),
            });
            if (deletedCount === 0)
                return new Response("Task not found", { status: 404 });
            return new Response("Deleted", { status: 200 });
        }
    }
        return new Response("No has llamado correctamente", { status: 400 });
    
  
}
Deno.serve({ port: 4000 }, handler);

