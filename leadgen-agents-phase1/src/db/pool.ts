import pg from "pg";
import { pgConfig } from "../lib/config.js";

export const pool = new pg.Pool(pgConfig());

export function q<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params as never);
}
