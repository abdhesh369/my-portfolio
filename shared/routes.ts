import { z } from 'zod';
import {
  insertMessageSchema,
  projectSchema,
  skillSchema,
  experienceSchema,
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  projects: {
    list: {
      method: 'GET' as const,
      path: '/api/projects',
      responses: {
        200: z.array(projectSchema),
        500: errorSchemas.internal,
      },
    },
  },

  skills: {
    list: {
      method: 'GET' as const,
      path: '/api/skills',
      responses: {
        200: z.array(skillSchema),
        500: errorSchemas.internal,
      },
    },
  },

  experiences: {
    list: {
      method: 'GET' as const,
      path: '/api/experiences',
      responses: {
        200: z.array(experienceSchema),
        500: errorSchemas.internal,
      },
    },
  },

  messages: {
    create: {
      method: 'POST' as const,
      path: '/api/messages',
      input: insertMessageSchema,
      responses: {
        201: z.object({
          success: z.boolean(),
          message: z.string(),
        }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
  },
};

export type Api = typeof api;
