import express from 'express';
import ForumService from '../../modules/forum/services/category.service';
import CategoryRepo from '../../modules/forum/repositories/category.repo';
import ForumController from '../../modules/forum/controllers/category.controller';
import TagRepo from '../../modules/forum/repositories/tag.repo';

const router = express.Router();

const categoryRepo = new CategoryRepo();
const tagRepo = new TagRepo();
const categoryService: ForumService = new ForumService(categoryRepo, tagRepo);
const categoryController: ForumController = new ForumController(
	categoryService,
);

router
	.route('/category')
	.get(categoryController.getAllCategories.bind(categoryController))
	.post(categoryController.createCategory.bind(categoryController));

router
	.route('/category/:id')
	.get(categoryController.getCategoryById.bind(categoryController))
	.delete(categoryController.removeCategory.bind(categoryController));

export default router;
