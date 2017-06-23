import buble from "rollup-plugin-buble"
import uglify from "rollup-plugin-uglify"

export default {
    plugins: [
        buble(),
        uglify({
            compress: {
                collapse_vars: true,
                pure_funcs: ["Object.defineProperty"]
            }
        })
    ]
}
