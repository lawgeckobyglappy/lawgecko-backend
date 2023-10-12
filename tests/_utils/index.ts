import mongoose from 'mongoose';

export { cleanupDp };

async function cleanupDp() {
  mongoose?.connection?.db?.dropDatabase();
}
