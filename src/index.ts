import { ServerResponse as Response, IncomingMessage } from 'http'
import * as qs from 'querystring'
import { once, EventEmitter, on } from 'events'

// Extend the request object with body
export type ReqWithBody = EventEmitter &
  Partial<IncomingMessage> & {
    body?: any
  }

// Main function
const parsec = <T extends ReqWithBody>(fn: (body: any) => void) => async (req: ReqWithBody | T, _res: Response) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const body = await once(req, 'data').then((data) => {
      return fn(data)
    })

    req.body = body
  }
}

// JSON, raw, FormData

const json = () => async (req: ReqWithBody, _res?: Response, next?: () => void) => {
  await parsec((x) => JSON.parse(x.toString()))(req, _res)
  next?.()
}

const raw = () => async (req: ReqWithBody, _res?: Response, next?: () => void) => {
  await parsec((x) => x)(req, _res)
  next?.()
}

const text = () => async (req: ReqWithBody, _res?: Response, next?: () => void) => {
  await parsec((x) => x.toString())(req, _res)
  next?.()
}

const form = () => async (req: ReqWithBody, _res?: Response, next?: () => void) => {
  await parsec((x) => qs.parse(x.toString()))(req, _res)
  next?.()
}

export { parsec as custom, json, raw, text, form }
