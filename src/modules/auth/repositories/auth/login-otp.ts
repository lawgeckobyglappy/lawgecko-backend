import { Schema, model } from 'mongoose';
import { LoginOTP } from 'shared/types';

export { loginOTPRepository };

const schema = new Schema(
	{
		_id: { type: String, required: true },
		code: { type: String, required: true, index: true },
		expiresAt: { type: Date, expires: 0 },
		userId: { type: String, required: true, index: true },
	},
	{ timestamps: { updatedAt: false } },
);

const dbModel = model('login-otps', schema);

const loginOTPRepository = {
	findByCode: (code: string) => dbModel.findOne<LoginOTP>({ code }),
	insertOne: (otp: LoginOTP) => dbModel.create(otp),
	deleteByCode: (code: string) => dbModel.deleteOne({ code }),
	deleteByUserId: (userId: string) => dbModel.deleteMany({ userId }),
};
