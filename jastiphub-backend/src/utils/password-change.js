import { login } from '../validation.js';

export function passwordChangeInput(body) {
  const { handle, password } = body ?? {};
  return login.parse({ handle, password });
}
