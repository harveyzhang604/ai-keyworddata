
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = neon(connectionString);

async function main() {
  try {
    console.log(`📊 Analyzing database: ${connectionString.split('@')[1].split('/')[0]}`);

    // 1. Count Total Keywords
    const totalKeywords = await sql`SELECT COUNT(*) as count FROM keywords`;
    console.log(`\n🔢 Total Keywords (unique strings): ${totalKeywords[0].count}`);

    // 2. Count Total Observations
    const totalObservations = await sql`SELECT COUNT(*) as count FROM keyword_observations`;
    console.log(`🔢 Total Observations: ${totalObservations[0].count}`);

    // 3. Count Mining Runs
    const runs = await sql`
      SELECT id, status, started_at, 
             (SELECT COUNT(*) FROM keyword_observations WHERE run_id = mining_runs.id) as obs_count
      FROM mining_runs 
      ORDER BY started_at DESC
    `;
    console.log(`\n🏃 Mining Runs Found: ${runs.length}`);
    runs.forEach(r => {
      console.log(`   - Run ID: ${r.id}, Status: ${r.status}, Started: ${r.started_at}, Count: ${r.obs_count}`);
    });

    // 4. Check for duplicates in 'keywords' (should be 0 if unique constraint works)
    const duplicateKeywords = await sql`
      SELECT keyword_norm, COUNT(*) as c 
      FROM keywords 
      GROUP BY keyword_norm 
      HAVING COUNT(*) > 1
    `;
    console.log(`\n👯 Duplicates in 'keywords' table: ${duplicateKeywords.length}`);

    // 5. Check for duplicate observations (same keyword in same run)
    const duplicateObs = await sql`
      SELECT run_id, keyword_id, COUNT(*) as c
      FROM keyword_observations
      GROUP BY run_id, keyword_id
      HAVING COUNT(*) > 1
    `;
    console.log(`👯 Duplicate observations (same keyword in same run): ${duplicateObs.length}`);
    
    // 6. Check for same specific keyword across multiple runs
    if (runs.length > 1) {
         const multiRunKeywords = await sql`
          SELECT keyword_id, COUNT(DISTINCT run_id) as run_count
          FROM keyword_observations
          GROUP BY keyword_id
          HAVING COUNT(DISTINCT run_id) > 1
          LIMIT 5
        `;
        console.log(`\n🔁 Keywords appearing in multiple runs: ${multiRunKeywords.length > 0 ? 'Yes (Example count: ' + multiRunKeywords.length + ')' : 'No'}`);
    }

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

main();
