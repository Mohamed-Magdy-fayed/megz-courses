import { createRouter } from '@trpc/server';
import { z } from 'zod';

const appRouter = createRouter()
  .query('hello', {
    input: z.string().optional(),
    resolve: ({ input }) => {
      return `Hello ${input ?? 'world'}`;
    },
  });