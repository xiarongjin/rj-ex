import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
// import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // serve(), // index.html should be in root of project
    livereload({
      watch: 'dist/index.html',
      verbose: false, // Disable console output

      // other livereload options
      port: 3000,
    }),
  ],
})
