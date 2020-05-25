import fs from 'fs'
import path from 'path'
import express from 'express'

/**
 * Get array of file paths
 * @name GetFileRoutes
 * @param {Object} - default single object argument
 * @param {string} directory - path for directory to traverse
 * @param {regex} [ignore] - ignore file path regex
 * @param {regex} [include] - default file extension to include
 * @returns {map} Map of full path to file and default export (handler)
 *
 */
const getFileRoutes = async ({ directory, ignore = /_/, include = /\.js$/ }) => {
  const result = new Map()
  const nestedGetFiles = async nestedDirectory => {
    const files = fs.readdirSync(nestedDirectory, { withFileTypes: true })
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      const fPath = path.join(nestedDirectory, f.name)
      if (!ignore.test(f.name)) {
        if (f.isDirectory()) {
          nestedGetFiles(fPath)
        } else if (include.test(f.name)) {
          // eslint-disable-next-line no-await-in-loop
          const mod = await import(fPath)
          result.set(
            `${nestedDirectory}/${f.name}`
              .replace(directory, '')
              .slice(1)
              .replace(/\.js$/, ''),
            mod?.default || mod
          )
        }
      }
    }
  }
  await nestedGetFiles(directory)
  return result
}

// Default handler for imports that do not export a function
const defaultHandler = (req, res) =>
  res.status(501).json({
    message:
      'This route is not yet set up, to complete the setup export a default function accepting `request` and `response` as arguments.',
  })

/**
 * FileSystem Router for Express
 * @constructor
 * @name FSRouter
 * @param {string} [directory] - relative path to pull routes from
 * @param {Object} options - options to customize FSRouter
 * @param {Array} options.methods - specify allowed global methods
 *
 */
export default function FSRouter(directory = 'api', options = {}) {
  if (!directory) throw new Error(`Unable to create FileSystem Router from directory: ${directory}`)
  this.global = {
    methods: options?.methods?.map(m => m.toLowerCase()) || [
      'get',
      'post',
      'put',
      'delete',
      'patch',
      'options',
      'all',
    ],
  }

  this.init = function() {
    const router = express.Router()
    const project = path.resolve(directory)
    getFileRoutes({ directory: project }).then(files => {
      for (const [path, handler] of files.entries()) {
        // set method var holder, will be null if path does not match regex
        let method = path
          .match(/:(get|post|put|patch|options|all)$/g)
          ?.shift()
          .replace(/^:/, '')
          .toLowerCase()
        const route = `/${path
          .replace(/\/index$/g, '')
          .replace(/\/:(get|post|put|patch|options|all)$/g, '')}`

        // check to make sure route does not already exist
        if (router.stack.some(layer => layer.route.path === route)) {
          const existing = router.stack.find(layer => layer.route.path === route)
          if (!method && (!handler?.name || handler?.name === 'all')) {
            // ensure an anonymous function with similar naming does not trump file-based methods (i.e. /methods/:get.js vs /methods.js)
            console.warn(
              `Duplicate entry detected: ${route} with implied method ALL. Consider deleting ${directory}/${path}.js. Skipping...`
            )
            continue
          } else if (!method && Object.keys(existing.route.methods).length) {
            // don't allow users to add top-level `methods.js` with handler name of `put` and add to route with existing records'
            console.warn(
              `Duplicate entry detected: ${route} where file-system methods routes are enabled. Consider deleting ${directory}/${path}.js. Skipping...`
            )
            continue
          } else if (Object.keys(existing.route.methods).includes(method || handler?.name)) {
            // warn user of duplicate entries for same route and method
            console.warn(
              `Duplicate entry detected: ${route} with method ${method ||
                handler?.name}. Consider deleting ${directory}/${path}.js. Skipping...`
            )
            continue
          }
        }

        switch (typeof handler) {
          case 'function': {
            // verify globally supported methods support handler name (HTTP Method)
            if (this.global.methods.includes(handler.name?.toLowerCase())) {
              // set method if not already defined
              if (!method) method = handler.name
              // apply handler via name -- function get() {}
              router[method](route, handler)
              this._added.push({
                route,
                method,
                handler,
              })
            } else {
              // check if method exists before proceeding
              if (method) router[method](route, handler)
              else {
                // fallback to ALL if present in globally supported methods
                if (this.global.methods.includes('all')) router.all(route, handler)
                else {
                  // if 'all' does not exist, use every other defined method
                  for (const method in this.global.methods) {
                    router[method](route, handler)
                    this._added.push({
                      route,
                      method,
                      handler,
                    })
                  }
                }
              }
            }
            break
          }
          case 'object': {
            // check if array
            if (Array.isArray(handler) && handler.length) {
              // verify each item in array is of type Function
              for (const fn of handler) {
                if (typeof fn !== 'function')
                  throw new Error(`Unable to apply exported middleware for route "${path}"`)
              }

              if (!method) method = handler[handler.length - 1].name
              // verify last item in the array (the actual handler)'s name is supported
              if (this.global.methods.includes(method)) {
                router[method](route, ...handler)
              } else {
                router.all(route, ...handler)
              }
            } else {
              console.warn(
                `[FS-ROUTER] Warning! Route "${path}" was expected to export a Function or Array, applying default handler`
              )
              router.all(route, defaultHandler)
            }
            break
          }
          default: {
            console.warn(
              `[FS-ROUTER] Warning! Route "${path}" does not export a Function, applying default handler`
            )
            router.all(route, defaultHandler)
            break
          }
        }
      }
    })
    return router
  }

  return this.init()
}
