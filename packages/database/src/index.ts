import { PrismaD1 } from "@prisma/adapter-d1";
import { WorkerEntrypoint } from "cloudflare:workers";
import { PrismaClient } from "./generated/prisma";

export interface Env {
  DB: D1Database;
}

export default class extends WorkerEntrypoint<Env> {
  fetch() {
    return new Response("ok");
  }

  prisma() {
    const adapter = new PrismaD1(this.env.DB);

    return new PrismaClient({
      adapter,
      log: ["info", "warn", "error"],
    });
  }
}

export * from "./db_schema";
export * from "../../../api/src/routes/generic/create";
export * from "./generated/prisma";
export * from "./raw_query";
