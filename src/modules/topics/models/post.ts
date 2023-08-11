import Schema from 'clean-schema';

import { generateObjectId } from '../../../shared/utils';
import { PostInput, Post } from '../../../shared/types';
import { validateString } from 'modules/auth/validators';

/*import {
	validateString,
	validateUserAccountStatus,
	validateUserEmail,
	validateUserRole,
	validateUsername,
} from '../validators';*/

export { postModel };

const postModel = new Schema<PostInput, Post>({
	_id:{
		constant:true, value: () => generateObjectId(),
	},
	categoryId:{
		required:true,
		validator:validateString(),
	},
	content:{},

}).getModel();

