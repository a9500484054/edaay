export async function apiLogin({ email, password }) {
  await wait(500)
  // TODO: заменить на реальный fetch/axios
  return {
    user: { id: 'u1', name: email.split('@')[0], email, avatar: '' },
    accessToken: 'access-token-demo',
    refreshToken: 'refresh-token-demo',
    expiresIn: 3600,
  }
}

export async function apiRegister({ email, password }) {
  await wait(600)
  return {
    user: { id: 'u1', name: email.split('@')[0], email, avatar: '' },
    accessToken: 'access-token-demo',
    refreshToken: 'refresh-token-demo',
    expiresIn: 3600,
  }
}

export async function apiMagicLink({ email }) {
  await wait(400)
  return { ok: true }
}

export async function apiOAuth(provider) {
  await wait(500)
  return {
    user: { id: 'u1', name: provider + ' user', email: provider + '@example.com', avatar: '' },
    accessToken: 'access-token-demo',
    refreshToken: 'refresh-token-demo',
    expiresIn: 3600,
  }
}

export async function apiRefresh(refreshToken) {
  await wait(300)
  return { accessToken: 'access-token-demo-refreshed', expiresIn: 3600 }
}

export async function apiLogout() {
  await wait(200)
  return { ok: true }
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)) }
