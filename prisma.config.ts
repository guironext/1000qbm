import { defineConfig } from "prisma/config";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || "",
  },
});

