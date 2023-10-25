export { handleError, handleAuthError };

type ErrorType = {
  message: string;
  payload?: Record<string, any>;
  statusCode?: number;
};

function handleError({ message, payload = {}, statusCode = 400 }: ErrorType) {
  return { error: { message, payload, statusCode } };
}

function handleAuthError(message: 'Access denied' | 'Authentication failed') {
  return {
    error: {
      message,
      payload: {},
      statusCode: message == 'Access denied' ? 403 : 401,
    },
  };
}
