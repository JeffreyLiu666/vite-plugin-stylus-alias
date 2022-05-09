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
    if (query.vue !== undefined) query.vue = true
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
        const pathReg = new RegExp(`['"](~?[^'"]*)['"]`)
        const aliasPaths = pathReg.exec(oldImport)
        if (!aliasPaths) return oldImport
        // 遍历别名配置进行转换
        for (const { find, replacement } of aliasConfig) {
            let aliasPath = aliasPaths[1]
            // 处理路径时需要不带(~)符号
            if (aliasPath.startsWith('~')) aliasPath = aliasPath.slice(1)
            const hasAlias = typeof find === 'string' ? new RegExp(`^~?${ find }`).test(aliasPath) : find.test(aliasPath)
            if (!hasAlias) continue
            const absolutePath = aliasPath.replace(find, replacement)
            // relative处理文件的路径需要向上一层
            const curFilePath = path.resolve(filename, '../')
            // 解析引入文件相对当前样式文件的路径
            let newImportPath = path.relative(curFilePath, absolutePath)
            if (newImportPath[0] !== '.') newImportPath = './' + newImportPath
            const newImport = oldImport.replace(aliasPaths[1], newImportPath)
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
            return { 
                code: transform(code, id, aliasConfig),
                map: null
            }
        }
    }
}
