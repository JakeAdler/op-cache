import PCache from "../src/p-cache";
import test, { after, before } from "ava";
import path from "path";
import fs from "fs";

const cacheDir = path.join(process.cwd(), "node_modules/", ".cache/");
const cachePath = path.join(cacheDir, "cache.json");

const readCacheFile = () => fs.readFileSync(cachePath, "utf8");

before(() => {
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
    } else if (fs.existsSync(cachePath)) {
        fs.rmSync(cachePath);
    }
});

after(() => {
    if (fs.existsSync(cachePath)) {
        fs.rmSync(cachePath);
    }
});

test.serial("Should persist data", (t) => {
    const cache = new PCache({
        cachePath,
    });

    cache.set("foo", "bar", true);

    t.deepEqual(readCacheFile(), JSON.stringify([["foo", "bar"]]));
});

test.serial("Should load persist data", (t) => {
    const cache = new PCache({
        cachePath,
    });

    t.assert(cache.has("foo"));
    t.is(cache.get("foo"), "bar");
});

test.serial("Should delete persisted data", (t) => {
    const cache = new PCache({
        cachePath,
    });

    t.assert(cache.has("foo"));

    cache.delete("foo", true);

    t.assert(!cache.has("foo"));

    t.deepEqual(readCacheFile(), "[]");
});
