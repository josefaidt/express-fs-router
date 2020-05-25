# Express FileSystem Router

Straightforward filesystem routing utility for [Express](https://www.npmjs.com/package/express). Inspiration drawn from [micro](https://www.npmjs.com/package/micro)

## Getting Started

Install

```shell
yarn add express-fs-router
```

Create sample endpoint

```js
// api/index.js
export default function(req, res) {
  res.json({ message: 'hello world!' })
}
```

Add to Express application

```js
// app.js
import express from 'express'
import FSRouter from 'express-fs-router'
const app = express()

app.use('/api', new FSRouter('api'))

app.listen(3000, () => console.log('Listening at http://localhost:3000'))
```

## Features

### HTTP Methods & Named Function Default Exports

To specify a supported method on a route add a named function default export:

```js
// api/get.js
// sample GET route
export default function get(req, res) {
  res.json({ message: 'hello world' })
}
```

```js
// api/post.js
// sample POST route
export default function post(req, res) {
  res.json({ message: 'hello world' })
}
```

By default anonymous functions or named functions that are not one of the supported request methods are assumed to support ALL methods. In short, said functions are added to the Express router as:

```js
router.all(route, handler)
```

### Middleware

To apply middleware to the route's handler, export an array of functions in the order of execution:

```js
// api/middleware.js
function myMiddleware(req, res, next) {
  console.log('LOGGED FROM MYMIDDLEWARE')
  next()
}

function get(req, res) {
  res.json({ message: 'yay middleware!' })
}

export default [myMiddleware, get]
```

### Methods Routing

This package allows defining multiple supported HTTP methods per route with file-system methods routing:

```text
|- api/
  |- methods/
    |- :get.js
    |- :post.js
```

### Specifying Globally Supported Request Methods

FSRouter accepts an `options` argument:

```js
new FSRouter('api', { methods: ['POST'] })
```

By specifying only the POST method, all anonymous functions will assume the supported method as POST. However, specifying `ALL` in the `option.methods` will trump all other supplied methods and assign to the router as `router.all(route, handler)`.
