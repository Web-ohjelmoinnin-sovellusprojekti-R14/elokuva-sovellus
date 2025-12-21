export function withCache(cache, url, producer) {
  const cached = cache.get(url)

  if (cached && Date.now() - cached.timestamp < 60 * 60 * 1000) {
    return cached.promise
  }

  const promise = producer().catch(err => {
    cache.delete(url)
    throw err
  })

  cache.set(url, {
    promise,
    timestamp: Date.now(),
  })

  return promise
}
