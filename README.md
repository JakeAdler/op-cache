# m-cache
A simple [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) based cache with optional persistence.

- [Usage](#Usage)
- [API](#API)
- [Caveats](#Caveats)

## Usage

```js
const MCache = require("m-cache");

// If it does not exist, creates /path/to/cache/file
const cache = new MCache({
  path: "/path/to/cache/file"
})

cache.set("foo", "bar");

cache.get("foo"); // "bar"

cache.set("hello", "world", true); // Persist key value pair

cache.delete("foo"); // true

cache.delete("hello", false)// Do not persist deletion
// same as
cache.delete("hello");

cache.has("hello"); // false

// Since 'path' exists, newCache will be loaded with the data inside the cache file.
const newCache = new MCache({
  path: "/path/to/cache/file"
)}

newCache.has("hello"); // true

newCache.clear(true); // Clear cache with persistence (deletes cache file);

const key1 = Symbol("foo");
const key2 = Symbol("foo");

newCache // 'set' calls are chainable
  .set(123, "saved", true) // Can use numbers as keys, this pair will be persisted.
  .set(key1, { foo: "bar" }); // Can use symbols as keys, this pair will *not* be persisted.
  .set(key2, { bar: "baz" }, true); // Values can be any arbitrary value. This pair will be persisted.

```

## API

### Methods

#### `.get(key)`
Returns a specified element from a the cache. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the cache.

#### `.set(key, value, persist = false)`
Adds or updates an element with a specified key and a value to the cache. Pass `true` as a 3rd argument to persist the cached element.

#### `.delete(key, persist = false)`
Removes the specified element from a Map object by key. Returns a boolean indicating whether the removal was successful or not. Pass `true` as a 2nd argument to persist the deletion.

#### `.clear(persist = false)`
Removes all elements from the cache. Pass `true` as an argument remove the cache file.

### `.persist()`
Forcibly re-writes all previously persisted keys to the cache file.

#### `.has(key)`
Returns a boolean indicating whether an element with the specified key exists or not.

#### `.entries()`
Returns an [Iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators) that contas the `[key, values]` pairs for each element in the cache in insertion order.

#### `.keys()`
Returns an [Iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators) that contains the keys for each element in the cache in insertion order.

#### `.values()`
Returns an [Iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators) that contains the values for each element in the cache in insertion order.
 
### Properties
 
### `.size`
Returns the number of elements in the cache.

## Caveats

- While both keys and values can be of any type, persisted elements must be JSON-serializeable in order to be retrieved. This essentially limits you to using the following types for persisted data: `string`, `number`, `boolean` and `object`s containing exlcuisvely primitive values.
Example:
```js
// GOOD

const cache = new MCache({
  path: "/path/to/cache/file"
});

cache.set("foo", { bar: "baz" }, true);

const newCache = new MCache({
  path: "/path/to/cache/file"
});

newCache.get("foo"); // { bar: "baz" }

// BAD

const cache = new PCache({
  path: "/path/to/cache/file"
});

cache.set("sum", (a, b) => (a + b), true); 

// Note that the element will be available in memory.
const sum = cache.get("sum");
sum(1, 2) // 3;

const newCache = new MCache({
  path: "/path/to/cache/file"
});

newCache.get("sum"); // undefined
```
- Persisted keys that are objects will not be directly retrievable until refrencnce to the object is obtained.
Example:

```js
const cache = new MCache({
  path: "/path/to/cache/file"
});

cache.set({ someKey: "someVal" }, "YAY", true);

const newCache =  new MCache({
  path: "/path/to/cache/file"
});

cache.get({someKey: "someVal"}); // undefined

const objWithReference = Array.from(cache.keys())[0]
cache.get(objWithReference) // "YAY"

```
