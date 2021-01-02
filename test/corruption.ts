import PCache from "../src/p-cache";
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
    const cache = new PCache({
        path,
    });

    cache.set("foo", "bar", true);

    fs.writeFileSync(path, "[{'foo': 'bar'}]");

    cache.set("baz", "bop", true);

    t.deepEqual(JSON.stringify([...cache]), readCacheFile());
});

test("Throws on corruption", (t) => {
    const cache = new PCache({
        path,
        throwOnCorruption: true,
    });

    cache.set("foo", "bar", true);

    fs.writeFileSync(path, '[{"foo": "bar"}]');

    t.throws(() => {
        new PCache({
            path,
            throwOnCorruption: true,
        });
    });
});
