import MCache from "../src/m-cache";
import test, { before, after } from "ava";
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

test("Cache restored on corruption", (t) => {
    const cache = new MCache({
        path,
    });

    cache.set("foo", "bar", true);

    fs.writeFileSync(path, "[{'boo': 'far'}]");

    cache.persist()

    t.deepEqual(JSON.stringify([["foo", "bar"]]), readCacheFile());
});

test("Throws on corruption", (t) => {
    const cache = new MCache({
        path,
        throwOnCorruption: true,
    });

    cache.set("foo", "bar", true);

    fs.writeFileSync(path, '[{"foo": "bar"}]');

    t.throws(() => {
        new MCache({
            path,
            throwOnCorruption: true,
        });
    });
});
