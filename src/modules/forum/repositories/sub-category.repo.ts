import { Model } from 'mongoose';
import SubCategoryModel, { ISubCategory } from '../models/sub-category.model';

export default class SubCategoryRepo {
	private subCategoryModel: Model<ISubCategory>;

	constructor() {
		this.subCategoryModel = SubCategoryModel;
	}

	createSubCategory(
		subCategoryData: Partial<ISubCategory>,
	): Promise<ISubCategory> {
		const subCategory = new this.subCategoryModel(subCategoryData);
		return subCategory.save();
	}

	getSubCategoryById(subCategoryId: string): Promise<ISubCategory | null> {
		return this.subCategoryModel.findById(subCategoryId);
	}

	getAllSubCategories(): Promise<ISubCategory[]> {
		return this.subCategoryModel.find().populate('category');
	}

	updateSubCategory(
		subCategoryId: string,
		subCategoryData: Partial<ISubCategory>,
	): Promise<ISubCategory | null> {
		return this.subCategoryModel.findByIdAndUpdate(
			subCategoryId,
			subCategoryData,
			{ new: true },
		);
	}

	async deleteSubCategory(subCategoryId: string): Promise<void> {
		await this.subCategoryModel.findByIdAndDelete(subCategoryId);
	}
}
