import { createClient } from 'contentful'

const client = createClient({
  space: '15m0d94yv6lj',
  accessToken: 'eVxveP0smsAIqCooOKsqKbYJ97ETHSOamwHhqAXx4AI',
})

export const getImages = (query = {}) => {
  return client
    .getEntries({
      content_type: 'galleryImages',
      ...query,
    })
    .then(data => {
      return data.items.map(entry => {
        const { image, ...fields } = entry.fields
        fields.imageUrl = image.fields.file.url
        fields.imageHeight = image.fields.file.details.image.height
        fields.imageWidth = image.fields.file.details.image.width
        fields.id = image.sys.id
        return fields
      })
    })
}
