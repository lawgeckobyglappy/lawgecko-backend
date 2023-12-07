import { Router } from 'express';

import { controllers } from 'src/modules/assessments/controllers';
import { fileManager } from 'apitoolz';
import { config } from '@config';

export { router as assessmentsRouter };

const multipartParser = fileManager.parseMultipartData()({
  filesConfig: { image: {} },
  uploadDir: config.TEMPORARY_FILE_UPLOAD_PATH,
  maxSize: Infinity,
});

const router = Router();

router.get('/', controllers.getAllAssessments);
router.get('/assessment/:id', controllers.getAssessment);
router.get('/published', controllers.getPublishedAssessments);
router.post('/assessment', multipartParser, controllers.createAssessment);
router.post('/question/:id', controllers.createQuestion);
router.post('/publish/:id', controllers.publishAssessment);
router.patch('/assessment/:id', multipartParser, controllers.editAssessment);
