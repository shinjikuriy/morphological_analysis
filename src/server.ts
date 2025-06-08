import analyze from './analyze'
import topPage from './index.html'

const server = Bun.serve({
  routes: {
    '/': topPage,
    '/api/analyze': {
      POST: async (req) => {
        const { text } = await req.json()
        const result = await analyze(text)
        return new Response(JSON.stringify(result))
      },
    },
  },
})

console.log(`server is running on ${server.url}`)
