import { MongoClient } from "mongodb";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnvFile(fileName: string) {
  const filePath = resolve(process.cwd(), fileName);
  if (!existsSync(filePath)) return;

  const content = readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const equalIndex = line.indexOf("=");
    if (equalIndex <= 0) continue;

    const key = line.slice(0, equalIndex).trim();
    let value = line.slice(equalIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function loadEnv() {
  loadDotEnvFile(".env.local");
  loadDotEnvFile(".env");
}

async function run() {
  loadEnv();

  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error("DATABASE_URL is required");

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db();
    const productsCollection = db.collection("ProductItem");

    // Remove the old unique index so we can collapse rows and null legacy level links safely.
    const indexes = await productsCollection.indexes();
    const oldUniqueIndex = indexes.find(
      (index) =>
        index.unique === true &&
        index.key?.productId === 1 &&
        index.key?.courseId === 1 &&
        index.key?.courseLevelId === 1
    );
    if (oldUniqueIndex?.name) {
      await productsCollection.dropIndex(oldUniqueIndex.name);
    }

    // Keep one row per (productId, courseId), delete duplicates left from old level-based modeling.
    const grouped = await productsCollection
      .aggregate<{
        _id: { productId: unknown; courseId: unknown };
        ids: unknown[];
      }>([
        {
          $group: {
            _id: { productId: "$productId", courseId: "$courseId" },
            ids: { $push: "$_id" },
          },
        },
      ])
      .toArray();

    let deletedCount = 0;
    for (const group of grouped) {
      const ids = group.ids;
      if (ids.length <= 1) continue;

      const [keepId, ...deleteIds] = ids;
      if (deleteIds.length > 0) {
        const deleted = await productsCollection.deleteMany({ _id: { $in: deleteIds as any[] } });
        deletedCount += deleted.deletedCount;
      }

      // Ensure keeper doc still has levelsCount set to a valid minimum.
      await productsCollection.updateOne(
        { _id: keepId as any },
        [{ $set: { levelsCount: { $max: [1, { $ifNull: ["$levelsCount", 1] }] } } }]
      );
    }

    const updateResult = await productsCollection.updateMany(
      {},
      {
        $set: { courseLevelId: null },
      }
    );

    // Create the new uniqueness contract used by schema @@unique([productId, courseId]).
    await productsCollection.createIndex(
      { productId: 1, courseId: 1 },
      { unique: true, name: "ProductItem_productId_courseId_key" }
    );

    console.log(
      `Migration 2 complete: deleted ${deletedCount} duplicates, updated ${updateResult.modifiedCount} ProductItem docs.`
    );
  } finally {
    await client.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
