import mongoose, { Schema, Document } from 'mongoose';
import { ICategory } from 'shared/types/forum.types';

export interface ISubCategory extends Document {
	name: string;
	description: string;
	category: ICategory;
}

const subCategorySchema = new Schema<ISubCategory>({
	name: { type: String, required: true },
	description: { type: String, required: true },
	category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
});

const SubCategoryModel = mongoose.model<ISubCategory>(
	'SubCategory',
	subCategorySchema,
);

export default SubCategoryModel;
