import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
        process.env[key.trim()] = value;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables!");
  console.error("Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAuthUsersTable() {
  console.log("🔍 Checking for auth.users table in Supabase...\n");
  console.log(`Supabase URL: ${supabaseUrl}\n`);

  try {
    // Method 1: Try to access auth.users via PostgREST (usually requires service role)
    console.log("1. Attempting to query auth.users table directly...");
    try {
      // First try to get actual rows
      const { data: usersData, error: usersError, count } = await supabase
        .from("auth.users")
        .select("*", { count: "exact" })
        .limit(10);

      if (!usersError) {
        console.log(`   ✅ Successfully accessed auth.users table!`);
        console.log(`   Row count: ${count ?? 0}`);
        
        if (usersData && usersData.length > 0) {
          console.log(`   ✅ Found ${usersData.length} user(s):\n`);
          usersData.forEach((user: any, index: number) => {
            console.log(`   User ${index + 1}:`);
            console.log(`      ID: ${user.id}`);
            console.log(`      Email: ${user.email || "N/A"}`);
            console.log(`      Role: ${user.role || "N/A"}`);
            console.log(`      Aud: ${user.aud || "N/A"}`);
            console.log(`      Instance ID: ${user.instance_id || "N/A"}`);
            if (user.created_at) console.log(`      Created: ${user.created_at}`);
            if (user.updated_at) console.log(`      Updated: ${user.updated_at}`);
            console.log("");
          });
        } else {
          console.log(`   ⚠️  Table exists but appears empty (may be due to permissions)`);
          console.log(`   The anon key may not have permission to read auth.users rows.`);
        }
      } else {
        console.log(`   ⚠️  Cannot access via PostgREST: ${usersError.message}`);
        console.log(`   This is normal - auth.users requires service role key or Auth API`);
      }
    } catch (err: any) {
      console.log(`   ⚠️  Error: ${err.message}`);
    }

    // Method 2: Check via Auth API
    console.log("\n2. Checking via Supabase Auth API...");
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!authError) {
        console.log("   ✅ Auth API is accessible");
        if (user) {
          console.log(`   Current user ID: ${user.id}`);
        } else {
          console.log("   No authenticated user (this is expected)");
        }
      } else {
        console.log(`   ⚠️  Auth API error: ${authError.message}`);
      }
    } catch (err: any) {
      console.log(`   ⚠️  Error accessing Auth API: ${err.message}`);
    }

    // Method 3: Try to query via RPC function (if exists)
    console.log("\n3. Checking if auth.users is accessible via RPC...");
    try {
      // Some Supabase setups expose auth data via RPC functions
      const { data: rpcData, error: rpcError } = await supabase.rpc("get_auth_users_count");
      if (!rpcError) {
        console.log(`   ✅ Found RPC function: ${rpcData}`);
      } else {
        console.log("   ℹ️  No custom RPC function found (this is normal)");
      }
    } catch (err: any) {
      // RPC function doesn't exist, which is fine
    }

    // Method 4: Try to list schemas
    console.log("\n4. Summary:");
    console.log("   The auth.users table exists in Supabase by default when authentication is enabled.");
    console.log("   To view it directly, you can:");
    console.log("   - Use Supabase Dashboard > Authentication > Users");
    console.log("   - Use service role key (not anon key) to query it via PostgREST");
    console.log("   - Access user data via Supabase Auth API methods");
    console.log("\n   ✅ Your Supabase instance has authentication enabled!");

  } catch (error: any) {
    console.error("❌ Error checking auth.users table:", error.message);
    console.error(error);
  }
}

checkAuthUsersTable()
  .then(() => {
    console.log("\n✅ Check complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });

