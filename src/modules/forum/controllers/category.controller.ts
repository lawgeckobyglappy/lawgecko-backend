import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { CreateCategoryDto } from '../../../shared/types/forum.types';
import { validate } from 'class-validator';
import httpStatus from 'http-status';
import CategoryService from '../services/category.service';

export default class CategoryController {
	constructor(private categoryService: CategoryService) {}

	async createCategory(req: Request, res: Response) {
		const category = plainToClass(CreateCategoryDto, req.body);
		const errors = await validate(category);
		if (errors.length > 0) {
			return res
				.status(422)
				.json({ errors: errors.map((error) => error.constraints) });
		}
		const createdCategory = await this.categoryService.createCategory(category);
		res
			.status(httpStatus.CREATED)
			.json({ data: createdCategory, message: 'successful' });
	}

	async getCategoryById(req: Request, res: Response) {
		const categoryId = req.params.id;
		const category = await this.categoryService.getCategoryById(categoryId);
		if (category) {
			res.json(category);
		} else {
			res.status(404).json({ error: 'Category not found' });
		}
	}

	async getAllCategories(req: Request, res: Response) {
		const data = await this.categoryService.getAllCategories();
		res.status(200).json(data);
	}

	async removeCategory(req: Request, res: Response) {
		await this.categoryService.deleteCategory(req.params.id);
		res.status(200).json({ message: 'successful' });
	}

	// ... other controller methods

	// errorHandler = (
	// 	error: Error,
	// 	req: Request,
	// 	res: Response,
	// 	next: NextFunction,
	// ): void => {
	// 	res.status(500).json({ error: error.message });
	// };
}
