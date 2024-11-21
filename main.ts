import { MongoClient, ObjectId } from "mongodb";
import { tareaModel } from "./Model.ts";
import { fromTaskModelToTaskDTO } from "./functions.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");
if (!MONGO_URL) {
    console.error("MONGO_URL uri not set on .env");
    Deno.exit(1);
}

const client = new MongoClient(MONGO_URL);
await client.connect();
console.log("Connected to the dabase")

const db = client.db("Tareas")

const tareasCollection = db.collection<tareaModel>("tarea");

const handler = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    if (method === "GET") {
        if (path === "/tasks") {
            const id = url.searchParams.get("id");
            if (id && id.length > 0) {
                const tareasDB = await tareasCollection.findOne({ _id: new ObjectId(id) });
                if (!tareasDB) return new Response("error : Tarea no encontrada", { status: 404 })
                return new Response(JSON.stringify(fromTaskModelToTaskDTO(tareasDB)), { status: 200 })
            } else {
                const tareasDB = await tareasCollection.find().toArray();
                const tareasDTO = await Promise.all(tareasDB.map((u) => fromTaskModelToTaskDTO(u)));
                return new Response(JSON.stringify(tareasDTO), { status: 200 })
            }
        }
        return new Response("Endpoint no encontrado", { status: 400 })
    } else if (method === "POST") {
        if (path === "/tasks") {
            const payload = await req.json();
            if (!payload.title || payload.title.length === 0) {
                return new Response("titulo enviado incorrectamente", { status: 400 });
            }
            const { insertedId } = await tareasCollection.insertOne({
                title: payload.title,
                completed: false,
            });
            const returnTask = {
                Task: {
                    id: insertedId,
                    title: payload.title,
                    completed: false
                }
            };
            return new Response(JSON.stringify(returnTask), { status: 200 })
        }
        return new Response("Endpoint no encontrado", { status: 400 })
    } else if (method === "DELETE") {
        if (path === "/tasks") {
            const id = url.searchParams.get("id");
            if (!id)
                return new Response("Por favor informe correctamente el id", { status: 404 })
            const { deletedCount } = await tareasCollection.deleteOne({ _id: new ObjectId(id) });
            if (deletedCount === 0)
                return new Response("tarea no encontrada.", { status: 404 })
            return new Response("message : Tarea eliminada correctamente", { status: 200 })
        }
        return new Response("Endpoint no encontrado", { status: 400 })

    } else if (method === "PUT") {
        if (path === "/tasks") {
            const payload = await req.json();
            const id = url.searchParams.get("id");
            if (!id)
                return new Response("Por favor informe correctamente el id", { status: 404 })
            const { modifiedCount } = await tareasCollection.updateOne({ _id: new ObjectId(id) },
                {
                    $set: {
                        completed: payload.completed
                    },
                },
            );

            const respuesta = {
                id: id,
                completed : payload.completed
            }

            if (modifiedCount === 0)
                return new Response("Tarea introducida no encontrada o no se ejecuta cambio", { status: 404 })
            else 
                return new Response(JSON.stringify(respuesta), { status: 200 })

        }
        return new Response("Endpoint no encontrado", { status: 400 })

    }
    return new Response("Endpoint no encontrado", { status: 400 })

}

Deno.serve({ port: 4000 }, handler);


