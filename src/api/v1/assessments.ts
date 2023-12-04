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

router.post('/assessment', multipartParser, controllers.createAssessment);
router.post('/publish/:id', controllers.publishAssessment);
router.post('/question/:id', multipartParser, controllers.createQuestion);
router.patch('/assessment/:id', multipartParser, controllers.editAssessment);
router.get('/assessment/:id', controllers.getAssessment);
