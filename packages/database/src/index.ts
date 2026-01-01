import { PrismaD1 } from "@prisma/adapter-d1";
import { WorkerEntrypoint } from "cloudflare:workers";
import { Prisma, PrismaClient } from "./generated/prisma";
import {
  DynamicClientExtensionThis,
  InternalArgs,
} from "@prisma/client/runtime/client";

export interface Env {
  DB: D1Database;
}

type PrismaCampExtension = {
  result: {
    camp: {
      is_active: () => {
        needs: {
          start_date: true;
          end_date: true;
        };
        compute(camp: { start_date: Date; end_date: Date }): boolean;
      };
      is_coming_soon: () => {
        needs: {
          start_date: true;
          end_date: true;
        };
        compute(camp: { start_date: Date; end_date: Date }): boolean;
      };
    };
  };
  model: {};
  query: {};
  client: {};
};

export default class extends WorkerEntrypoint<Env> {
  fetch() {
    return new Response("ok");
  }

  getExtendedClient() {
    const adapter = new PrismaD1(this.env.DB);
    return new PrismaClient({
      adapter,
      log: ["info", "warn", "error"],
    }).$extends({
      result: {
        camp: {
          is_active: {
            needs: { start_date: true, end_date: true },
            compute(camp) {
              return new Date(camp.end_date) >= new Date();
            },
          },
          is_coming_soon: {
            needs: { start_date: true, end_date: true },
            compute(camp) {
              return new Date(camp.start_date) > new Date();
            },
          },
        },
      },
    });
  }

  prisma() {
    return this.getExtendedClient()
      .camp.findFirst()
      .then((camp) => {
        return;
      });
  }
}

export * from "./db_schema";
export * from "../../../api/src/routes/generic/create";
export * from "./generated/prisma";
export * from "./raw_query";
export type PrismaExtendedClient = DynamicClientExtensionThis<
  Prisma.TypeMap<InternalArgs & PrismaCampExtension, {}>,
  Prisma.TypeMapCb<{
    adapter: PrismaD1<D1Database>;
    log: ("info" | "warn" | "error")[];
  }>,
  PrismaCampExtension
>;
