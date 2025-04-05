import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), 'server/.env'); // 👈 resolves to project root
dotenv.config({ path: envPath });
