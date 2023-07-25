import { ApiError } from 'apitoolz';

export { handleError, handleAuthError };

type ErrorType = {
	message: string;
	payload?: any;
	statusCode?: number;
};

function handleError({ message, payload = {} }: ErrorType) {
	return { error: new ApiError({ message, payload }).summary };
}

function handleAuthError(message: 'Access denied' | 'Authentication failed') {
	return {
		error: new ApiError({
			message,
			statusCode: message == 'Access denied' ? 403 : 401,
		}).summary,
	};
}
