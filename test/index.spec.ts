import path from 'path'
import { Alias } from 'vite'
import { transform } from '../src/index'

const imports = `
@import './style/style1.stylus';
@import '../style/style2.styl';
@import '~@/style/style1.stylus';
@import 'style/style2.styl';`

const after = `
@import './style/style1.stylus';
@import '../style/style2.styl';
@import '../style/style1.stylus';
@import '../style/style2.styl';`

describe('vite-stylus-alisa', () => {
    const vueId = path.resolve(__dirname, 'src/views/index.vue') + '?vue&type=style&index=0&lang.stylus'
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

            expect(code).toBe(after)
        })
    })

    describe('reg-alias', () => {
        const alias: Alias[] = [
            { find: /^@/, replacement: path.resolve(__dirname, 'src') },
            { find: /^style/, replacement: path.resolve(__dirname, 'src/style') }
        ]

        test('vue-import', () => {
            const code = transform(imports, vueId, alias).replace(/\\/g, '/')

            expect(code).toBe(after)
        })
    })
})