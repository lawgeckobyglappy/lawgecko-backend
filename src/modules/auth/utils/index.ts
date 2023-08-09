import { getSlug } from '@utils';
import { userRepository } from '../repositories';

export * from './auth';
export * from './errors';

export { generateUsername };

async function generateUsername(name: string) {
	let username = getSlug(name);

	const isTaken = await userRepository.findOne({ username });

	return isTaken ? `${username}-${Date.now()}` : username;
}
