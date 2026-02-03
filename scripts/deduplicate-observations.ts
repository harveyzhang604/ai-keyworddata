
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
    console.log(`🧹 Starting deduplication on: ${connectionString.split('@')[1].split('/')[0]}`);

    // Logic: For each keyword, keep only the observation with the HIGHEST ID (latest).
    // We can do this with a single DELETE statement using a subquery.

    console.log('🔍 Identifying duplicate observations...');

    // Delete observations that are NOT the max ID for their keyword_id
    const result = await sql`
      DELETE FROM keyword_observations
      WHERE id NOT IN (
        SELECT MAX(id)
        FROM keyword_observations
        GROUP BY keyword_id
      )
    `;

    console.log(`✅ Deleted ${result.length || result.count || 'some'} duplicate observations.`);
    
    // Refresh the view if it exists
    try {
        await sql`REFRESH MATERIALIZED VIEW keyword_latest`;
        console.log('✅ Refreshed keyword_latest view.');
    } catch (e) {
        console.log('ℹ️  No materialized view to refresh or refresh failed (ignorable).');
    }

    // Verify counts
    const totalKeywords = await sql`SELECT COUNT(*) as count FROM keywords`;
    const totalObs = await sql`SELECT COUNT(*) as count FROM keyword_observations`;
    
    console.log(`\n📊 Post-Cleanup Stats:`);
    console.log(`   - Keywords: ${totalKeywords[0].count}`);
    console.log(`   - Observations: ${totalObs[0].count}`);

    if (totalKeywords[0].count == totalObs[0].count) {
        console.log('✨ Perfect! 1 observation per keyword.');
    } else {
        console.log('⚠️  Still have some discrepancies, but duplicates should be gone.');
    }

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

main();
