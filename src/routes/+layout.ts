import type { LayoutLoad } from './$types';
export const load: LayoutLoad = ({ url }) => ({ path: url.pathname });
