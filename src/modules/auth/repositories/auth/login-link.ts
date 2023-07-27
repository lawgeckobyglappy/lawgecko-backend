import { Schema, model } from 'mongoose';

import { LoginLink } from '../../../../shared/types';

export { loginLinkRepository };

const schema = new Schema<LoginLink>(
	{
		_id: { type: String, required: true },
		expiresAt: { type: Date, expires: 0 },
		userId: { type: String, required: true, index: true },
	},
	{ timestamps: { updatedAt: false } },
);

const dbModel = model('login-links', schema);

const loginLinkRepository = {
	findById: (id: string) => dbModel.findById(id),
	insertOne: (link: LoginLink) => dbModel.create(link),
	deleteById: (_id: string) => dbModel.deleteOne({ _id }),
	deleteByUserId: (userId: string) => dbModel.deleteMany({ userId }),
};
