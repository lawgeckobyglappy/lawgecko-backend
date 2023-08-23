import Schema from 'clean-schema';

import { generateId } from '@utils';
import { PostInput, Post } from '@types';
import { validateString } from '@/modules/auth/validators';

/*import {
	validateString,
	validateUserAccountStatus,
	validateUserEmail,
	validateUserRole,
	validateUsername,
} from '../validators';*/

export { postModel };

const postModel = new Schema<Post, PostInput>({
	_id: {
		constant: true,
		value: () => generateId(),
	},
	categoryId: {
		required: true,
		validator: validateString(),
	},
	content: {
		default: '',
	},
}).getModel();
