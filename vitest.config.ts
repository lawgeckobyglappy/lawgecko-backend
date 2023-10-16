import path from 'path';
import { defineConfig } from 'vitest/config';

import tsConfig from './tsconfig.json';

export default defineConfig({
  resolve: {
    alias: Object.entries(tsConfig.compilerOptions.paths).reduce(
      (aliases, [alias, path_]) => {
        return {
          ...aliases,
          [alias]: path.resolve(`./${resolvePath(path_[0])}`),
        };
      },
      {},
    ),
  },
});

function resolvePath(str: string) {
  return str.replace('/*', '/');
}
