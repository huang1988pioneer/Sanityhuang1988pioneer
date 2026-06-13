import { NextResponse } from "next/server";

const sdk = require("node-appwrite");

export const dynamic = "force-dynamic";

const TABLE_SCHEMAS = {
  cronsanity: {
    name: "cronsanity",
    attributes: [
      { key: "name", type: "string", size: 100, required: true },
      { key: "targetUrl", type: "url", required: false },
      { key: "schedule", type: "string", size: 100, required: false },
      { key: "enabled", type: "boolean", required: false, default: true },
      { key: "status", type: "string", size: 50, required: false },
      { key: "lastRunAt", type: "datetime", required: false },
      { key: "nextRunAt", type: "datetime", required: false },
      { key: "lastSuccessAt", type: "datetime", required: false },
      { key: "lastFailureAt", type: "datetime", required: false },
      { key: "responseStatus", type: "integer", required: false },
      { key: "durationMs", type: "integer", required: false },
      { key: "attempts", type: "integer", required: false },
      { key: "message", type: "string", size: 1000, required: false },
      { key: "note", type: "string", size: 1000, required: false }
    ]
  }
};

export { TABLE_SCHEMAS };

function createAppwrite(searchParams) {
  const endpoint = searchParams.get("_endpoint") || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = searchParams.get("_project") || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const databaseId = searchParams.get("_database") || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  const apiKey = searchParams.get("_key") || process.env.NEXT_PUBLIC_APPWRITE_API_KEY;

  if (!endpoint || !projectId || !databaseId || !apiKey) {
    throw new Error("Missing Appwrite configuration");
  }

  const client = new sdk.Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  return {
    databases: new sdk.Databases(client),
    databaseId
  };
}

async function deleteExistingCollections(databases, databaseId, tableName, send = () => {}) {
  const allCollections = await databases.listCollections(databaseId);
  const existingCollections = allCollections.collections.filter((col) => col.name === tableName);

  for (const collection of existingCollections) {
    send({
      type: "progress",
      step: "cleanup",
      message: `Deleting existing ${tableName} collection ${collection.$id}`
    });
    await databases.deleteCollection(databaseId, collection.$id);
  }

  if (existingCollections.length > 0) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

async function createAttribute(databases, databaseId, collectionId, attr) {
  switch (attr.type) {
    case "string":
      return databases.createStringAttribute(databaseId, collectionId, attr.key, attr.size, attr.required);
    case "integer":
      return databases.createIntegerAttribute(databaseId, collectionId, attr.key, attr.required);
    case "url":
      return databases.createUrlAttribute(databaseId, collectionId, attr.key, attr.required);
    case "datetime":
      return databases.createDatetimeAttribute(databaseId, collectionId, attr.key, attr.required);
    case "boolean":
      return databases.createBooleanAttribute(databaseId, collectionId, attr.key, attr.required, attr.default);
    default:
      throw new Error(`Unsupported attribute type: ${attr.type}`);
  }
}

async function createTable({ databases, databaseId, tableName, send = () => {} }) {
  const schema = TABLE_SCHEMAS[tableName];
  if (!schema) {
    throw new Error(`Unknown table: ${tableName}`);
  }

  await deleteExistingCollections(databases, databaseId, tableName, send);

  send({ type: "start", tableName, totalColumns: schema.attributes.length });
  send({ type: "progress", step: "collection", message: `Creating ${tableName} collection...` });

  const collection = await databases.createCollection(
    databaseId,
    sdk.ID.unique(),
    schema.name,
    [
      sdk.Permission.read(sdk.Role.any()),
      sdk.Permission.create(sdk.Role.any()),
      sdk.Permission.update(sdk.Role.any()),
      sdk.Permission.delete(sdk.Role.any())
    ]
  );

  const collectionId = collection.$id;
  send({ type: "progress", step: "collection", message: `Collection created`, collectionId });

  for (let i = 0; i < schema.attributes.length; i++) {
    const attr = schema.attributes[i];
    let created = false;

    for (let attempt = 0; attempt < 3 && !created; attempt++) {
      try {
        await createAttribute(databases, databaseId, collectionId, attr);
        created = true;
      } catch (error) {
        if (error.code === 409) {
          created = true;
        } else if (attempt < 2 && (error.code === 429 || error.message?.includes("rate"))) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          send({ type: "warning", attribute: attr.key, message: error.message });
          created = true;
        }
      }
    }

    send({
      type: "progress",
      step: "attribute",
      current: i + 1,
      total: schema.attributes.length,
      percent: Math.round(((i + 1) / schema.attributes.length) * 100),
      attribute: attr.key,
      message: `Creating ${attr.key} (${i + 1}/${schema.attributes.length})`
    });

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return {
    success: true,
    message: `${tableName} table created with ${schema.attributes.length} columns`,
    collectionId
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tableName = searchParams.get("table");

  if (!tableName || !TABLE_SCHEMAS[tableName]) {
    return NextResponse.json({ error: "Invalid table name" }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const { databases, databaseId } = createAppwrite(searchParams);
        const result = await createTable({ databases, databaseId, tableName, send });
        send({ type: "complete", ...result });
      } catch (error) {
        send({ type: "error", message: error.message });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  });
}

export async function POST(request) {
  try {
    const { tableName } = await request.json();
    const { searchParams } = new URL(request.url);
    const { databases, databaseId } = createAppwrite(searchParams);
    const result = await createTable({ databases, databaseId, tableName });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message?.includes("configuration") ? 400 : 500 }
    );
  }
}
