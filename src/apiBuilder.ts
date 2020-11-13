import api from '.'

const prefixAPI = 'http://localhost:1337'

const headers = {
  'Content-Type': 'application/json'
}

/**
 * 
 * @param initialArray should be provided with initialization if used from a Vue component
 */

export function buildProxyREST(initialArray = []) {
  const isTest = process.env.NODE_ENV !== 'test'

  const fetchJs = (input: RequestInfo, init?: RequestInit | undefined) =>
    fetch(input, init).then(r => r.ok ? r.json() : r)

  const handler = {
    get: function(target, name) {
      return name in target ? target[name] : null
    },
    _set() {
      console.info('setting :)')
      debugger
    },
  }

  const originalPush = initialArray.push
  const originalSplice = initialArray.splice

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
    async push(...elements) {
      // if (this.ok) {debugger}
      // debugger
      const r = await fetchJs(`${prefixAPI}/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify(elements[0]),
      })
      // TODO catch and undo if an error
      return originalPush.apply(initialArray, [r])
      // return originalPush.apply(initialArray, [...elements])
      // return initialArray.push.apply(initialArray, [element])
      // return Array.prototype.push.apply(initialArray, [element])
      // return Array.prototype.push.call(base, elements)
      // return [].prototype.push.call(base, elements)
      // return [].prototype.push.call(initialArray, elements)
      // return initialArray.prototype.push.call([], elements)
    },
    async splice(i, n) {
      if(i !== undefined && n) {
      const [idx, pKey = 'id'] = [i]// [...args]
      const object = initialArray[idx]
      // debugger
      const r = await fetch(`${prefixAPI}/products/${object[pKey]}`, {
        method: 'DELETE',
        // headers,
      })
      // TODO catch and undo if an error
      options.inst && options.inst.$emit(`update:${options.propName}`, base)
      }
      return originalSplice.apply(initialArray, [i, n])
    },
    async get() {
      const resp = await fetchJs(`${prefixAPI}/products`)
      originalSplice.call(initialArray, 0)
      originalPush.apply(initialArray, [...resp])
      return resp
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
