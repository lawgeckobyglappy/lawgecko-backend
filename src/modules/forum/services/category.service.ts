import {
	CreateCategoryDto,
	ICategory,
	ICreateCategory,
} from 'shared/types/forum.types';
import CategoryRepo from '../repositories/category.repo';
import TagRepo from '../repositories/tag.repo';

export default class CategoryService {
	constructor(
		private categoryRepo: CategoryRepo,
		private tagsRepo: TagRepo,
	) {}

	async createCategory(categoryData: CreateCategoryDto): Promise<ICategory> {
		const newCategory: ICreateCategory = {
			name: categoryData.name,
			description: categoryData.description,
		};
		newCategory.tags = await this.tagsRepo.bulkInsert(categoryData.tags);
		return await this.categoryRepo.createCategory(newCategory);
	}

	async getCategoryById(categoryId: string): Promise<ICategory | null> {
		const category = await this.categoryRepo.getCategoryById(categoryId);
		return category;
	}

	getAllCategories(): Promise<ICategory[]> {
		return this.categoryRepo.getAllCategories();
	}

	async updateCategory(
		categoryId: string,
		categoryData: Partial<ICategory>,
	): Promise<ICategory | null> {
		const updatedCategory = await this.categoryRepo.updateCategory(
			categoryId,
			categoryData,
		);
		return updatedCategory;
	}

	async deleteCategory(categoryId: string): Promise<void> {
		await this.categoryRepo.deleteCategory(categoryId);
	}
}
