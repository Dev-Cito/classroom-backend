import express from "express";
import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { classes, subjects } from "../db/schema/index.js";
import { user } from "../db/schema/auth.js";
import { nanoid } from "nanoid";

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { search, subject, teacher, page = 1, limit = 10 } = req.query;

        const currentPage = Math.max(1, +page);
        const limitPerPage = Math.max(1, +limit);
        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        if (search) {
            const searchPattern = `%${String(search).replace(/[%_]/g, '\\$&')}%`;
            filterConditions.push(
                or(
                    ilike(classes.name, searchPattern),
                    ilike(classes.inviteCode, searchPattern)
                )
            );
        }

        if (subject) {
            filterConditions.push(ilike(subjects.name, `%${subject}%`));
        }

        if (teacher) {
            filterConditions.push(ilike(user.name, `%${teacher}%`));
        }

        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(classes)
            .leftJoin(subjects, eq(classes.subjectId, subjects.id))
            .leftJoin(user, eq(classes.teacherId, user.id))
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        const classesList = await db
            .select({
                ...getTableColumns(classes),
                subject: { ...getTableColumns(subjects) },
                teacher: { ...getTableColumns(user) },
            })
            .from(classes)
            .leftJoin(subjects, eq(classes.subjectId, subjects.id))
            .leftJoin(user, eq(classes.teacherId, user.id))
            .where(whereClause)
            .orderBy(desc(classes.createdAt))
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: classesList.map(c => ({
                ...c,
                inviteCode: c.inviteCode?.toUpperCase() ?? c.inviteCode,
            })),
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage),
            }
        });

    } catch (e) {
        console.error(`Get /classes error : ${e}`);
        res.status(500).json('Failed to get classes');
    }
});

router.post('/', async (req, res) => {
    try {
        const {
            name,
            subjectId,
            teacherId,
            description,
            capacity,
            schedules,
            bannerUrl,
            bannerCldPubId,
        } = req.body;

        if (!name || !subjectId || !teacherId) {
            res.status(400).json({ error: 'name, subjectId and teacherId are required' });
            return;
        }

        // Generate a unique 8-character invite code
        const inviteCode = nanoid(8).toLowerCase();

        const result = await db
            .insert(classes)
            .values({
                name,
                subjectId: +subjectId,
                teacherId,
                inviteCode,
                description,
                capacity: capacity ? +capacity : 50,
                schedules: schedules ?? [],
                bannerUrl,
                bannerCldPubId,
            })
            .returning();

        if (!result || result.length === 0) {
            res.status(500).json({ error: 'Failed to create class' });
            return;
        }

        const newClass = result[0] as typeof result[0];
        res.status(201).json({
            ...newClass,
            inviteCode: newClass.inviteCode.toUpperCase(),
        });

    } catch (e) {
        console.error(`POST /classes error: ${e}`);
        res.status(500).json({ error: 'Failed to create class' });
    }
});

export default router;