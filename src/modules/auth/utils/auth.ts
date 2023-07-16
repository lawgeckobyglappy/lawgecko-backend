import jwt from 'jsonwebtoken';
import type { IncomingMessage } from 'http';

import config from 'config/env';
import { AuthPayload, AuthPayloadInput } from 'shared/types';

const { secret, accessExpirationMinutes } = config.jwt;

export { createToken, requireAuth };

function createToken({ userId, userRole, sessionId }: AuthPayloadInput) {
	return jwt.sign(
		{ user: { _id: userId, role: userRole }, sessionId } as AuthPayload,
		secret!,
		{ expiresIn: accessExpirationMinutes },
	);
}

function getPayload(token: string) {
	try {
		return jwt.verify(token, secret!) as AuthPayload;
	} catch (err: any) {
		return null;
	}
}

function requireAuth(req: IncomingMessage) {
	let payload: AuthPayload | null = null;

	const bearerToken = req.headers['authorization']?.split(' ');

	if (bearerToken?.[0] === 'Bearer') payload = getPayload(bearerToken[1]);

	return { isAuth: !!payload, payload };
}
