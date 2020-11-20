const { authenticate } = require('@feathersjs/authentication').hooks;
const verifyIdentity = authenticate('jwt');

function hasToken(hook) {
  if (!hook.params.headers || !hook.params.headers.authorization || !hook.data.accessToken) return false;
  return hook.params.headers.authorization || hook.data.accessToken;
}

module.exports = async function authenticate(hook) {
  try {
    return await verifyIdentity(hook);
  } catch (error) {
    if (error.name === 'NotAuthenticated' && !hasToken(hook)) {
      return hook;
    }

    throw error;
  }
};
