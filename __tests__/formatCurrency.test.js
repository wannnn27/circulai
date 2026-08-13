import { formatCurrency } from '../src/data/appData';

describe('formatCurrency', () => {
  it('formats numeric values into Indonesian Rupiah string', () => {
    expect(formatCurrency(189000)).toBe('Rp189.000');
    expect(formatCurrency(245000)).toBe('Rp245.000');
    expect(formatCurrency(1000000)).toBe('Rp1.000.000');
  });

  it('handles zero, null, and undefined gracefully', () => {
    expect(formatCurrency(0)).toBe('Rp0');
    expect(formatCurrency(null)).toBe('Rp0');
    expect(formatCurrency(undefined)).toBe('Rp0');
  });

  it('handles strings with non-numeric characters', () => {
    expect(formatCurrency('Rp189.000')).toBe('Rp189.000');
    expect(formatCurrency('189000')).toBe('Rp189.000');
  });
});
