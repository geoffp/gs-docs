import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  open: true,
  nodeResolve: true,
  http2: true,
  watch: true,
  rootDir: 'site',
  plugins: [esbuildPlugin({ ts: true })],
};
