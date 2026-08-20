import { percentOf } from './report-math';

describe('report-math', () => {
  it('calcula percentual com total zero', () => {
    expect(percentOf(5, 0)).toBe(0);
    expect(percentOf(1, 4)).toBe(25);
    expect(percentOf(3, 8)).toBe(38);
  });
});
