describe('formatTime utility', () => {
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  it('should format minutes correctly', () => {
    expect(formatTime(30)).toBe('30m');
    expect(formatTime(45)).toBe('45m');
    expect(formatTime(59)).toBe('59m');
  });

  it('should format hours and minutes correctly', () => {
    expect(formatTime(60)).toBe('1h 0m');
    expect(formatTime(90)).toBe('1h 30m');
    expect(formatTime(120)).toBe('2h 0m');
    expect(formatTime(150)).toBe('2h 30m');
  });

  it('should handle zero minutes', () => {
    expect(formatTime(0)).toBe('0m');
  });

  it('should handle large values', () => {
    expect(formatTime(720)).toBe('12h 0m');
    expect(formatTime(1440)).toBe('24h 0m');
  });
});
