describe('calculateProgress utility', () => {
  const calculateProgress = (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  it('should calculate progress correctly', () => {
    expect(calculateProgress(5, 10)).toBe(50);
    expect(calculateProgress(3, 10)).toBe(30);
    expect(calculateProgress(7, 10)).toBe(70);
  });

  it('should return 100 when all completed', () => {
    expect(calculateProgress(10, 10)).toBe(100);
    expect(calculateProgress(5, 5)).toBe(100);
  });

  it('should return 0 when none completed', () => {
    expect(calculateProgress(0, 10)).toBe(0);
    expect(calculateProgress(0, 5)).toBe(0);
  });

  it('should handle zero total', () => {
    expect(calculateProgress(0, 0)).toBe(0);
    expect(calculateProgress(5, 0)).toBe(0);
  });

  it('should round to nearest integer', () => {
    expect(calculateProgress(1, 3)).toBe(33);
    expect(calculateProgress(2, 3)).toBe(67);
    expect(calculateProgress(1, 7)).toBe(14);
  });
});
