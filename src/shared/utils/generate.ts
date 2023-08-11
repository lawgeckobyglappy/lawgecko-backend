import uniqid from 'uniqid';
import randomize from 'randomatic';
import { Schema } from 'mongoose';

export { generateId, getRandom, generateObjectId };

const generateId = (prefix?: string, suffix?: string) =>
	uniqid.process(prefix, suffix).toUpperCase();

const generateObjectId = (prefix?: string, suffix?: string) =>
	new Schema.ObjectId(uniqid.process(prefix, suffix).toUpperCase());

const getRandom = (charType = '*', length = 10) => randomize(charType, length);
