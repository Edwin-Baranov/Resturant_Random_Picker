const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { deduplicate } = require('../server/api.js');

// ── deduplicate ─────────────────────────────────────────────────────

describe('deduplicate', () => {
  it('removes duplicate places by display name', () => {
    const places = [
      { id: '1', displayName: { text: 'Burger King' }, rating: 3.0 },
      { id: '2', displayName: { text: 'Taco Bell' }, rating: 3.8 },
      { id: '3', displayName: { text: 'Burger King' }, rating: 4.5 },
    ];

    const result = deduplicate(places);
    assert.equal(result.length, 2);

    const bk = result.find((p) => p.displayName.text === 'Burger King');
    assert.equal(bk.rating, 4.5); // last entry wins
  });

  it('handles empty array', () => {
    const result = deduplicate([]);
    assert.deepEqual(result, []);
  });

  it('keeps all places when names are unique', () => {
    const places = [
      { id: '1', displayName: { text: 'Place A' } },
      { id: '2', displayName: { text: 'Place B' } },
      { id: '3', displayName: { text: 'Place C' } },
    ];

    const result = deduplicate(places);
    assert.equal(result.length, 3);
  });

  it('falls back to id when displayName is missing', () => {
    const places = [{ id: 'abc123' }, { id: 'def456' }];

    const result = deduplicate(places);
    assert.equal(result.length, 2);
  });
});
