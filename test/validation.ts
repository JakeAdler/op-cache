import test, { before, after } from "ava";
import node_path from "path";
import mock, { restore } from "mock-fs";
import OPCache from "../src/op-cache";

const dir = node_path.join(process.cwd(), "node_modules/", ".cache/");
const path = node_path.join(dir, "cache.json");

before(() => {
    mock({
        [path]: "",
    });
});

after(() => {
    restore();
});

test("Should throw if persisted data fails validation", (t) => {
    const cache = new OPCache({
        path,
    });

    cache.set("foo", "bar", true);

    t.throws(() => {
        new OPCache({
            path,
            validate: (fc: any) => {
                if (!Array.isArray(fc)) {
                    throw new Error("File contents is not array");
                } else {
                    fc.forEach(([key, value]) => {
                        if (key === "foo") {
                            if (value === "bar") {
                                throw new Error(
                                    "I dont want the value to be foo"
                                );
                            }
                        }
                    });
                }
            },
        });
    });
});

test("Should pass if persisted data passes validation", (t) => {
    const cache = new OPCache({
        path,
    });

    cache.set("foo", "bar", true);

    t.notThrows(() => {
        new OPCache({
            path,
            validate: (fc: any) => {
                if (!Array.isArray(fc)) {
                    throw new Error("File contents is not array");
                } else {
                    fc.forEach(([key, value]) => {
                        if (key === "foo") {
                            if (value !== "bar") {
                                throw new Error("I want the value to be foo");
                            }
                        }
                    });
                }
            },
        });
    });
});
