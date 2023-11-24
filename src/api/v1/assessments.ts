import { Router } from 'express';

import { controllers } from 'src/modules/assessments/controllers';
import { fileManager } from 'apitoolz';
import { config } from '@config';

export { router as assessmentsRouter };

const multipartParser = fileManager.parseMultipartData()({
  filesConfig: { photo: {} },
  uploadDir: config.TEMPORARY_FILE_UPLOAD_PATH,
  maxSize: Infinity,
});

const router = Router();

router.post('/assessment', multipartParser, controllers.createAssessment);
router.get('/assessment', controllers.getAssessment);
