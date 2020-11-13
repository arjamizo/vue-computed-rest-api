import api from '.'

/**
 * 
 * @param initialArray should be provided with initialization if used from a Vue component
 */

export function buildProxyREST(initialArray = []) {
  const isTest = process.env.NODE_ENV !== 'test'

  const handler = {
    get: function(target, name) {
      return name in target ? target[name] : null
    }
  }

  const originalPush = initialArray.push

  const base = new Proxy(initialArray, handler) as Array<Object>

  const options = {
    propName: undefined,
    inst: {$emit(_, o) {}},
  }

  function setPropName(name) {
    options.propName = name
  }

  function setInstance(name) {
    options.inst = name
  }

  // isTest && 
  Object.assign(base, {
    ok: false,
    async push(element, el2) {
      // if (this.ok) {debugger}
      return originalPush.apply(initialArray, [element])
      // return initialArray.push.apply(initialArray, [element])
      // return Array.prototype.push.apply(initialArray, [element])
      // return Array.prototype.push.call(base, elements)
      // return [].prototype.push.call(base, elements)
      // return [].prototype.push.call(initialArray, elements)
      // return initialArray.prototype.push.call([], elements)
    },
    async splice(...args) {
      options.inst && options.inst.$emit(`update:${options.propName}`, base)
      return Array.prototype.splice.apply(base, args)
    },
    async get() {
      return Promise.resolve([{}, {}])
    },
  })
  //  || console.warn('USING STH ELSE')

  base.setPropName = setPropName
  base.setInstance = setInstance
  
  return base // as Array<Object>

  return {
    default: base, // always first, so array destruction works fine
    setPropName,
    setInstance,
  }
}

const singleton = buildProxyREST()

console.log('products REST client', singleton)

export default singleton

// const setPropName = singleton.setPropName

// export const setPropName = singleton.setPropName

/* tslint:disable-next-line */
// const [default, ...helpers] = singleton // eslint-disable-line

//export (()=>{debugger; return helpers})
