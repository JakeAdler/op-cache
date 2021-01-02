import PCache from "../src/p-cache";
import test, { afterEach, before } from "ava";
import node_path from "path";
import fs from "fs";

const dir = node_path.join(process.cwd(), "node_modules/", ".cache/");
const path = node_path.join(dir, "cache.json");

const readCacheFile = () => fs.readFileSync(path, "utf8");

before(() => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    } else if (fs.existsSync(path)) {
        fs.rmSync(path);
    }
});

afterEach(() => {
    if (fs.existsSync(path)) {
        fs.rmSync(path);
    }
});

test.serial("Cache restored on corruption", (t) => {
    const cache = new PCache({
        path,
    });

    cache.set("foo", "bar", true);

    fs.writeFileSync(path, "[{'foo': 'bar'}]");

    cache.set("baz", "bop", true);

    t.deepEqual(JSON.stringify([...cache]), readCacheFile());
});

test.serial("Throws on corruption", (t) => {
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
