import { NextResponse } from "next/server";
import { TABLE_SCHEMAS } from "../create-table/route";

const sdk = require("node-appwrite");

export const dynamic = "force-dynamic";

const tableNames = Object.keys(TABLE_SCHEMAS);

const TABLE_DEFINITIONS = Object.fromEntries(
  Object.entries(TABLE_SCHEMAS).map(([tableName, schema]) => [
    tableName,
    schema.attributes.map((attr) => ({
      key: attr.key,
      type: attr.type === "url" ? "string" : attr.type,
      ...(attr.size !== undefined ? { size: attr.size } : {})
    }))
  ])
);

function createAppwrite(searchParams) {
  const endpoint = searchParams?.get("_endpoint") || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = searchParams?.get("_project") || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const databaseId = searchParams?.get("_database") || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  const apiKey = searchParams?.get("_key") || process.env.NEXT_PUBLIC_APPWRITE_API_KEY;

  if (!endpoint || !projectId || !databaseId || !apiKey) {
    throw new Error("Appwrite configuration is missing");
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

function compareSchema(expected, actual) {
  if (!actual || actual.length === 0 || expected.length !== actual.length) {
    return false;
  }

  const actualMap = {};
  actual.forEach((attr) => {
    actualMap[attr.key] = attr;
  });

  return expected.every((expectedAttr) => {
    const actualAttr = actualMap[expectedAttr.key];
    if (!actualAttr) return false;
    if (expectedAttr.type && actualAttr.type !== expectedAttr.type) return false;
    return !(expectedAttr.size !== undefined && actualAttr.size !== undefined && actualAttr.size !== expectedAttr.size);
  });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const { databases, databaseId } = createAppwrite(searchParams);
    const allCollections = await databases.listCollections(databaseId);

    const collectionMap = {};
    allCollections.collections.forEach((collection) => {
      if (!collectionMap[collection.name] || collection.$updatedAt > collectionMap[collection.name].$updatedAt) {
        collectionMap[collection.name] = collection;
      }
    });

    const collections = await Promise.all(
      tableNames.map(async (name) => {
        const collection = collectionMap[name];
        const expectedSchema = TABLE_DEFINITIONS[name];

        if (!collection) {
          return {
            name,
            columnCount: expectedSchema.length,
            documentCount: 0,
            missing: true,
            schemaMismatch: false
          };
        }

        const actualSchema = (collection.attributes || []).filter((attr) =>
          (attr.status === "available" || !attr.status) && !attr.key.startsWith("$")
        );
        let documentCount = 0;
        let error = false;

        try {
          const docs = await databases.listDocuments(databaseId, collection.$id);
          documentCount = docs.total;
        } catch {
          error = true;
        }

        return {
          name,
          collectionId: collection.$id,
          columnCount: collection.attributes ? collection.attributes.length : 0,
          documentCount,
          error,
          schemaMismatch: !compareSchema(expectedSchema, actualSchema)
        };
      })
    );

    return NextResponse.json({
      totalColumns: collections.reduce((sum, collection) => sum + collection.columnCount, 0),
      totalCollections: tableNames.length,
      collections,
      databaseId
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.message?.includes("configuration") ? 400 : 500 }
    );
  }
}
