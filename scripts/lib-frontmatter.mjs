/* ============================================================================
   lib-frontmatter.mjs — a tiny, dependency-free YAML front-matter reader for the
   library/ technique DB. NOT a general YAML parser — it handles exactly the
   shapes our CONTRACT.md schema uses: nested 2-space maps, "- " lists, inline
   flow [a, b] and {k: v}, quoted/bare scalars, booleans, numbers. No deps so it
   runs on bare `node` with nothing installed.
   ========================================================================== */
import { readFileSync } from 'node:fs';

export function extractFrontMatter(text) {
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end === -1) return null;
  const body = text.slice(text.indexOf('\n', 0) + 1, end);
  return body;
}

function parseScalar(s) {
  s = s.trim();
  if (s === '') return '';
  if (s === 'null' || s === '~') return null;
  if (s === 'true') return true;
  if (s === 'false') return false;
  // inline flow list  [a, b, {x:y}]
  if (s.startsWith('[') && s.endsWith(']')) return parseFlowList(s.slice(1, -1));
  // inline flow map   {a: b, c: d}
  if (s.startsWith('{') && s.endsWith('}')) return parseFlowMap(s.slice(1, -1));
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")))
    return s.slice(1, -1);
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return s;
}

function splitTopLevel(s) {
  // split on commas not inside [] {} "" ''
  const out = []; let depth = 0, q = null, cur = '';
  for (const ch of s) {
    if (q) { cur += ch; if (ch === q) q = null; continue; }
    if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
    if (ch === '[' || ch === '{') depth++;
    if (ch === ']' || ch === '}') depth--;
    if (ch === ',' && depth === 0) { out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim() !== '') out.push(cur);
  return out;
}

function parseFlowList(s) {
  if (s.trim() === '') return [];
  return splitTopLevel(s).map(parseScalar);
}

function parseFlowMap(s) {
  const o = {};
  for (const part of splitTopLevel(s)) {
    const i = part.indexOf(':');
    if (i === -1) continue;
    o[part.slice(0, i).trim()] = parseScalar(part.slice(i + 1));
  }
  return o;
}

/* Parse the front-matter body into a JS object. Indentation-based (2-space). */
export function parseYaml(body) {
  const lines = body.split('\n').filter(l => l.trim() !== '' && !l.trim().startsWith('#'));
  let idx = 0;

  function indentOf(l) { return l.match(/^ */)[0].length; }

  function parseBlock(minIndent) {
    // decide list vs map by first line
    const node = {};
    let list = null;
    while (idx < lines.length) {
      const line = lines[idx];
      const ind = indentOf(line);
      if (ind < minIndent) break;
      if (ind > minIndent) { idx++; continue; } // safety
      const trimmed = line.trim();

      if (trimmed.startsWith('- ')) {
        if (list === null) list = [];
        const rest = trimmed.slice(2);
        if (rest.includes(':') && !rest.startsWith('{') && !rest.startsWith('[') &&
            !/^["'].*:/.test(rest)) {
          // list item that is itself a map (rare here) — treat first k:v
          list.push(parseScalar(rest));
        } else {
          list.push(parseScalar(rest));
        }
        idx++;
        continue;
      }

      const ci = trimmed.indexOf(':');
      if (ci === -1) { idx++; continue; }
      const key = trimmed.slice(0, ci).trim();
      const after = trimmed.slice(ci + 1).trim();
      idx++;
      if (after === '') {
        // nested block — could be a map or a "- " list
        const childIndent = (idx < lines.length) ? indentOf(lines[idx]) : minIndent;
        if (childIndent > minIndent) {
          node[key] = parseBlock(childIndent);
        } else {
          node[key] = null;
        }
      } else {
        node[key] = parseScalar(after);
      }
    }
    return list !== null ? list : node;
  }

  return parseBlock(indentOf(lines[0] || ''));
}

export function readRecipe(path) {
  const text = readFileSync(path, 'utf8');
  const fm = extractFrontMatter(text);
  if (!fm) return null;
  try { return parseYaml(fm); }
  catch (e) { return { __parseError: String(e) }; }
}
