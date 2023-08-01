import { ICategory } from '../models/category.model';
import { ISubCategory } from '../models/sub-category.model';
import CategoryRepo from '../repositories/category.repo';
import SubCategoryRepo from '../repositories/sub-category.repo';

class ForumService {
	private categoryRepo: CategoryRepo;
	private subCategoryRepo: SubCategoryRepo;

	constructor(categoryRepo: CategoryRepo, subCategoryRepo: SubCategoryRepo) {
		this.categoryRepo = categoryRepo;
		this.subCategoryRepo = subCategoryRepo;
	}

	// Category CRUD operations

	async createCategory(categoryData: Partial<ICategory>): Promise<ICategory> {
		const createdCategory = await this.categoryRepo.createCategory(
			categoryData,
		);
		return createdCategory;
	}

	async getCategoryById(categoryId: string): Promise<ICategory | null> {
		const category = await this.categoryRepo.getCategoryById(categoryId);
		return category;
	}

	async getAllCategories(): Promise<ICategory[]> {
		const categories = await this.categoryRepo.getAllCategories();
		return categories;
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

	// SubCategory CRUD operations

	async createSubCategory(
		subCategoryData: Partial<ISubCategory>,
	): Promise<ISubCategory> {
		const createdSubCategory = await this.subCategoryRepo.createSubCategory(
			subCategoryData,
		);
		return createdSubCategory;
	}

	async getSubCategoryById(
		subCategoryId: string,
	): Promise<ISubCategory | null> {
		const subCategory = await this.subCategoryRepo.getSubCategoryById(
			subCategoryId,
		);
		return subCategory;
	}

	async getAllSubCategories(): Promise<ISubCategory[]> {
		const subCategories = await this.subCategoryRepo.getAllSubCategories();
		return subCategories;
	}

	async updateSubCategory(
		subCategoryId: string,
		subCategoryData: Partial<ISubCategory>,
	): Promise<ISubCategory | null> {
		const updatedSubCategory = await this.subCategoryRepo.updateSubCategory(
			subCategoryId,
			subCategoryData,
		);
		return updatedSubCategory;
	}

	async deleteSubCategory(subCategoryId: string): Promise<void> {
		await this.subCategoryRepo.deleteSubCategory(subCategoryId);
	}
}

export default ForumService;
