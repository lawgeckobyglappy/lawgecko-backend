import slug from 'slug';

export * from './errors';
export * from './emails';
export * from './generate';

export { getSlug };

const getSlug = (word: string) => slug(word, '-');
