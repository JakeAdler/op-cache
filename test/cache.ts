import mock, { restore } from "mock-fs";
import OPCache from "../src/op-cache";
import test, { before, after } from "ava";
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

test("Bound properties should work as expected", (t) => {
    const cache = new OPCache();
    const map = new Map();

    cache.set("foo", { bar: "baz" }).set(1, 2);
    map.set("foo", { bar: "baz" }).set(1, 2);

    t.assert(cache.has(1));
    t.assert(cache.has("foo"));

    t.deepEqual(map.keys(), cache.keys());

    t.is(cache.has(1), map.has(1));
    t.is(cache.has("foo"), map.has("foo"));

    t.deepEqual(cache.keys(), map.keys());

    t.deepEqual(cache.values(), map.values());

    t.is(cache.size, map.size);
});

test("Base properties work as expected", (t) => {
    const x = Symbol("foo");
    const y = Symbol("foo");

    type Schema = {
        hello: "world";
        [x]: "bax";
        [y]: "bay";
        1: any;
    };
    const cache = new OPCache<Schema>();

    cache.set("hello", "world");

    cache.set(x, "bax");

    cache.set(y, "bay");

    cache.set(1, {
        one: "I",
    });

    t.is(cache.get("hello"), "world");

    t.is(cache.get(x), "bax");
    t.is(cache.get(y), "bay");

    t.deepEqual(cache.get(1), { one: "I" });
});

test("'set' calls should be chainable", (t) => {
    const cache = new OPCache({
    	path
    });

    cache
        .set("foo", "bar")
        .set("baz", "bop", true)
        .set("should be", "saved", true);

    t.deepEqual(
        readCacheFile(),
        JSON.stringify([
            ["baz", "bop"],
            ["should be", "saved"],
        ])
    );
});
