const _getImages = () => {
  const host =
    window.location.hostname === 'localhost' ? 'http://localhost:3000' : ''
  return fetch(host + '/get-images').then(res => res.json())
}

const _addLazyLoadObserver = () => {
  if (!'IntersectionObserver' in window)
    return alert('Your browser is old enough to be carbon dated!')
  const imageObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
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
  const fragment = new DocumentFragment()
  images.forEach((image, i) => {
    const imageTag = document.createElement('img')
    imageTag.dataset.src = image.imageUrl
    imageTag.dataset.id = i
    imageTag.classList.add('lazy')
    lazyLoadObserver.observe(imageTag)
    fragment.appendChild(imageTag)
    image.imageTag = imageTag
  })
  container.appendChild(fragment)
  return [images, container]
}

// This had to be a separate method as the width only gets computed
// when the image tags are added to the DOM. Which happens in line 44

const _setImagePlaceholders = images => {
  images.forEach(image => {
    const aspectRatio = image.imageWidth / image.imageHeight
    image.imageTag.style.height = `${
      image.imageTag.offsetWidth / aspectRatio
    }px`
  })
}

const _renderImagePlaceholders = ([images, container]) => {
  // Do this on load and on window resize events
  _setImagePlaceholders(images)
  window.addEventListener('resize', () => _setImagePlaceholders(images))
  return [images, container]
}

const _addPreviewEvents = ([images, imageContainer]) => {
  const body = document.getElementsByTagName('body')[0]
  const previewImage = document.getElementById('preview-image')
  const cameraSettings = document.getElementById('camera-settings')
  const previewModal = body.querySelector('#preview-modal')

  document
    .getElementById('modal-close')
    .addEventListener('click', () => body.classList.remove('modal-open'))
  window.addEventListener(
    'keyup',
    ({ key }) => key === 'Escape' && body.classList.remove('modal-open')
  )

  imageContainer.addEventListener('click', e => {
    const target = e.target || e.srcElement
    if (target.tagName.toLowerCase() === 'img') {
      previewImage.src = target.src
      previewImage.dataset.id = target.dataset.id
      cameraSettings.innerHTML = images[target.dataset.id].cameraSettings
      previewImage.onload = () => body.classList.add('modal-open')
    }
  })

  previewModal.addEventListener('click', e => {
    const target = e.target || e.srcElement
    if (target.classList.contains('image-scroll')) {
      const _scroll = {
        prev: index => (index - 1 < 0 ? images.length - 1 : --index),
        next: index => ++index % images.length
      }

      const nextIndex = _scroll[target.dataset.direction](
        previewImage.dataset.id
      )
      previewImage.src = images[nextIndex].imageUrl
      previewImage.dataset.id = nextIndex
      cameraSettings.innerHTML = images[nextIndex].cameraSettings
    }
  })
}

// Everything starts here

Promise.all([_getImages(), _getContainer(), _addLazyLoadObserver()])
  .then(_renderImages)
  .then(_renderImagePlaceholders)
  .then(_addPreviewEvents)
  .catch(console.error)
