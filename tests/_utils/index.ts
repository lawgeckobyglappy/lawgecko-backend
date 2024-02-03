import mongoose from 'mongoose';
import { fileManager } from 'apitoolz';

import config from '../../src/config/env';
import { scheduler } from '../../src/config/scheduler';

export { cleanupDp, cleanupTemporaryFileUploadDirectory };

async function cleanupDp() {
  await Promise.all([
    await mongoose?.connection?.db?.dropDatabase(),
    await scheduler.stop(),
  ]);
}

function cleanupTemporaryFileUploadDirectory() {
  fileManager.deleteFolder(config.TEMPORARY_FILE_UPLOAD_PATH);
}
