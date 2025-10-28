import { normalizeGradeValue, normalizeChildEntries } from '../src/services/profileUtils';

describe('normalizeGradeValue', () => {
  it('keeps preschool grade strings intact', () => {
    expect(normalizeGradeValue('Preschool')).toBe('Preschool');
    expect(normalizeGradeValue('preschool')).toBe('Preschool');
    expect(normalizeGradeValue(' Pre-K ')).toBe('Preschool');
  });

  it('handles grade shorthand with suffixes', () => {
    expect(normalizeGradeValue('2b')).toBe('2b');
    expect(normalizeGradeValue('Grade 2B')).toBe('2b');
  });

  it('parses numeric grades', () => {
    expect(normalizeGradeValue('2')).toBe(2);
    expect(normalizeGradeValue('Grade 3')).toBe(3);
  });

  it('returns trimmed string for unknown grades', () => {
    expect(normalizeGradeValue('Learner')).toBe('Learner');
  });

  it('normalizes child entries without duplication or linked flag', () => {
    const rawChildren = [
      {
        _id: 'child-1',
        firstName: 'Elisa',
        lastName: 'Blasetti',
        grade: '2b',
        totalPoints: 0,
        class: [{ id: 'class-1' }],
      },
      {
        _id: 'child-1',
        firstName: 'Elisa',
        lastName: 'Blasetti',
        grade: '2b',
        totalPoints: 0,
        class: [{ id: 'class-1' }],
      },
      {
        _id: 'child-2',
        firstName: 'Emilia',
        lastName: 'Blasetti',
        grade: 'Preschool',
        totalPoints: 0,
      },
    ];

    const normalized = normalizeChildEntries(rawChildren, { authType: 'ls-login' });

    expect(normalized).toHaveLength(2);
    normalized.forEach(child => {
      expect(child.accountType).toBe('child');
      expect(child.linkedAccount).toBe(false);
      expect(child.numberOfChildren).toBe(0);
    });
  });
});
