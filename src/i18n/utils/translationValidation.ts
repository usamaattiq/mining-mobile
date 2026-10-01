const KEY_SEGMENT_PATTERN = /^[a-z][a-zA-Z0-9]*$/;

export type TranslationTree = {
  [key: string]: string | TranslationTree;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isTranslationTree = (value: unknown): value is TranslationTree => {
  if (!isPlainObject(value)) {
    return false;
  }

  return Object.values(value).every((entry) =>
    typeof entry === 'string' ? true : isTranslationTree(entry),
  );
};

export const collectInvalidTranslationKeys = (tree: TranslationTree, parentKey = ''): string[] => {
  const invalidKeys: string[] = [];

  Object.entries(tree).forEach(([key, value]) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    if (!KEY_SEGMENT_PATTERN.test(key)) {
      invalidKeys.push(fullKey);
    }

    if (typeof value !== 'string') {
      invalidKeys.push(...collectInvalidTranslationKeys(value, fullKey));
    }
  });

  return invalidKeys;
};

export const assertValidTranslationTree = (tree: TranslationTree): void => {
  const invalidKeys = collectInvalidTranslationKeys(tree);

  if (invalidKeys.length > 0) {
    throw new Error(`Invalid translation keys: ${invalidKeys.join(', ')}`);
  }
};
