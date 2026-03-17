import express from "express";
import { db } from "../db/index.js";
import { user } from "../db/schema/auth.js";
import { and, or, ilike, eq, desc, sql, getTableColumns } from "drizzle-orm";

const router = express.Router();

router.get("/", async (req, res) => {  try {
    const search = req.query.search as string | undefined;
    const role = req.query.role as string | undefined;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const cols = getTableColumns(user);

    // build where clause
    const whereClauses: any[] = [];

    if (search) {
      const pattern = `%${search}%`;
      whereClauses.push(
        or(
          ilike(cols.name as any, pattern),
          ilike(cols.email as any, pattern)
        )
      );
    }

    if (role) {
      whereClauses.push(eq(cols.role as any, role));
    }

    const where = whereClauses.length ? and(...whereClauses) : undefined;

    // count
    const countResult = await db
      .select({ count: sql`count(*)` })
      .from(user)
      .where(where);

    const total = Number((countResult && countResult[0] && (countResult[0] as any).count) || 0);
    const totalPages = Math.ceil(total / limit);

    // data
    const data = await db
      .select()
      .from(user)
      .where(where)
      .orderBy(desc(cols.createdAt as any))
      .limit(limit)
      .offset(offset);

    res.json({ data, pagination: { page, limit, total, totalPages } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

export default router;
