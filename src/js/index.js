import { getImages } from './contentful'

const _addLazyLoadObserver = () => {
  if (!'IntersectionObserver' in window)
    return alert('Your browser is old enough to be carbon dated!')
  const imageObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const image = entry.target
        image.src = image.dataset.src
        image.classList.remove('lazy')
        imageObserver.unobserve(image)
      }
    })
  })
  return imageObserver
}

const _getContainer = () => {
  return new Promise(resolve => {
    document.addEventListener('DOMContentLoaded', () => {
      const imageContainer = document.getElementById('image-container')
      resolve(imageContainer)
    })
  })
}

const _renderImages = ([images, container, lazyLoadObserver]) => {
  const MAX_SIZE = 3000
  images.elems = images.map((image, i) => {
    const query =
      image.imageHeight > image.imageWidth ? `?h=${MAX_SIZE}` : `?w=${MAX_SIZE}`
    const imageTag = document.createElement('img')
    imageTag.dataset.src = image.imageUrl + query
    imageTag.dataset.id = i
    imageTag.classList.add('lazy')
    lazyLoadObserver.observe(imageTag)
    return imageTag
  })
  const fragment = new DocumentFragment()
  images.elems.forEach(image => fragment.appendChild(image))
  container.appendChild(fragment)
  return images
}

const _addPreviewEvent = images => {
  images.elems.forEach(image => {
    image.addEventListener('click', e => {
      console.log(e.target.dataset.id)
    })
  })
}

Promise.all([
  getImages({ order: '-sys.createdAt' }),
  _getContainer(),
  _addLazyLoadObserver(),
])
  .then(_renderImages)
  .then(_addPreviewEvent)
  .catch(console.error)
