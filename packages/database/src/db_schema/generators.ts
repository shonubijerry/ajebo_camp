import { z } from "zod";

export const whereOperation = z.enum([
  "equals",
  "contains",
  "startsWith",
  "endsWith",
  "between",
  "notEqual",
  "doesNotContain",
  "lessThan",
  "greaterThan",
]);

type WhereClause = [
  column: string,
  operation: z.infer<typeof whereOperation>,
  value: string | number,
  value2?: string | number,
];

function formatValue(value: string | number): string {
  return typeof value === "string" ? `'${value}'` : `${value}`;
}

export function generateSqliteWhereStatement([
  column,
  operation,
  value,
  value2,
]: WhereClause): string {
  switch (operation) {
    case "equals":
      return `${column} = ${formatValue(value)}`;
    case "contains":
      return `${column} LIKE '%${value}%'`;
    case "startsWith":
      return `${column} LIKE '${value}%'`;
    case "endsWith":
      return `${column} LIKE '%${value}'`;
    case "between": {
      if (!value2) throw new Error("between operator must have end value");
      return `${column} BETWEEN ${formatValue(value)} AND ${formatValue(value2)}`;
    }
    case "notEqual":
      return `${column} <> ${formatValue(value)}`;
    case "doesNotContain":
      return `${column} NOT LIKE '%${value}%'`;
    case "lessThan":
      return `${column} < ${formatValue(value)}`;
    case "greaterThan":
      return `${column} > ${formatValue(value)}`;
    default:
      return ""; // Instead of throwing an error, return an empty string for invalid operations
  }
}
