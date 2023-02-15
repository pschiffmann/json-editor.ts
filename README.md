# json-editor.ts

This repository contains two examples how a central immutable object store can be read/written by many React components.
I built the same application twice with different architectures, called _id-references_ and _nested_.
The example applications manage an arbitrary JSON document, but the principles can be applied to structured data as well.

## Running the app

Install node.js, then run:

```bash
npm install
npm run dev
```

This will start a development server on `localhost`.

## Design 1: `nested`

This implementation stores the whole JSON document as a nested object tree.
The whole object tree is treated as immutable, existing objects are never modified after creation.
That means that whenever a nested value changes, all ancestor objects and arrays must be replaced as well.

The advantage of treating objects/arrays as immutable is that we can use [React.memo](https://beta.reactjs.org/reference/react/memo).
Objects will change identity iff their values change, therefore if an object identity hasn't changed it's values and all it's descendants also haven't changed and we don't need to re-render the component sub-tree.

## Design 2: `id-references`

To try out this app, edit file `src/main.tsx` and comment/uncomment the `import { App } from ...` statements.

This implementation stores each JSON value as a separate top-level value in a `NodeRepository` class and assigns each value a unique [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier).
Objects and arrays don't store child values directly, they only store their child node IDs.
Objects and arrays are once again treated as immutable and are replaced in the node repository on change; however, since they only store ID references, ancestors don't need to be replaced when a descendant value changes.
