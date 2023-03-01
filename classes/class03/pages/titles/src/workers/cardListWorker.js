onmessage = ({ data }) => {
  let counter = 0

  console.log('activating blocking operation...', data.maxItems)
  console.time('blocking-op')
  // blocking function
  // 1e5 = 100.000
  while (counter < data.maxItems) {
    console.log('.')
    counter++
  }
  
  console.timeEnd('blocking-op')

  postMessage({
    response: 'ok',
    data: counter
  })
}