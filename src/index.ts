import qs from 'querystring'
import path from 'path'
import { Alias, Plugin } from 'vite'

export interface VueQuery {
    vue?: boolean
    src?: boolean
    type?: 'script' | 'template' | 'style' | 'custom'
    index?: number
    lang?: string
    'lang.stylus'?: string
  }

function parseVueRequest(id: string) {
    const [filename, rawQuery] = id.split('?', 2)
    const query = qs.parse(rawQuery) as VueQuery
    if (query.vue !== null) query.vue = true
    return {
        filename,
        query
    }
}

export function transform(code: string, id: string, aliasConfig: Alias[] = []): string {
    const { query, filename } = parseVueRequest(id)
    const extname = path.extname(filename)
    if (
        (query.vue && query['lang.stylus'] !== '') ||
        (!query.vue && (extname !== '.styl' && extname !== 'stylus'))
    ) return code

    // 获取所有import字符串
    const importReg = /@import ['"][^'"]*['"]/g
    const oldImports = code.match(importReg)
    if (!oldImports) return code

    const newImports = oldImports.map(oldImport => {
        for (const alias of aliasConfig) {
            const { find, replacement } = alias

            // TODO: 适配正则类型
            if (find instanceof RegExp) continue

            const aliasReg = new RegExp(`['"](~?${ find }/[^'"]*)['"]`)
            const aliasPaths = aliasReg.exec(oldImport)
            if (!aliasPaths) continue
            // 获取设置了别名的import字符串
            const aliasPath = aliasPaths[1]
            if (!aliasPath) continue

            let len: number = find.length
            // 可不设置[~]
            if (aliasPath[0] === '~') len++
            const absolutePath = replacement + aliasPath.slice(len)
            // relative处理文件的路径需要向上一层
            const curFilePath = path.resolve(filename, '../')
            // 解析引入文件相对当前样式文件的路径
            let newImportPath = path.relative(curFilePath, absolutePath)
            if (newImportPath[0] !== '.') newImportPath = './' + newImportPath
            const newImport = oldImport.replace(aliasPath, newImportPath)
            return newImport
        }
        return oldImport
    })

    oldImports.forEach((oldImport, index) => {
        const newImport = newImports[index]
        if (oldImport === newImport) return
        code = code.replace(oldImport, newImport)
    })

    return code
}

export default function stylusAlias(): Plugin {
    let aliasConfig: Alias[] = []

    return {
        name: 'vite-plugin-stylus-alias',
        enforce: 'pre',
        configResolved(viteConfig) {
            aliasConfig = viteConfig.resolve.alias || []
        },
        transform(code: string, id: string) {
            return { code: transform(code, id, aliasConfig) }
        }
    }
}