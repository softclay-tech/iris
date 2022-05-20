import { OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, CONFLICT } from 'http-status'

export const errorCodes = {
  RUNTIME_ERROR: {
    code: 400,
    status: BAD_REQUEST
  },
  RESOURCE_NOT_FOUND: {
    code: 404,
    status: NOT_FOUND
  },
  INVALID_REQUEST: {
    code: 'Invalid_Request',
    status: BAD_REQUEST
  },
  RESOURCE_CONFLICT: {
    code: 409,
    status: CONFLICT
  },
  RESOURCE_FORBIDDEN: {
    code: 'access_forbidden',
    status: FORBIDDEN
  },
  UNAUTHORIZED_REQUEST: {
    code: 'unauthorized',
    status: UNAUTHORIZED
  },
  INVALID_OTP: {
    code: 'Invalid OTP',
    status: UNAUTHORIZED
  }
}
