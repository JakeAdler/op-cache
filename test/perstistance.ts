import OPCache from "../src/op-cache";
import test, { after, before } from "ava";
import mock, { restore } from "mock-fs";
import node_path from "path";
import fs from "fs";

const dir = node_path.join(process.cwd(), "node_modules/", ".cache/");
const path = node_path.join(dir, "cache.json");

const readCacheFile = () => fs.readFileSync(path, "utf8");

before(() => {
    mock({
        [path]: "",
    });
});

after(() => {
    restore();
});

test("Should load persisted data", (t) => {
    const oldCache = new OPCache({
        path,
    });

    oldCache.set("foo", "bar", true);

    t.deepEqual(readCacheFile(), JSON.stringify([["foo", "bar"]]));

    const newCache = new OPCache({
        path,
    });

    t.assert(newCache.has("foo"));
    t.is(newCache.get("foo"), "bar");
});

test("Should delete persisted data", (t) => {
    const cache = new OPCache({
        path,
    });

    t.assert(cache.has("foo"));

    cache.delete("foo", true);

    t.assert(!cache.has("foo"));

    t.deepEqual(readCacheFile(), "[]");
});

test("Chainable set calls with some pairs persisted", (t) => {
    const cache = new OPCache({
        path,
    });
    cache.clear(true);

    cache.set("foo", "bar", true).set("dont", "save").set("save", "me", true);

    t.deepEqual(
        readCacheFile(),
        JSON.stringify([
            ["foo", "bar"],
            ["save", "me"],
        ])
    );
});
