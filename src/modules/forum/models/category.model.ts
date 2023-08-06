import mongoose, { Schema, Document, Types } from 'mongoose';
import { ICategory } from '../../../shared/types/forum.types';
import { tagSchema } from './tag.model';

export const categorySchema = new Schema<ICategory>({
	name: { type: String, required: true },
	description: { type: String, required: true },
	tags: [tagSchema],
});

const CategoryModel = mongoose.model<ICategory>('category', categorySchema);

export { CategoryModel };
