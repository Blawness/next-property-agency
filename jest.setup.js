import '@testing-library/jest-dom'

const basicGlobals = {
  TextEncoder: require('util').TextEncoder,
  TextDecoder: require('util').TextDecoder,
  ReadableStream: require('stream/web').ReadableStream,
  WritableStream: require('stream/web').WritableStream,
  TransformStream: require('stream/web').TransformStream,
  // undici needs MessagePort at import time. Deliberately no MessageChannel:
  // jsdom has none, and borrowing Node's made React's scheduler open a port
  // that is never closed, which kept the event loop alive after the last test
  // and forced jest to run with --forceExit. Without it the scheduler falls
  // back to setTimeout, which leaves no handle behind.
  MessagePort: require('worker_threads').MessagePort,
  BroadcastChannel: require('worker_threads').BroadcastChannel,
  Blob: require('buffer').Blob,
  File: require('buffer').File,
}
for (const [key, value] of Object.entries(basicGlobals)) {
  if (typeof globalThis[key] === 'undefined') {
    globalThis[key] = value
  }
}

const undici = require('undici')
const undiciGlobals = {
  FormData: undici.FormData,
  Headers: undici.Headers,
  Request: undici.Request,
  Response: undici.Response,
  fetch: undici.fetch,
}
for (const [key, value] of Object.entries(undiciGlobals)) {
  if (typeof globalThis[key] === 'undefined') {
    globalThis[key] = value
  }
}
