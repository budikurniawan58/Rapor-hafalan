import { HafalanCategory, HafalanItem, PrintFilterMode, Student, UserAccount } from '../types';

/**
 * Normalizes class strings for matching (e.g., "Kelas 2.1" -> "2.1", "2.1" -> "2.1")
 */
export function normalizeClassName(className: string): string {
  return className
    .trim()
    .toLowerCase()
    .replace(/^kelas\s+/i, '')
    .trim();
}

/**
 * Checks whether a single target class string matches a student's class string.
 * Examples:
 * - Target "5" matches student "5", "5.1", "5.2", "Kelas 5"
 * - Target "5" does NOT match student "2.1", "2", "1.1"
 * - Target "2.1" matches student "2.1", "Kelas 2.1"
 * - Target "2.1" does NOT match student "5", "1.1", "2.2"
 * - Target "2" matches student "2", "2.1", "2.2", "Kelas 2"
 */
export function classMatches(targetClass: string, studentClass: string): boolean {
  const normTarget = normalizeClassName(targetClass);
  const normStudent = normalizeClassName(studentClass);

  if (!normTarget || !normStudent) return false;

  // 1. Exact match (e.g. "2.1" === "2.1", "5" === "5")
  if (normTarget === normStudent) return true;

  // 2. If target is a general grade level e.g. "5" or "2"
  const targetGradeMatch = normTarget.match(/^([1-6])(\.0)?$/);
  if (targetGradeMatch) {
    const gradeNum = targetGradeMatch[1];
    // Check if student starts with this grade followed by dot, hyphen, space, or letter
    const studentGradeMatch = normStudent.match(/^([1-6])([.\s\-_a-zA-Z]|$)/);
    if (studentGradeMatch && studentGradeMatch[1] === gradeNum) {
      return true;
    }
  }

  return false;
}

/**
 * Checks whether a hafalan item or category applies to a given student's class.
 */
export function isApplicableToClass(
  targetClasses: string[] | undefined,
  studentClass: string | undefined
): boolean {
  // If targetClasses is undefined or empty, it applies to all classes by default
  if (!targetClasses || targetClasses.length === 0) {
    return true;
  }

  // If it explicitly includes 'Semua Kelas' or '*'
  if (
    targetClasses.some(
      (c) =>
        c.toLowerCase() === 'semua kelas' ||
        c.toLowerCase() === 'semua' ||
        c === '*'
    )
  ) {
    return true;
  }

  if (!studentClass || !studentClass.trim()) {
    return true;
  }

  return targetClasses.some((tc) => classMatches(tc, studentClass));
}

/**
 * Filters hafalan categories and items for a specific student according to their class and print mode.
 */
export function filterCategoriesForStudent(
  categories: HafalanCategory[],
  student: Student,
  mode: PrintFilterMode = 'class'
): HafalanCategory[] {
  const records = student.records || {};

  return categories
    .map((category) => {
      // Check if category itself is restricted to other classes
      if (!isApplicableToClass(category.targetClasses, student.kelas)) {
        return null;
      }

      const filteredItems = category.items.filter((item) => {
        const record = records[item.id];

        // If explicitly excluded by teacher for this student's print card
        if (record?.excludeFromPrint) {
          return false;
        }

        // Filter based on class
        if (mode !== 'all') {
          if (!isApplicableToClass(item.targetClasses, student.kelas)) {
            return false;
          }
        }

        // Additional filter mode checks
        if (mode === 'passed_only') {
          return (record?.keterangan || '').toLowerCase() === 'lulus';
        }

        if (mode === 'filled_only') {
          return Boolean(
            (record?.tanggal && record.tanggal.trim()) ||
            (record?.penguji && record.penguji.trim()) ||
            (record?.keterangan && record.keterangan.trim())
          );
        }

        return true;
      });

      // If category has no items after filtering, don't show the category header
      if (filteredItems.length === 0) {
        return null;
      }

      return {
        ...category,
        items: filteredItems,
      };
    })
    .filter((cat): cat is HafalanCategory => cat !== null);
}

/**
 * Collects a clean list of all unique class names present in student data and category targets.
 */
export function getAvailableClasses(
  students: Student[],
  categories: HafalanCategory[]
): string[] {
  const set = new Set<string>();

  students.forEach((s) => {
    if (s.kelas && s.kelas.trim()) {
      set.add(s.kelas.trim());
    }
  });

  categories.forEach((cat) => {
    cat.targetClasses?.forEach((c) => {
      if (c && c !== 'Semua Kelas') set.add(c.trim());
    });
    cat.items.forEach((item) => {
      item.targetClasses?.forEach((c) => {
        if (c && c !== 'Semua Kelas') set.add(c.trim());
      });
    });
  });

  // Ensure default common class 2.1 is there if empty
  if (set.size === 0) {
    set.add('2.1');
  }

  return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

/**
 * Resolves the appropriate Wali Kelas name and NIP for a specific student's class.
 * Priority:
 * 1. Exact or matching key in config.waliKelasPerClass
 * 2. UserAccount where role === 'walikelas' matching student class
 * 3. Fallback to general examinerName & examinerNip
 */
export function findWaliKelasForStudent(
  studentClass: string | undefined,
  waliKelasMap?: Record<string, { name: string; nip?: string }>,
  users?: UserAccount[],
  fallbackName: string = 'Fikra Abdillah Zaenal, S.S., S.Pd.',
  fallbackNip: string = ''
): { name: string; nip?: string } {
  if (!studentClass || !studentClass.trim()) {
    return { name: fallbackName, nip: fallbackNip };
  }

  const clean = studentClass.trim();

  // 1. Direct key match in waliKelasMap
  if (waliKelasMap) {
    if (waliKelasMap[clean]?.name?.trim()) {
      return waliKelasMap[clean];
    }
    const norm = normalizeClassName(clean);
    if (waliKelasMap[norm]?.name?.trim()) {
      return waliKelasMap[norm];
    }
    // Check with classMatches
    for (const [key, val] of Object.entries(waliKelasMap)) {
      if (val?.name?.trim() && classMatches(key, clean)) {
        return val;
      }
    }
  }

  // 2. Check registered teacher accounts in users
  if (users && users.length > 0) {
    const matchedUser = users.find(
      (u) =>
        u.role === 'walikelas' &&
        u.assignedKelas &&
        (classMatches(u.assignedKelas, clean) ||
          u.assignedKelas.trim().toLowerCase() === clean.toLowerCase() ||
          normalizeClassName(u.assignedKelas) === normalizeClassName(clean))
    );
    if (matchedUser && matchedUser.name?.trim()) {
      return { name: matchedUser.name, nip: matchedUser.nip || '' };
    }
  }

  return { name: fallbackName, nip: fallbackNip };
}
