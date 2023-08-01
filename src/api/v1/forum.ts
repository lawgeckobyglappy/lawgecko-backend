import express from 'express';
import { ExampleController } from '../../modules/example-feature/controllers/example.controller';
import SubCategoryRepo from 'modules/forum/repositories/sub-category.repo';
import ForumService from 'modules/forum/services/forum.service';
import CategoryRepo from 'modules/forum/repositories/category.repo';
import ForumController from 'modules/forum/controllers/forum.controller';

const router = express.Router();

const subCategoryRepo: SubCategoryRepo = new SubCategoryRepo();
const categoryRepo: CategoryRepo = new CategoryRepo();
const forumService: ForumService = new ForumService(
	categoryRepo,
	subCategoryRepo,
);
const forumController: ForumController = new ForumController(forumService);

// router.get('/forum', forumController.createCategory);
// router.post('/forum', forumController.getCategoryById);

export { router as forumRouter };
