// models/TagModel.ts
import { model, Schema, Document } from 'mongoose';
import { ITag } from '../../../shared/types/forum.types';

export const tagSchema = new Schema<ITag>({
	name: { type: String, required: true, unique: true },
});

export const Tag = model<ITag>('tag', tagSchema);
