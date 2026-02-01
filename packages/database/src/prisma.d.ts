import { campResponse, userResponse } from "./db_schema";

declare global {
  namespace PrismaJson {
    type UserMeta = typeof userResponse.shape.meta._type;
    type CampHighlights = typeof campResponse.shape.highlights._type;
  }
}
