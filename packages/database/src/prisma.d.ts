import { UserSchema } from "./db_schema";

declare global {
  namespace PrismaJson {
    type UserMeta = typeof UserSchema.shape.meta._type;
  }
}
