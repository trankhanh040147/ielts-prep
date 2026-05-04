import { setGlobalDispatcher, ProxyAgent } from 'undici'
import { app } from './app'

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
if (proxyUrl) {
  console.log(`Using proxy: ${proxyUrl}`)
  const proxyAgent = new ProxyAgent(proxyUrl)
  setGlobalDispatcher(proxyAgent)
}

const PORT = process.env.PORT ?? 3001

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`)
})
