import { createClient } from 'contentful'
const client = createClient({
  space: process.env.CF_SPACE_ID,
  accessToken: process.env.CF_DELIVERY_TOKEN
})

module.exports = async (req, res) => {
  const _parseData = ({ items: entries }) => {
    const MAX_SIZE = 3000
    return entries.map(entry => {
      const { image, ...fields } = entry.fields
      const { height, width } = image.fields.file.details.image
      fields.imageUrl =
        image.fields.file.url +
        (height > width ? `?h=${MAX_SIZE}` : `?w=${MAX_SIZE}`) // set either width or height to max size based on aspect ratio
      fields.imageHeight = height
      fields.imageWidth = width
      fields.imageWidth = image.fields.file.details.image.width
      fields.id = image.sys.id
      return fields
    })
  }

  const _randomizeArray = arr => arr.sort(() => Math.random() - 0.5)

  const getImages = await client
    .getEntries({
      content_type: 'galleryImages'
    })
    .then(_parseData)
    .then(_randomizeArray)

  res.setHeader(
    'Access-Control-Allow-Origin',
    `http://localhost:${process.env.DEV_PORT}`,
    'gallery.leoallen.me'
  )
  res.setHeader('Cache-Control', 's-maxage=1', 'stale-while-revalidate')

  return res.json(getImages)
}
