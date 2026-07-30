/**
 * Wraps expo-secure-store with a typed interface.
 * All auth token operations go through here — nothing else should
 * read/write the token key directly.
 */
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'minishop_auth_token';

export const tokenStorage = {
  save: (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token),
  load: ()             => SecureStore.getItemAsync(TOKEN_KEY),
  clear: ()            => SecureStore.deleteItemAsync(TOKEN_KEY),
};
