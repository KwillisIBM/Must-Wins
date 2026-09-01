import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local (optional, for local development)
try {
  const dotenv = await import('dotenv');
  dotenv.config({ path: path.join(__dirname, '../.env.local') });
} catch (err) {
  // dotenv not available in production, environment variables set directly
  console.log('ℹ️  Running without dotenv (production mode)');
}

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../data');

// Ensure data directory exists
await fs.mkdir(DATA_DIR, { recursive: true });

// Middleware
app.use(cors());
app.use(express.json());

// ─── OAuth2 proxy identity helpers ────────────────────────────────────────────
// IBM oauth2-proxy injects the authenticated user's claims as request headers.
// Never use req.user (Passport). Just read these headers directly.

function getEmailFromProxy(req) {
  return (
    req.get('x-auth-request-email') ||
    req.get('x-forwarded-email') ||
    req.get('x-auth-request-preferred-username') ||
    (process.env.NODE_ENV !== 'production' ? (process.env.DEV_FAKE_EMAIL || '') : '') ||
    ''
  );
}

function getDisplayNameFromProxy(req) {
  return (
    req.get('x-auth-request-user') ||
    req.get('x-forwarded-user') ||
    req.get('x-auth-request-preferred-username') ||
    req.get('x-auth-request-name') ||
    ''
  );
}

// Middleware: attach req.__email / req.__display_name from proxy headers.
// In local dev set DEV_BYPASS_SSO=true in .env.local to skip the check.
function requireProxyIdentity(req, res, next) {
  const DEV_MODE =
    process.env.NODE_ENV !== 'production' && process.env.DEV_BYPASS_SSO === 'true';

  if (DEV_MODE) {
    req.__email = process.env.DEV_FAKE_EMAIL || 'dev@local.test';
    req.__display_name = 'Local Developer';
    return next();
  }

  const email = getEmailFromProxy(req);
  if (!email) return res.status(401).json({ error: 'No proxy identity' });

  req.__email = email;
  req.__display_name = getDisplayNameFromProxy(req);
  next();
}

// ─── Admin helpers ─────────────────────────────────────────────────────────────
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean);

const ADMIN_BLUEGROUPS = (process.env.ADMIN_BLUEGROUPS || '')
  .split(',')
  .map(group => group.trim().toLowerCase())
  .filter(Boolean);

function isAdmin(email, bluegroups = []) {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase();
  if (ADMIN_EMAILS.includes(normalizedEmail)) return true;
  if (ADMIN_BLUEGROUPS.length > 0 && bluegroups.length > 0) {
    const normalizedGroups = bluegroups.map(g => g.toLowerCase());
    return ADMIN_BLUEGROUPS.some(adminGroup => normalizedGroups.includes(adminGroup));
  }
  return false;
}

function requireAdmin(req, res, next) {
  // req.__email is set by requireProxyIdentity if that middleware ran first,
  // otherwise fall back to reading headers directly.
  const email = req.__email || getEmailFromProxy(req);
  if (!isAdmin(email)) {
    return res.status(403).json({
      error: 'Forbidden: Admin access required',
      message: 'You do not have permission to perform this action'
    });
  }
  next();
}

// File paths
const USE_CASES_FILE = path.join(DATA_DIR, 'use-cases.json');
const LIKES_FILE = path.join(DATA_DIR, 'likes.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');

// Initialize files if they don't exist
async function initializeFile(filePath, defaultData) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
  }
}

// Read JSON file
async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
}

// Write JSON file
async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Initialize data files on startup — seed use-cases if the file is new/empty
import { INITIAL_USE_CASES } from './seed.js';
import { MUST_WINS } from '../src/data/mustWinsData.js';

const KNOWN_MUST_WIN_NAMES = new Set(MUST_WINS.map((m) => m.name.toLowerCase()));

// Validate a single bulk row with the same rules enforced by the frontend preview step.
// Returns an array of reason strings; empty means valid.
function validateBulkRow(row, existingNamesLower) {
  const reasons = [];

  const name = (row.name ?? '').trim();
  const mustWinName = (row.mustWinName ?? '').trim();
  const narrative = (row.narrative ?? '').trim();
  const pitch = (row.pitch ?? '').trim();
  const products = Array.isArray(row.products) ? row.products.filter((p) => typeof p === 'string' && p.trim()) : [];
  const goldenPathSteps = Array.isArray(row.goldenPathSteps)
    ? row.goldenPathSteps.filter((s) => s && typeof s.label === 'string' && s.label.trim())
    : [];
  const links = Array.isArray(row.links) ? row.links : [];

  if (!name)       reasons.push('missing name');
  if (!mustWinName) reasons.push('missing mustWinName');
  if (mustWinName && !KNOWN_MUST_WIN_NAMES.has(mustWinName.toLowerCase()))
    reasons.push(`"${mustWinName}" doesn't match a known Must Win`);
  if (!narrative)  reasons.push('missing narrative');
  if (!pitch)      reasons.push('missing pitch');
  if (products.length < 1) reasons.push('at least 1 product required');
  if (products.length > 3) reasons.push('maximum 3 products allowed');
  if (goldenPathSteps.length < 2) reasons.push('at least 2 golden path steps required');
  if (goldenPathSteps.length > 5) reasons.push('maximum 5 golden path steps allowed');

  const stepsWithoutDescription = goldenPathSteps.filter(
    (s) => !s.description || !(s.description).toString().trim()
  );
  if (stepsWithoutDescription.length > 0)
    reasons.push(`golden path step(s) missing description: ${stepsWithoutDescription.map((s) => `"${s.label}"`).join(', ')}`);

  const linksWithUrl = links.filter((l) => l && (l.url ?? '').trim());
  const linksWithoutTitle = linksWithUrl.filter((l) => !(l.title ?? '').trim());
  if (linksWithoutTitle.length > 0)
    reasons.push(`link(s) missing title: ${linksWithoutTitle.map((l) => `"${l.url}"`).join(', ')}`);

  if (name && existingNamesLower.has(name.toLowerCase()))
    reasons.push(`"${name}" already exists`);

  return reasons;
}
await initializeFile(USE_CASES_FILE, INITIAL_USE_CASES);
await initializeFile(LIKES_FILE, {});
await initializeFile(COMMENTS_FILE, {});

// ─── API Routes ────────────────────────────────────────────────────────────

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all use cases
app.get('/api/use-cases', async (req, res) => {
  try {
    const useCases = await readJSON(USE_CASES_FILE);
    res.json(useCases || []);
  } catch (error) {
    console.error('Error fetching use cases:', error);
    res.status(500).json({ error: 'Failed to fetch use cases' });
  }
});

// Submit a new use case
app.post('/api/use-cases', async (req, res) => {
  try {
    const useCases = await readJSON(USE_CASES_FILE) || [];
    const newUseCase = {
      ...req.body,
      id: `uc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    useCases.unshift(newUseCase); // Add to beginning
    await writeJSON(USE_CASES_FILE, useCases);
    
    res.status(201).json(newUseCase);
  } catch (error) {
    console.error('Error creating use case:', error);
    res.status(500).json({ error: 'Failed to create use case' });
  }
});

// Bulk submit use cases (admin only)
app.post('/api/use-cases/bulk', requireAdmin, async (req, res) => {
  try {
    const rows = Array.isArray(req.body) ? req.body : [];
    if (rows.length === 0) {
      return res.status(400).json({ error: 'No rows provided' });
    }

    const useCases = await readJSON(USE_CASES_FILE) || [];
    const existingNamesLower = new Set(useCases.map((uc) => (uc.name ?? '').toLowerCase()));
    const results = [];
    const now = Date.now();

    for (let i = 0; i < rows.length; i++) {
      const reasons = validateBulkRow(rows[i], existingNamesLower);
      if (reasons.length > 0) {
        results.push({ index: i, success: false, error: reasons.join('; ') });
        continue;
      }

      const newUseCase = {
        name: (rows[i].name ?? '').trim(),
        date: rows[i].date ?? null,
        products: rows[i].products.filter((p) => p.trim()).slice(0, 3),
        mustWinName: rows[i].mustWinName.trim(),
        mustWinDetails: rows[i].mustWinDetails ?? '',
        narrative: rows[i].narrative.trim(),
        goldenPathSteps: rows[i].goldenPathSteps.slice(0, 5),
        goldenPathSummary: rows[i].goldenPathSummary ?? '',
        pitch: rows[i].pitch.trim(),
        links: (rows[i].links ?? []).filter((l) => (l.url ?? '').trim() && (l.title ?? '').trim()),
        id: `uc-${now}-${i}`,
        createdAt: new Date().toISOString(),
      };

      useCases.unshift(newUseCase);
      // Add to the existing names set so duplicates within the same batch are also caught
      existingNamesLower.add(newUseCase.name.toLowerCase());
      results.push({ index: i, success: true, id: newUseCase.id });
    }

    // Only write if at least one row succeeded
    if (results.some((r) => r.success)) {
      await writeJSON(USE_CASES_FILE, useCases);
    }

    res.status(201).json({ results });
  } catch (error) {
    console.error('Error bulk creating use cases:', error);
    res.status(500).json({ error: 'Failed to bulk create use cases' });
  }
});

// Get likes for a use case
app.get('/api/likes/:useCaseId', async (req, res) => {
  try {
    const likes = await readJSON(LIKES_FILE) || {};
    const list = likes[req.params.useCaseId] || [];
    res.json({ count: list.length, emails: list });
  } catch (error) {
    console.error('Error fetching likes:', error);
    res.status(500).json({ error: 'Failed to fetch likes' });
  }
});

// Increment likes for a use case
app.post('/api/likes/:useCaseId', async (req, res) => {
  try {
    const likes = await readJSON(LIKES_FILE) || {};    
    const email = getEmailFromProxy(req);
    const list = likes[req.params.useCaseId] || [];

    if (email && !list.includes(email)) {
      list.push(email)
    }

    likes[req.params.useCaseId] = list;
    await writeJSON(LIKES_FILE, likes);
    res.json({count: list.length, emails: list});
  } catch (error) {
    console.error('Error incrementing likes:', error);
    res.status(500).json({ error: 'Failed to increment likes' });
  }
});

// Remove a specific comment by id (admin only)
app.post('/api/comments/remove/:useCaseId', requireAdmin, async (req, res) => {
  try {
    const allComments = await readJSON(COMMENTS_FILE) || {};
    const comments = allComments[req.params.useCaseId] || [];
    const index = comments.findIndex(c => c.id === req.body.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    comments.splice(index, 1);
    allComments[req.params.useCaseId] = comments;
    await writeJSON(COMMENTS_FILE, allComments);
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing comment:', error);
    res.status(500).json({ error: 'Failed to remove comment' });
  }
});

// Get comments for a use case
app.get('/api/comments/:useCaseId', async (req, res) => {
  try {
    const allComments = await readJSON(COMMENTS_FILE) || {};
    const comments = allComments[req.params.useCaseId] || [];
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add a comment to a use case
app.post('/api/comments/:useCaseId', async (req, res) => {
  try {
    const allComments = await readJSON(COMMENTS_FILE) || {};
    if (!allComments[req.params.useCaseId]) {
      allComments[req.params.useCaseId] = [];
    }
    
    const newComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: req.body.text,
      author: getEmailFromProxy(req) || 'Anonymous',
      timestamp: new Date().toISOString(),
    };
    
    allComments[req.params.useCaseId].push(newComment);
    await writeJSON(COMMENTS_FILE, allComments);
    
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Debug — dump all request headers to confirm what oauth2-proxy is injecting
app.get('/api/debug/headers', requireProxyIdentity, (req, res) => {
  res.json({ headers: req.headers, email: req.__email, displayName: req.__display_name });
});

// Who am I?
app.get('/api/me', requireProxyIdentity, (req, res) => {
  const DEV_MODE =
    process.env.NODE_ENV !== 'production' && process.env.DEV_BYPASS_SSO === 'true';

  if (DEV_MODE) {
    return res.json({
      user: { email: req.__email, displayName: req.__display_name, isAdmin: isAdmin(req.__email), devMode: true }
    });
  }

  res.json({
    user: {
      email: req.__email,
      displayName: req.__display_name,
      isAdmin: isAdmin(req.__email)
    }
  });
});

// Check if user is admin (kept for backwards compat)
app.get('/api/admin/check', requireProxyIdentity, (req, res) => {
  res.json({
    isAdmin: isAdmin(req.__email),
    email: req.__email || null,
    configuredAdmins: ADMIN_EMAILS.length,
    configuredGroups: ADMIN_BLUEGROUPS.length
  });
});

// Delete a use case (admin only)
app.delete('/api/use-cases/:useCaseId', requireAdmin, async (req, res) => {
  try {
    const useCases = await readJSON(USE_CASES_FILE) || [];
    const useCaseId = req.params.useCaseId;
    
    const index = useCases.findIndex(uc => uc.id === useCaseId);
    if (index === -1) {
      return res.status(404).json({ error: 'Use case not found' });
    }
    
    // Remove the use case
    const deleted = useCases.splice(index, 1)[0];
    await writeJSON(USE_CASES_FILE, useCases);
    
    // Clean up associated data
    const likes = await readJSON(LIKES_FILE) || {};
    delete likes[useCaseId];
    await writeJSON(LIKES_FILE, likes);
    
    const comments = await readJSON(COMMENTS_FILE) || {};
    delete comments[useCaseId];
    await writeJSON(COMMENTS_FILE, comments);
    
    res.json({
      success: true,
      message: 'Use case deleted successfully',
      deleted: deleted
    });
  } catch (error) {
    console.error('Error deleting use case:', error);
    res.status(500).json({ error: 'Failed to delete use case' });
  }
});

// Serve static files from dist directory (frontend)
// IMPORTANT: This must come AFTER API routes so API requests aren't treated as static files
app.use(express.static(path.join(__dirname, '../dist')));

// Serve index.html for all non-API routes (SPA fallback)
// This catches any route that didn't match API or static files
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Backend API server running on port ${PORT}`);
  console.log(`✓ Data directory: ${DATA_DIR}`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
});

// Made with Bob
