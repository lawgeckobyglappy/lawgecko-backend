import { CreateCategoryDto, ICategory } from 'shared/types/forum.types';
import CategoryRepo from '../repositories/category.repo';

export default class CategoryService {
	constructor(private categoryRepo: CategoryRepo) {}

	// Category CRUD operations
	async createCategory(categoryData: CreateCategoryDto): Promise<ICategory> {
		const createdCategory = await this.categoryRepo.createCategory(
			categoryData,
		);
		return createdCategory;
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
