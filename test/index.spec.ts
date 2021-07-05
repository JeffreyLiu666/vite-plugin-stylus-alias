import path from 'path'
import { Alias } from 'vite'
import { transform } from '../src/index'

const imports = `
@import './style/style1.stylus';
@import '../style/style2.styl';
@import '~@/style/style1.stylus';
@import 'style/style2.styl';`

const vueAfter = `
@import './style/style1.stylus';
@import '../style/style2.styl';
@import '../style/style1.stylus';
@import '../style/style2.styl';`

const stylAfter = `
@import './style/style1.stylus';
@import '../style/style2.styl';
@import './style1.stylus';
@import './style2.styl';`

describe('vite-stylus-alisa', () => {
    const vueId = path.resolve(__dirname, 'src/views/index.vue') + '?vue&type=style&index=0&lang.stylus'
    const stylId = path.resolve(__dirname, 'src/style/index.styl')

    describe('no-alias', () => {
        const alias: Alias[] = []

        test('vue-import', () => {
            const code = transform(imports, vueId, alias)
            expect(code).toBe(imports)
        })
    })

    describe('string-alias', () => {
        const alias: Alias[] = [
            { find: '@', replacement: path.resolve(__dirname, 'src') },
            { find: 'style', replacement: path.resolve(__dirname, 'src/style') }
        ]

        test('vue-import', () => {
            const code = transform(imports, vueId, alias).replace(/\\/g, '/')
            expect(code).toBe(vueAfter)
        })

        test('style-import', () => {
            const code = transform(imports, stylId, alias).replace(/\\/g, '/')
            expect(code).toBe(stylAfter)
        })
    })

    describe('reg-alias', () => {
        const alias: Alias[] = [
            { find: /^@/, replacement: path.resolve(__dirname, 'src') },
            { find: /^style/, replacement: path.resolve(__dirname, 'src/style') }
        ]

        test('vue-import', () => {
            const code = transform(imports, vueId, alias).replace(/\\/g, '/')
            expect(code).toBe(vueAfter)
        })

        test('style-import', () => {
            const code = transform(imports, stylId, alias).replace(/\\/g, '/')
            expect(code).toBe(stylAfter)
        })
    })
})