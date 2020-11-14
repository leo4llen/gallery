const utils = {
  composePromise: (...fns) => (state = {}) =>
    fns.reduce((sum, fn) => Promise.resolve(sum).then(fn), state),
}

export default utils
