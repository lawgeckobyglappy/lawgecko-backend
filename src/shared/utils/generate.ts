import uniqid from 'uniqid';

export { generateId };

const generateId = (prefix?: string, suffix?: string) =>
  uniqid.process(prefix, suffix).toUpperCase();
