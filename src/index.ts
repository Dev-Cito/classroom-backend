import { eq } from 'drizzle-orm';
import { db, pool } from './db';
import { departments } from './schema';

async function main() {
  try {
    console.log('Performing CRUD operations...');

    // CREATE: Insert a new department
    const [newDepartment] = await db
      .insert(departments)
      .values({ code: 'CS', name: 'Computer Science', description: 'Main CS department' })
      .returning();

    if (!newDepartment) {
      throw new Error('Failed to create department');
    }

    console.log('✅ CREATE: New department created:', newDepartment);

    // READ: Select the user
    const foundDepartment = await db
      .select()
      .from(departments)
      .where(eq(departments.id, newDepartment.id));
    console.log('✅ READ: Found department:', foundDepartment[0]);

    // UPDATE: Change the user's name
    const [updatedDepartment] = await db
      .update(departments)
      .set({ name: 'Computer Science & Engineering' })
      .where(eq(departments.id, newDepartment.id))
      .returning();

    if (!updatedDepartment) {
      throw new Error('Failed to update department');
    }

    console.log('✅ UPDATE: Department updated:', updatedDepartment);

    // DELETE: Remove the user
    await db.delete(departments).where(eq(departments.id, newDepartment.id));
    console.log('✅ DELETE: Department deleted.');

    console.log('\nCRUD operations completed successfully.');
  } catch (error) {
    console.error('❌ Error performing CRUD operations:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log('Database pool closed.');
    }
  }
}

main();
