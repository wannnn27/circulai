import { getStyleAnalysis } from '../src/data/appData';

describe('getStyleAnalysis', () => {
  it('returns correct data structure for complete quiz answers', () => {
    const answers = {
      skinTone: 'medium-olive',
      bodyShape: 'hourglass',
      height: '161 - 165 cm',
      styleVibe: ['minimalist'],
      occasion: ['office']
    };

    const result = getStyleAnalysis(answers);

    expect(result).toHaveProperty('archetype');
    expect(result).toHaveProperty('tagline');
    expect(result).toHaveProperty('analysis');
    expect(Array.isArray(result.palette)).toBe(true);
    expect(Array.isArray(result.cuttings)).toBe(true);
    expect(Array.isArray(result.avoidCuttings)).toBe(true);
    expect(Array.isArray(result.fabrics)).toBe(true);
    expect(Array.isArray(result.products)).toBe(true);
    expect(result.palette.length).toBeGreaterThan(0);
  });

  it('provides safe fallback data when answers are empty', () => {
    const result = getStyleAnalysis({});

    expect(result.archetype).toBeTruthy();
    expect(result.tagline).toBeTruthy();
    expect(result.palette).toBeDefined();
    expect(result.cuttings).toBeDefined();
  });
});
