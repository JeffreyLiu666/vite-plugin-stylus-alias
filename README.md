# vite-plugin-stylus-alias

一个vite插件，通过读取vite里的别名配置对stylus里的引入进行一个路径转换。注意：`1.0.0`不支持正则转换，从`1.1.0`开始支持。


## install
```
npm i vite-plugin-stylus-alias -D
```

## Usage
``` js
import { defineConfig } from 'vite'
import vitePluginStylusAlias from 'vite-plugin-stylus-alias'
import path from 'path'

export default defineConfig({
  plugins: [vitePluginStylusAlias()],
  resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
  }
})
```