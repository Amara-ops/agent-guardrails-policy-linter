import { createRequire } from 'node:module';
import type { ErrorObject } from 'ajv';

const require = createRequire(import.meta.url);
const Ajv2020 = (require('ajv/dist/2020') as any).default ?? require('ajv/dist/2020');
const schema = require('../schema.json');

export const ajv = new Ajv2020({ allErrors: true, strict: false });
export const validator = ajv.compile(schema as any);
export type AjvError = ErrorObject;