import { generateId, getSlug } from '@utils';
import { userRepository } from '../repositories';

export * from './auth';

export { generateUserId, generateUsername };

function generateUserId() {
  return generateId();
}

async function generateUsername(name: string) {
  const username = getSlug(name);

  const isTaken = await userRepository.findOne({ username });

  return isTaken ? `${username}-${Date.now()}` : username;
}
