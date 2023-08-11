import { Collection, Model } from 'mongoose';
import { CategoryModel } from '../models/category.model';
import {
	CreateCategoryDto,
	ICategory,
	ICreateCategory,
} from 'shared/types/forum.types';

export default class CategoryRepo {
	private categoryModel: Model<ICategory>;

	constructor() {
		this.categoryModel = CategoryModel;
	}

	createCategory(categoryData: ICreateCategory): Promise<ICategory> {
		const category = new this.categoryModel(categoryData);
		return category.save();
	}

	getCategoryById(categoryId: string): Promise<ICategory | null> {
		return this.categoryModel.findById(categoryId).populate('tags');
	}

	getAllCategories(): Promise<ICategory[]> {
		return this.categoryModel.find();
	}

	updateCategory(
		categoryId: string,
		categoryData: Partial<ICategory>,
	): Promise<ICategory | null> {
		return this.categoryModel.findByIdAndUpdate(categoryId, categoryData, {
			new: true,
		});
	}

	async deleteCategory(categoryId: string): Promise<void> {
		await this.categoryModel.findByIdAndDelete(categoryId);
	}
}
