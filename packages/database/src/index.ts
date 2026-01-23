import { WorkerEntrypoint } from "cloudflare:workers";

export interface Env {
  DB: D1Database;
}

export const prismaCampExtension = {
  name: "prisma-extension-camp-fields",
  result: {
    camp: {
      is_active: {
        needs: {
          start_date: true,
          end_date: true,
        },
        compute(camp: { start_date: Date; end_date: Date }) {
          const now = new Date();
          return camp.start_date <= now && camp.end_date >= now;
        },
      },
      is_coming_soon: {
        needs: {
          start_date: true,
          end_date: true,
        },
        compute(camp: { start_date: Date; end_date: Date }) {
          const now = new Date();
          return camp.start_date > now;
        },
      },
    },
  },
  model: {},
  query: {},
  client: {},
};

export default class extends WorkerEntrypoint<Env> {
  fetch() {
    return new Response("running");
  }
}

export * from "./db_schema";
export * from "./generated/prisma";
export * from "./raw_query";
