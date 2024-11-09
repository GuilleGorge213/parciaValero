import { MongoClient, ObjectId } from "mongodb";
import { AutorModel, LibroModel } from "./Model.ts";
import { fromAutorToDtoReturned, fromLibroModelToDto } from "./functions.ts";

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
const autorCollection = db.collection<AutorModel>("Autor");

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
                const librosDB = await libroCollection.find({ _id: new ObjectId(id) }).toArray();
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
    } else if (method === "POST") {
        if (path === "/libro") {
            const payload = await req.json();
            const numeroDeAutor = payload.autores;
            if (!payload.titulo && !payload.autores && !payload.copias)
                return new Response("El título, los autores y las copias son campos requeridos.", { status: 404 })
            const insertedBook = await libroCollection.find({ titulo: payload.titulo }).toArray();
            if (insertedBook.length > 0) return new Response("El libro ya existe", { status: 400 })
            const idsAutores = payload.autores.map((autor: string) => autor).map((id : string) => new ObjectId(id))
            const autores = await autorCollection.find({ _id: { $in: idsAutores } }).toArray();
            if (numeroDeAutor.length != autores.length)
                return new Response("Autor no existe", { status: 400 })
            const { insertedId } = await libroCollection.insertOne({
                titulo: payload.titulo,
                copiasDisponibles: payload.copiasDisponibles,
                autores: []
            });
            const returnedBookInserted = {
                id: insertedId,
                titulo: payload.titulo,
                autores:
                {

                    autor: autores.map((u) => fromAutorToDtoReturned(u))
                },
                copiasDisponibles: payload.copiasDisponibles
            };
            return new Response(JSON.stringify(returnedBookInserted), { status: 200 })
        } else if (path === "/autor") {
            const payload = await req.json();
            if (!payload.nombre && !payload.biografia)
                return new Response("El nombre y la biografia son campos requeridos.", { status: 400 })
            const insertedAutor = await autorCollection.find({ nombre: payload.nombre }).toArray();
            if (insertedAutor.length > 0)
                return new Response("El autor ya existe", { status: 400 })
            const { insertedId } = await autorCollection.insertOne({
                nombre: payload.nombre,
                biografia: payload.biografia,
            });
            const returnedAutor = {
                message: "Autor creado exitosamente",
                autor: {
                    id: insertedId,
                    nombre: payload.nombre,
                    biografia: payload.biografia
                }

            };
            return new Response(JSON.stringify(returnedAutor), { status: 200 })
        } else
            return new Response("Error al llamar al endPoint con el metodo POST", { status: 400 })

    } else if (method === "DELETE") {
        if (path === "/libro") {
            const payload = await req.json();
            if (!payload.id)
                if (payload.length === 0)
                    return new Response("Por favor informe correctamente el id", { status: 404 })
            const { deletedCount } = await libroCollection.deleteOne({ _id: new ObjectId(payload.id) });
            if (deletedCount === 0)
                return new Response("Libro no encontrado.", { status: 404 })
            return new Response("Libro eliminado exitosamente.", { status: 200 })

        }
    }

    return new Response("Error al llamar al endPoint", { status: 400 })


}

Deno.serve({ port: 4000 }, handler);


