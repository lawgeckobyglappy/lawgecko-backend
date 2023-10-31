import mongoose from 'mongoose';
import { scheduler } from '../../src/config/scheduler';

export { cleanupDp };

async function cleanupDp() {
  await Promise.all([
    await mongoose?.connection?.db?.dropDatabase(),
    await scheduler.stop(),
  ]);
}
