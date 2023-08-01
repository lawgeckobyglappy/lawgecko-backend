import mongoose, { Schema, Document, Types } from 'mongoose';
import { ISubCategory } from './sub-category.model';
import { ICategory } from 'shared/types/forum';

const categorySchema = new Schema<ICategory>({
	name: { type: String, required: true },
	description: { type: String, required: true },
	sub_categories: [{ type: Schema.Types.ObjectId, ref: 'SubCategory' }],
});

const CategoryModel = mongoose.model<ICategory>('Category', categorySchema);

export { CategoryModel };
