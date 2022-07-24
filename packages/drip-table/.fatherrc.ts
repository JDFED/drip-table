import eslint from '@rollup/plugin-eslint';
import { IBundleOptions } from 'father-build-universal/src/types.d';
import sha1 from 'sha1';

const options: IBundleOptions = {
  cjs: { type: 'rollup' },
  esm: {
    type: 'rollup',
    importLibToEs: true,
  },
  cssModules: {
    generateScopedName: (name: string, file: string, content: string) => {
      if (name.startsWith('jfe-drip-table')) {
        return name;
      }
      return `jfe-drip-table-${sha1(file).slice(0, 4)}-${name}`;
    },
  },
  extractCSS: true,
  extraBabelPlugins: [],
  hookRollupConfig: (rollupConfigs, environment) => rollupConfigs.map(rollupConfig => ({
    ...rollupConfig,
    plugins: [
      eslint({
        include: [/\.js$/ui, /\.jsx$/ui, /\.ts$/ui, /\.tsx$/ui, /\.tx$/ui],
        exclude: [/\/node_modules\//ui, /\/dist\//ui],
        throwOnError: true,
        throwOnWarning: true,
      }),
      ...rollupConfig.plugins || [],
    ],
  })),
  pkgs: [
    'drip-table',
  ],
};

export default options;
