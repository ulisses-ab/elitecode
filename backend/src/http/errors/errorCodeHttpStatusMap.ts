import { ErrorCode } from '../../application/errors/ErrorCode';

export const errorCodeHttpStatusMap: Record<ErrorCode, number> = {
  [ErrorCode.USER_NOT_FOUND]: 404,
  [ErrorCode.INVALID_PASSWORD]: 401,
  [ErrorCode.HANDLE_ALREADY_IN_USE]: 409,
  [ErrorCode.EMAIL_ALREADY_IN_USE]: 409,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.PROBLEM_NOT_FOUND]: 404,
  [ErrorCode.SETUP_NOT_FOUND]: 404,
  [ErrorCode.SUBMISSION_NOT_FOUND]: 404,
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCode.TESTS_NOT_FOUND]: 404,
  [ErrorCode.INVALID_TESTS_FILE]: 400,
  [ErrorCode.SETUP_INCOMPLETE]: 400,
  [ErrorCode.INVALID_SUBMISSION_STATE]: 400,
  [ErrorCode.RUNNER_NOT_FOUND]: 404,
  [ErrorCode.NOT_IMPLEMENTED]: 501,
  [ErrorCode.RESOURCE_NOT_FOUND]: 404,
};