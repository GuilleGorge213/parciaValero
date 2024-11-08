import { MongoClient, ObjectId } from "mongodb";
import { AutorModel, LibroModel } from "./Model.ts";
import { fromLibroModelToDto } from "./functions.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");
if (!MONGO_URL) {
    console.error("MONGO_URL uri not set on .env");
    Deno.exit(1);
}

const client = new MongoClient(MONGO_URL);
await client.connect();
console.log("Connected to the dabase")

const db = client.db("Catalogo")

//PENDIENTE CREAR COLLECTIONS
const libroCollection = db.collection<LibroModel>("libro");
const autorCollection = db.collection<AutorModel>("autor");

const handler = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    if (method === "GET") {
        if (path === "/libros") {
            const titulo = url.searchParams.get("titulo");
            const id = url.searchParams.get("id");
            if (titulo) {
                if (titulo.length === 0) return new Response("Por favor informe correctamente el titulo", { status: 404 })
                const librosDB = await libroCollection.find({ titulo }).toArray();
                if (librosDB.length === 0)
                    return new Response("No se encontraron libros con ese título.", { status: 404 })
                const librosDTO = await Promise.all(librosDB.map((u) => fromLibroModelToDto(u, autorCollection)));
                return new Response(JSON.stringify(librosDTO), { status: 200 })
            } else if (id) {
                if (id.length === 0) return new Response("Por favor informe correctamente el id", { status: 404 })
                const librosDB = await libroCollection.find({ _id: id }).toArray();
                if (librosDB.length === 0)
                    return new Response("No se encontraron libros con ese id.", { status: 404 })
                const librosDTO = await Promise.all(librosDB.map((u) => fromLibroModelToDto(u, autorCollection)));
                return new Response(JSON.stringify(librosDTO), { status: 200 })
            } else {
                const librosDB = await libroCollection.find().toArray();
                const librosDTO = await Promise.all(librosDB.map((u) => fromLibroModelToDto(u, autorCollection)));
                return new Response(JSON.stringify(librosDTO), { status: 200 })
            }
        }
        return new Response("Endpoint no encontrado", { status: 400 })
    }

    return new Response("Error al llamar al endPoint", { status: 400 })


}

Deno.serve({ port: 4000 }, handler);


