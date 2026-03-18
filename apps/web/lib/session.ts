export function getWorkspaceId() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('aibuilder_workspace_id') ?? '';
}

export function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('aibuilder_token') ?? '';
}
