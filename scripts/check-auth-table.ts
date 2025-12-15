import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables!");
  console.error("Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAuthTable() {
  console.log("🔍 Checking Supabase authentication setup...\n");

  try {
    // First, let's try to query the built-in auth.users table
    // Note: This requires service role key, but we can try with anon key
    console.log("1. Checking built-in auth.users table (if accessible)...");
    
    // Try to get all tables in the public schema
    console.log("\n2. Listing all tables in public schema...");
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public");

    if (tablesError) {
      console.log("   ⚠️  Could not query information_schema directly");
      console.log("   Trying alternative approach...\n");
    } else if (tables && tables.length > 0) {
      console.log(`   Found ${tables.length} tables:`);
      tables.forEach((table: any) => {
        console.log(`   - ${table.table_name}`);
      });
    }

    // Check for common authentication table names
    const authTableNames = [
      "users",
      "user",
      "auth_users",
      "authentication",
      "auth",
      "accounts",
      "profiles",
      "user_profiles",
      "user_accounts",
    ];

    console.log("\n3. Checking for authentication-related tables...");
    for (const tableName of authTableNames) {
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select("*", { count: "exact", head: true });

        if (!error) {
          console.log(`   ✅ Found table: ${tableName}`);
          console.log(`      Row count: ${count || 0}`);
          
          // Try to get the schema
          const { data: sampleData, error: sampleError } = await supabase
            .from(tableName)
            .select("*")
            .limit(1);

          if (!sampleError && sampleData && sampleData.length > 0) {
            console.log(`      Columns: ${Object.keys(sampleData[0]).join(", ")}`);
            console.log(`      Sample row:`, JSON.stringify(sampleData[0], null, 2));
          } else if (!sampleError) {
            // Table exists but is empty, let's try to get column info differently
            console.log(`      Table exists but is empty`);
          }
        }
      } catch (err: any) {
        // Table doesn't exist or not accessible
        if (!err.message?.includes("does not exist")) {
          console.log(`   ⚠️  ${tableName}: ${err.message}`);
        }
      }
    }

    // Try to query auth.users using RPC or direct query
    console.log("\n4. Attempting to access auth schema...");
    try {
      // This might work if we have proper permissions
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (!authError) {
        console.log("   ✅ Auth service is accessible");
      }
    } catch (err: any) {
      console.log(`   ⚠️  Cannot access auth service directly: ${err.message}`);
    }

    // List all schemas if possible
    console.log("\n5. Summary:");
    console.log("   To check the built-in auth.users table, you may need:");
    console.log("   - Service role key (for admin access)");
    console.log("   - Or check via Supabase Dashboard > Authentication > Users");
    console.log("\n   For custom authentication tables, check the table names listed above.");

  } catch (error: any) {
    console.error("❌ Error checking authentication:", error.message);
    console.error(error);
  }
}

checkAuthTable()
  .then(() => {
    console.log("\n✅ Check complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
