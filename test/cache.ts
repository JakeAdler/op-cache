import PCache from "../src/p-cache";
import test from "ava";

test("Bound properties should work as expected", (t) => {
    const cache = new PCache();
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
    const cache = new PCache<Schema>();

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
