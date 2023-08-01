import { Request, Response, NextFunction } from 'express';
import ForumService from '../services/forum.service';
import { wrapAsync } from 'shared/utils/helpers';

class ForumController {
	private forumService: ForumService;

	constructor(forumService: ForumService) {
		this.forumService = forumService;
	}

	createCategory = wrapAsync(
		async (req: Request, res: Response): Promise<void> => {
			const categoryData = req.body;
			const createdCategory = await this.forumService.createCategory(
				categoryData,
			);
			res.status(201).json(createdCategory);
		},
	);

	getCategoryById = wrapAsync(
		async (req: Request, res: Response): Promise<void> => {
			const categoryId = req.params.id;
			const category = await this.forumService.getCategoryById(categoryId);
			if (category) {
				res.json(category);
			} else {
				res.status(404).json({ error: 'Category not found' });
			}
		},
	);

	// ... other controller methods

	errorHandler = (
		error: Error,
		req: Request,
		res: Response,
		next: NextFunction,
	): void => {
		res.status(500).json({ error: error.message });
	};
}

export default ForumController;
