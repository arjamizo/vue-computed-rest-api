  import api from '.'

export function buildProxyREST() {
  const isTest = process.env.NODE_ENV !== 'test'

  const handler = {
    get: function(target, name) {
      return name in target ? target[name] : null
    }
  }

  const base = new Proxy([], handler)

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
    async push(...elements) {
      return Array.prototype.push.apply(base, elements)
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
  
  return base

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
