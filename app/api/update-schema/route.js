import { NextResponse } from "next/server";
import { TABLE_SCHEMAS as CREATE_TABLE_SCHEMAS } from "../create-table/route";

const sdk = require("node-appwrite");

export const dynamic = "force-dynamic";

const TABLE_SCHEMAS = Object.fromEntries(
  Object.entries(CREATE_TABLE_SCHEMAS).map(([tableName, schema]) => [
    tableName,
    schema.attributes.map((attr) => ({
      key: attr.key,
      type: attr.type,
      required: attr.required,
      ...(attr.size !== undefined ? { size: attr.size } : {}),
      ...(attr.default !== undefined ? { default: attr.default } : {})
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

function normalizeActualType(type) {
  return type === "url" ? "string" : type;
}

function normalizeExpectedType(type) {
  return type === "url" ? "string" : type;
}

function analyzeSchema(expected, actual) {
  const actualMap = {};
  actual.forEach((attr) => {
    actualMap[attr.key] = attr;
  });

  const changes = {
    toAdd: [],
    toUpdate: [],
    toRemove: [],
    conflicts: []
  };

  expected.forEach((exp) => {
    const act = actualMap[exp.key];
    if (!act) {
      changes.toAdd.push({ ...exp, action: "create" });
      return;
    }

    const expectedType = normalizeExpectedType(exp.type);
    const actualType = normalizeActualType(act.type);
    if (expectedType !== actualType) {
      changes.conflicts.push({
        key: exp.key,
        issue: "type_mismatch",
        expected: expectedType,
        actual: actualType,
        message: `Cannot change type from ${actualType} to ${expectedType}`
      });
      return;
    }

    if (exp.size && act.size && exp.size !== act.size) {
      if (exp.size > act.size) {
        changes.toUpdate.push({
          key: exp.key,
          type: exp.type,
          oldSize: act.size,
          newSize: exp.size,
          action: "update_size"
        });
      } else {
        changes.conflicts.push({
          key: exp.key,
          issue: "size_decrease",
          expected: exp.size,
          actual: act.size,
          message: `Cannot decrease size from ${act.size} to ${exp.size}`
        });
      }
    }
  });

  actual.forEach((act) => {
    if (!expected.find((exp) => exp.key === act.key)) {
      changes.toRemove.push({
        key: act.key,
        type: act.type,
        message: "Extra attribute not in expected schema"
      });
    }
  });

  return {
    canAutoUpdate: changes.conflicts.length === 0 && changes.toRemove.length === 0,
    hasChanges: changes.toAdd.length > 0 || changes.toUpdate.length > 0,
    changes,
    issues: changes.conflicts.concat(
      changes.toRemove.map((attr) => ({
        key: attr.key,
        issue: "extra_attribute",
        message: attr.message
      }))
    )
  };
}

async function createAttribute(databases, databaseId, collectionId, attr) {
  switch (attr.type) {
    case "string":
      return databases.createStringAttribute(databaseId, collectionId, attr.key, attr.size, false);
    case "integer":
      return databases.createIntegerAttribute(databaseId, collectionId, attr.key, false);
    case "url":
      return databases.createUrlAttribute(databaseId, collectionId, attr.key, false);
    case "datetime":
      return databases.createDatetimeAttribute(databaseId, collectionId, attr.key, false);
    case "boolean":
      return databases.createBooleanAttribute(databaseId, collectionId, attr.key, false, attr.default);
    default:
      throw new Error(`Unsupported attribute type: ${attr.type}`);
  }
}

async function autoUpdateSchema(databases, databaseId, collectionId, changes) {
  const results = [];

  for (const change of changes.toAdd) {
    try {
      await createAttribute(databases, databaseId, collectionId, change);
      results.push({ key: change.key, success: true, action: "created" });
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      results.push({ key: change.key, success: false, error: error.message });
    }
  }

  for (const change of changes.toUpdate) {
    try {
      await databases.updateStringAttribute(databaseId, collectionId, change.key, change.newSize, false);
      results.push({ key: change.key, success: true, action: "updated" });
    } catch (error) {
      results.push({
        key: change.key,
        success: false,
        error: error.message,
        note: "Size update may require a manual rebuild"
      });
    }
  }

  return results;
}

export async function POST(request) {
  try {
    const { tableName } = await request.json();
    const expectedSchema = TABLE_SCHEMAS[tableName];

    if (!expectedSchema) {
      return NextResponse.json(
        { success: false, error: `Unknown table: ${tableName}` },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const { databases, databaseId } = createAppwrite(searchParams);
    const allCollections = await databases.listCollections(databaseId);
    const existingCollections = allCollections.collections.filter((col) => col.name === tableName);

    if (existingCollections.length === 0) {
      return NextResponse.json({
        success: false,
        action: "create",
        message: `Table ${tableName} does not exist. Please create it first.`
      });
    }

    const collection = existingCollections.reduce((latest, col) =>
      col.$updatedAt > latest.$updatedAt ? col : latest
    );
    const actualAttributes = (collection.attributes || []).filter((attr) =>
      (attr.status === "available" || !attr.status) && !attr.key.startsWith("$")
    );
    const analysis = analyzeSchema(expectedSchema, actualAttributes);

    if (!analysis.canAutoUpdate) {
      return NextResponse.json({
        success: false,
        action: "manual",
        analysis,
        message: `Cannot automatically update ${tableName}. Manual rebuild required.`,
        details: analysis.issues
      });
    }

    const results = await autoUpdateSchema(databases, databaseId, collection.$id, analysis.changes);

    return NextResponse.json({
      success: true,
      action: analysis.hasChanges ? "updated" : "noop",
      changes: analysis.changes,
      results,
      message: analysis.hasChanges
        ? `Successfully updated ${tableName} schema`
        : `${tableName} schema is already up to date`
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message?.includes("configuration") ? 400 : 500 }
    );
  }
}
