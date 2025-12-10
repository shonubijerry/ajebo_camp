import { JSONQueryPayload, UpdateJSONPayload } from './db_schema'

export const prepareJsonUpsertQuery = ({
  table,
  field,
  keyPath,
  value,
  where,
}: UpdateJSONPayload) => {
  return `
        UPDATE ${table}
        SET ${field} = json_set(${field}, '${keyPath}', '${String(value)}')
        WHERE ${where};
    `
}

export const prepareJsonReadQuery = ({
  table,
  field,
  keyPath,
  where,
}: JSONQueryPayload) => {
  return `SELECT json_extract(${field}, '${keyPath}') as value FROM ${table} WHERE ${where}`
}
