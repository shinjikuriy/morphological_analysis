import topPage from './index.html'

const server = Bun.serve({
  routes: {
    '/': topPage,
  },
})

console.log(`server is running on ${server.url}`)