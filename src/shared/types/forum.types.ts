import { ISubCategory } from 'modules/forum/models/sub-category.model';
import { Document } from 'mongoose';

export interface ICategory extends Document {
	name: string;
	description: string;
	sub_categories: ISubCategory[];
}
