/**
 * Página de uma loja do Food (/comida/<slug>). No celular ela abre como tela
 * empilhada do app: capa em tela cheia, sem cabeçalho amarelo nem pílula de serviços.
 */
export function isStoreRoute(pathname: string): boolean {
  return /^\/comida\/(?!checkout(?:\/|$))[^/]+\/?$/.test(pathname);
}
