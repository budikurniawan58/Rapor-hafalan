import { HafalanCategory, HafalanItem, PrintFilterMode, Student } from '../types';

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

  const normalizedStudent = normalizeClassName(studentClass);

  return targetClasses.some((tc) => {
    const normalizedTarget = normalizeClassName(tc);
    return (
      normalizedTarget === normalizedStudent ||
      normalizedTarget === tc.toLowerCase().trim() ||
      tc.toLowerCase().trim() === studentClass.toLowerCase().trim()
    );
  });
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
