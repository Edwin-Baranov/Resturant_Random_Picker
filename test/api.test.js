const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { filterAndDeduplicate, getStaticMapURL } = require('../server/api.js');

// ── filterAndDeduplicate ────────────────────────────────────────────

describe('filterAndDeduplicate', () => {
  it('filters out non-operational businesses', () => {
    const newResults = [
      { name: 'Open Place', business_status: 'OPERATIONAL' },
      { name: 'Closed Place', business_status: 'CLOSED_PERMANENTLY' },
      { name: 'Temp Closed', business_status: 'CLOSED_TEMPORARILY' },
    ];

    const result = filterAndDeduplicate(newResults, []);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'Open Place');
  });

  it('deduplicates by name, keeping the latest entry', () => {
    const existing = [{ name: 'Burger King', rating: 3.0, business_status: 'OPERATIONAL' }];
    const newResults = [
      { name: 'Burger King', rating: 4.5, business_status: 'OPERATIONAL' },
      { name: 'Taco Bell', rating: 3.8, business_status: 'OPERATIONAL' },
    ];

    const result = filterAndDeduplicate(newResults, existing);
    assert.equal(result.length, 2);

    const bk = result.find((p) => p.name === 'Burger King');
    assert.equal(bk.rating, 4.5); // newer entry wins
  });

  it('returns empty array when all are non-operational', () => {
    const newResults = [{ name: 'Gone', business_status: 'CLOSED_PERMANENTLY' }];
    const result = filterAndDeduplicate(newResults, []);
    assert.equal(result.length, 0);
  });

  it('handles empty inputs', () => {
    const result = filterAndDeduplicate([], []);
    assert.deepEqual(result, []);
  });

  it('preserves existing results when new results are empty', () => {
    const existing = [{ name: 'Pizza Hut', business_status: 'OPERATIONAL' }];
    const result = filterAndDeduplicate([], existing);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'Pizza Hut');
  });
});

// ── getStaticMapURL ─────────────────────────────────────────────────

describe('getStaticMapURL', () => {
  beforeEach(() => {
    process.env.GOOGLE_API_KEY = 'test-key-123';
  });

  afterEach(() => {
    delete process.env.GOOGLE_API_KEY;
  });

  it('returns a valid Google Static Maps URL', () => {
    const url = getStaticMapURL(40.7128, -74.006);
    assert.ok(url.includes('center=40.7128,-74.006'));
    assert.ok(url.includes('markers=color:red%7C40.7128,-74.006'));
    assert.ok(url.includes('key=test-key-123'));
    assert.ok(url.startsWith('https://maps.googleapis.com/maps/api/staticmap'));
  });

  it('throws when GOOGLE_API_KEY is not set', () => {
    delete process.env.GOOGLE_API_KEY;
    assert.throws(() => getStaticMapURL(0, 0), {
      message: 'GOOGLE_API_KEY is not set in environment variables',
    });
  });
});
