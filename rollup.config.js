import pkg from './package.json'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import svgr from '@svgr/rollup'
import css from 'rollup-plugin-import-css'

export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
      strict: false
    }
  ],
  plugins: [
    resolve({
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
    }),
    commonjs({
      include: /node_modules/
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }),
    css(),
    svgr()
  ],
  external: ['react', 'react-dom', 'antd', '@ant-design/icons']
}