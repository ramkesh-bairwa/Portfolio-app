import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const db = process.env.DB_NAME || 'portfolio_app';
const conn = await mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
});

await conn.query(`CREATE DATABASE IF NOT EXISTS \`${db}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
await conn.query(`USE \`${db}\``);
await conn.query(fs.readFileSync(path.resolve('database/schema.sql'), 'utf8'));

// Columns added after the first release: add them to databases created before
const ADDED_COLUMNS = [
  ['portfolios', 'slug', 'VARCHAR(40) NULL UNIQUE AFTER data'],
  ['portfolios', 'published_data', 'LONGTEXT NULL AFTER slug'],
  ['portfolios', 'published_at', 'DATETIME NULL AFTER published_data'],
  ['users', 'plan_id', 'INT UNSIGNED NULL AFTER free_access'],
  ['premium_requests', 'plan_id', 'INT UNSIGNED NULL AFTER message'],
];
for (const [table, column, def] of ADDED_COLUMNS) {
  const [found] = await conn.query('SELECT 1 FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ?', [db, table, column]);
  if (!found.length) {
    await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${def}`);
    console.log(`Added ${table}.${column}`);
  }
}
console.log(`Schema ready in "${db}"`);

// Starter plans, only on an empty table so plans an admin edited or deleted are not brought back
const [[{ n: planCount }]] = await conn.query('SELECT COUNT(*) AS n FROM plans');
if (!planCount) {
  const STARTER_PLANS = [
    ['Basic', 49, 'For getting your first portfolio online.', ['Publish your portfolio to a live link', 'Download resume PDFs and posters', 'Premium portfolio and resume templates'], 0, 1],
    ['Pro', 79, 'For job seekers who want every advantage.', ['Everything in Basic', 'Top-ranking ATS Pro resume designs', 'Copy a poster design from a photo'], 1, 2],
    ['Business', 99, 'For freelancers and teams who need more.', ['Everything in Pro', 'Priority support', 'Early access to new templates'], 0, 3],
  ];
  for (const [name, price, description, features, popular, sort] of STARTER_PLANS) {
    await conn.query(
      'INSERT INTO plans (name, price, currency, period, description, features, is_popular, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, price, 'USD', 'year', description, features.join('\n'), popular, sort]
    );
  }
  console.log('Added starter plans: $49, $79, $99');
}

const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
const [rows] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
if (!rows.length) {
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@12345', 10);
  await conn.query(
    "INSERT INTO users (name, email, password_hash, auth_type, role, status, is_premium, free_access) VALUES (?, ?, ?, 'email', 'admin', 'active', 1, 1)",
    [process.env.ADMIN_NAME || 'Admin', email, hash]
  );
  console.log(`Admin created: ${email}`);
} else {
  console.log(`Admin already exists: ${email}`);
}
await conn.end();
