// models/constants/cookie.js

/**
 * Cookie Constants
 * Defines the available cookie constants and their corresponding names
 */
const COOKIE = Object.freeze({
  AUTH: 'token'
});

/**
 * Cookie Expiration Values
 * Expiration values for cookies in days
 */
const COOKIE_EXP = Object.freeze({
  [COOKIE.AUTH]: 7
});

/**
 * Cookie Path Values
 * The path for where cookies should be stored
 */
const COOKIE_PATH = Object.freeze({
  [COOKIE.AUTH]: '/'
});

export {
  COOKIE,
  COOKIE_EXP,
  COOKIE_PATH
};
