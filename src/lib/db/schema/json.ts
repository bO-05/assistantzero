import { z } from 'zod';

const jsonValueSchema = z.json();
export type DatabaseJson = z.infer<typeof jsonValueSchema>;
