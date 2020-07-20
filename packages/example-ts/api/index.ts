import { Request, Response } from 'express'

/**
 * Retrieve generic message
 *
 * @name API Entrypoint
 * @path {GET} /
 */
export default function get(req: Request, res: Response) {
  res.json({ message: 'Welcome to the Sample TypeScript Express API' })
}
