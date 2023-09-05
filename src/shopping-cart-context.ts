import React, { createContext, createElement, Fragment, ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { message, notification } from 'antd'
import { PlusOutlined, MinusOutlined } from '@ant-design/icons'
import { toWords } from 'number-to-words'
import { CreateCartModal, ManageCartModal, ImportCartModal } from './modals'
import { useLocalStorage } from './hooks/use-local-storage'
import getSymbolFromCurrency from 'currency-symbol-map'
import type { ConceptsResponse, ConceptsResponseSuccess, StudiesResponse, StudiesResponseSuccess, VariablesResponse, VariablesResponseSuccess } from './dug-search-types'

type ID = number | string

type Total = {
  subtotal: number | null,
  tax: number | null,
  total: number | null
}

interface CartImport {
  concept_id?: string[];
  study_id?: string[];
  variable_id?: string[];
  cde_id?: string[];
}

interface From {
  type: string,
  value: any
}

interface Item {
  id: ID,
  name: string,
  nameSecondary?: string,
  description?: string,
  productUrl?: string,
  imageUrl?: string,
  quantity: number,
  price: number | null,
  tax: number | null,

  from?: From,
  bucketId: ID,

  item: any,
  createdTime: number
}
type ItemBlueprint = Omit<Item, "createdTime">

interface Cart {
  name: string,
  canDelete: boolean,
  favorited: boolean,
  items: Item[],
  modifiedTime: number,
  createdTime: number,
}
type CartBlueprint = Partial<Cart> & {
  name: string
}

interface Bucket {
  id: ID,
  name: string,
  itemName: string
}

const createCart = (cart: CartBlueprint): Cart => {
  return {
    favorited: false,
    canDelete: true,
    items: [],
    createdTime: Date.now(),
    modifiedTime: Date.now(),
    ...cart,
  }
}

const createCartItem = (item: ItemBlueprint): Item => {
  return {
    createdTime: Date.now(),
    ...item,
  }
}


interface IShoppingCartContext {
  carts: Cart[],
  addCart: (cart: CartBlueprint) => void,
  removeCart: (name: string | Cart) => void,
  updateCart: (
    name: string | Cart,
    props: Partial<Cart> | ((prevState: Cart) => Partial<Cart>)
  ) => void,
  emptyCart: (name: string | Cart) => void,
  
  addToCart: (cartName: string | Cart, item: ItemBlueprint, notify: boolean) => void,
  removeFromCart: (cartName: string | Cart, itemId: ID | Item, notify: boolean) => void,

  isItemInCart: (cartName: string | Cart, itemId: ID | Item) => boolean,
  updateCartItem: (cartName: string | Cart, itemId: ID | Item, props: Partial<Item> | ((prevState: Item) => Partial<Item>)) => void,
  moveCartItems: (sourceCartName: string | Cart, targetCartName: string | Cart, itemIds: (ID | Item)[], notify: boolean) => Item[],
  copyCartItems: (sourceCartName: string | Cart, targetCartName: string | Cart, itemIds: (ID | Item)[], notify: boolean) => Item[],
  
  activeCart: Cart,
  setActiveCart: (name: string | Cart) => void,
  getBucketTotal: (cartName: string | Cart, bucketId: ID) => Total,
  getCartTotal: (cartName: string | Cart) => Total,

  buckets: Bucket[], getBucket: (id?: ID) => Bucket,

  currencyCode: string, currencySymbol: string,

  openCreateCartModal: () => void, closeCreateCartModal: () => void,
  openImportCartModal: () => void, closeImportCartModal: () => void,
  openManageCartModal: (cartName: string | Cart) => void, closeManageCartModal: () => void
}

export const ShoppingCartContext = createContext<IShoppingCartContext>({} as IShoppingCartContext)
export const useShoppingCart = () => useContext(ShoppingCartContext)

interface ShoppingCartProviderProps {
  buckets: Bucket[],
  defaultCartName?: string,
  localStorageKey?: string,
  currency?: string,
  helxSearchUrl: string,
  children: ReactNode
}
export const ShoppingCartProvider = ({
  buckets,
  defaultCartName="My cart",
  localStorageKey="shopping_carts",
  currency="USD",
  helxSearchUrl,
  children
}: ShoppingCartProviderProps) => {
  const [carts, setCarts] = useLocalStorage<Cart[]>(localStorageKey, [ createCart({
    name: defaultCartName,
    canDelete: false
  }) ])
  const [showCreateCartModal, setShowCreateCartModal] = useState<boolean>(false)
  const [showImportCartModal, setShowImportCartModal] = useState<boolean>(false)
  const [showManageCartModal, setShowManageCartModal] = useState<string|null>(null)
  const [activeCartName, setActiveCartName] = useState<string>(defaultCartName)
  const activeCart = useMemo<Cart>(() => carts.find((cart) => cart.name === activeCartName), [carts, activeCartName])

  const currencyCode = useMemo(() => currency, [currency])
  const currencySymbol = useMemo(() => getSymbolFromCurrency(currencyCode), [currencyCode])

  const getBucket = useCallback((id?: ID): Bucket => {
    if (!id) {
      if (buckets.length === 1) id = buckets[0].id
      else throw new Error("Bucket id not provided. This is required if multiple buckets are in use.")
    }
    return buckets.find((bucket) => bucket.id === id)
  }, [buckets])

  const getCart = useCallback((name: string | Cart): Cart => {
    if (typeof name === "object") ({ name } = name)
    const cart = carts.find((cart) => cart.name === name)
    return cart
  }, [carts])

  const getCartItem = useCallback((cartName: string | Cart, itemId: ID | Item): Item => {
    const cart = getCart(cartName)
    if (typeof itemId === "object") ({ id: itemId } = itemId)

    return cart.items.find((cartItem) => (
      // cartItem.bucketId === bucketId &&
      cartItem.id === itemId
    ))
  }, [getCart])

  const setActiveCart = useCallback((name: string | Cart) => {
    const cart = getCart(name)
    setActiveCartName(cart.name)
  }, [carts])

  const addCart = useCallback((cart: CartBlueprint) => {
    if (getCart(cart.name)) throw new Error("Cannot create a new cart with duplicate `name` key.")
    setCarts([
      ...carts,
      createCart(cart)
    ])
  }, [getCart])

  const removeCart = useCallback((name: string | Cart) => {
    const cart = getCart(name)
    setCarts(carts.filter((_cart) => _cart.name !== cart.name))
    if (cart.name === activeCart.name) {
      const sortedCarts = carts.sort((a, b) => a.name.localeCompare(b.name))
      const index = sortedCarts.indexOf(cart)
      const nextUpCart = index === 0 ? sortedCarts[1] : sortedCarts[index - 1]
      setActiveCart(nextUpCart.name)
    }
  }, [carts, activeCart, getCart, setActiveCart])

  const updateCart = useCallback((
    name: string | Cart,
    props: Partial<Cart> | ((prevState: Cart) => Partial<Cart>)
  ) => {
    const cart = getCart(name)

    if (typeof props === "function") props = props(cart)
    setCarts([
      ...carts.filter((_cart) => _cart !== cart),
      {
        ...cart,
        ...props,
        modifiedTime: Date.now()
      }
    ])
  }, [carts, getCart])

  const importCart = useCallback(async (
    name: string,
    itemIds: CartImport,
    favorited: boolean = false,
  ) => {
    if (getCart(name)) throw new Error("Cannot create a new cart with duplicate `name` key.")
    
    const fetchConcepts = (): Promise<ConceptsResponseSuccess | null>  =>
      fetch(`${helxSearchUrl}/concepts?ids=${itemIds.concept_id.join('&ids=')}`)
        .then(res => res.json() as Promise<ConceptsResponse>)
        .then(json => ("detail" in json ? null : json))

    const fetchStudies = (): Promise<StudiesResponseSuccess | null> =>
      fetch(`${helxSearchUrl}/studies?ids=${itemIds.study_id.join('&ids=')}`)
        .then(res => res.json() as Promise<StudiesResponse>)
        .then(json => ("detail" in json ? null : json))

    const fetchVariables = (): Promise<VariablesResponseSuccess | null> =>
      fetch(`${helxSearchUrl}/variables?ids=${itemIds.variable_id.join('&ids=')}`)
        .then(res => res.json() as Promise<VariablesResponse>)
        .then(json => ("detail" in json ? null : json))

    const fetchCdes = (): Promise<VariablesResponseSuccess | null> =>
      fetch(`${helxSearchUrl}/variables?ids=${itemIds.cde_id.join('&ids=')}`)
        .then(res => res.json() as Promise<VariablesResponse>)
        .then(json => ("detail" in json ? null : json))

    const [concepts, studies, variables, cdes]: [
      ConceptsResponseSuccess | null,
      StudiesResponseSuccess | null,
      VariablesResponseSuccess | null,
      VariablesResponseSuccess | null,
    ] = await Promise.allSettled([
      Array.isArray(itemIds.concept_id) && itemIds.concept_id.length > 0
        ? fetchConcepts()
        : null,
      Array.isArray(itemIds.study_id) && itemIds.study_id.length > 0 
        ? fetchStudies()
        : null,
      Array.isArray(itemIds.variable_id) && itemIds.variable_id.length > 0 
        ? fetchVariables()
        : null,
      Array.isArray(itemIds.cde_id) && itemIds.cde_id.length > 0 
        ? fetchCdes()
        : null,
    ]).then(([conceptRes, studyRes, varRes, cdeRes]) => [
      conceptRes.status === 'fulfilled' ? conceptRes.value : null,
      studyRes.status === 'fulfilled' ? studyRes.value : null,
      varRes.status === 'fulfilled' ? varRes.value : null,
      cdeRes.status === 'fulfilled' ? cdeRes.value : null,
    ]);

    const items: Item[] = [];

    if (concepts !== null) {
      concepts.result.docs.map(({ _source }) => _source).forEach(concept => {
        items.push({
          createdTime: Date.now(),
          name: `${concept.name} (${concept.type})`,
          id: concept.id,
          description: concept.description,
          price: null,
          tax: null,
          quantity: null,
          from: {
            type: "cart-import",
            value: "cart-import"
          },
          bucketId: "concepts",
          item: concept,
        })
      })
    }

    if (studies !== null) {
      studies.result.forEach(study => {
        items.push({
          createdTime: Date.now(),
          name: study.c_name,
          id: study.c_id,
          description: study.c_link,
          price: null,
          tax: null,
          quantity: null,
          from: {
            type: "cart-import",
            value: "cart-import"
          },
          bucketId: "studies",
          item: study,
        })
      })
    }

    if (variables !== null) {
      variables.result.docs.map(({ _source }) => _source).forEach(variable => {
        items.push({
          createdTime: Date.now(),
          name: variable.element_name,
          id: variable.element_id,
          description: variable.element_desc,
          price: null,
          tax: null,
          quantity: null,
          from: {
            type: "cart-import",
            value: "cart-import"
          },
          bucketId: "variables",
          item: variable,
        })
      })
    }

    if (cdes !== null) {
      cdes.result.docs.map(({ _source }) => _source).forEach(cde => {
        items.push({
          createdTime: Date.now(),
          name: cde.element_name,
          id: cde.element_id,
          description: cde.element_desc,
          price: null,
          tax: null,
          quantity: null,
          from: {
            type: "cart-import",
            value: "cart-import"
          },
          bucketId: "cdes",
          item: cde,
        })
      })
    }

    setCarts(prevCarts => [
      ...prevCarts,
      createCart({
        name,
        favorited,
        items,
      })
    ])
  }, [getCart, setCarts, createCart])

  /** The `from` field will be appended to shopping cart elements to track where they originate from in the DUG UI.
   * 
   * Structure is { type: string, value: any } where `value` depends on `type`.
   * - { type: "search", value: "<search_query>" }
   * - { type: "concept", value: <dug_concept> }
   * - { type: "study", value: <dug_study> }
   * 
   * It has been structured in this way in anticipation of future workflows beyond
   * simply "searches yield concepts, concepts yield studies, studies yield variables"
   * 
  */
  const addToCart = useCallback((cartName: string | Cart, item: ItemBlueprint, notify: boolean=false) => {
    const cart = getCart(cartName)
    const cartItem = createCartItem(item)
    updateCart(cartName, (cart) => ({
      items: [
        ...cart.items,
        cartItem
      ]
    }))
    if (notify) message.info({
      content: createElement(
        "span",
        null,
        "Added ",
        createElement("i", null, cartItem.name),
        ` to ${ cart.name }`,
      ),
      icon: createElement(PlusOutlined),
      key: `cart-alert-${ cartName }-${ cartItem.id }`
    })
  }, [getCart, updateCart])
  const removeFromCart = useCallback((cartName: string | Cart, itemId: ID | Item, notify=false) => {
    const cart = getCart(cartName)
    const cartItem = getCartItem(cartName, itemId)
    updateCart(cartName, (cart) => ({
      items: cart.items.filter((_cartItem) => (
        _cartItem.id !== cartItem.id
      ))
    }))
    if (notify) message.info({
      content: createElement(
        "span",
        null,
        "Removed ",
        createElement("i", null, cartItem.name),
        ` from ${ cart.name }`,
      ),
      icon: createElement(MinusOutlined),
      key: `cart-alert-${ cartName }-${ cartItem.id }`
    })
  }, [getCart, getCartItem, updateCart])
  const updateCartItem = useCallback((cartName: string | Cart, itemId: ID | Item, props: Partial<Item> | ((prevState: Item) => Partial<Item>)) => {
    const cartItem = getCartItem(cartName, itemId)

    if (typeof props === "function") props = props(cartItem)
    updateCart(cartName, (cart) => ({
      items: cart.items.map((item) => item !== cartItem ? item : ({
        ...cartItem,
        ...props
      }))
    }))
  }, [getCartItem, updateCart])

  const moveCartItems = useCallback((
    sourceCartName: string | Cart,
    targetCartName: string | Cart,
    itemIds: (ID | Item)[],
    notify=false
  ): Item[] => {
    const sourceCart = getCart(sourceCartName)
    const targetCart = getCart(targetCartName)
    const targetItems = itemIds.map((itemId) => getCartItem(sourceCartName, itemId))
    const moveableItems = targetItems.filter((item) => !targetCart.items.find((_item) => _item.id === item.id))
    const unmoveableItems = targetItems.filter((item) => targetCart.items.find((_item) => _item.id === item.id))

    setCarts([
      ...carts.filter((cart) => cart !== sourceCart && cart !== targetCart),
      {
        ...sourceCart,
        items: sourceCart.items.filter((item) => !moveableItems.find((_item) => _item.id === item.id)),
        modifiedTime: Date.now()
      },
      {
        ...targetCart,
        items: [
          ...targetCart.items,
          ...moveableItems
        ],
        modifiedTime: Date.now()
      }
    ])

    if (notify) {
      if (unmoveableItems.length === 0) {
        const countAsWords = toWords(moveableItems.length)
        const isPlural = moveableItems.length !== 1
        notification.success({
          message: "Moved items",
          description:
            `Moved ${ countAsWords } ${ isPlural ? "items" : "item" } to ${ targetCart.name }.`,
          key: `cart-alert-move`
        })
      }
      else {
        const countAsWords = toWords(unmoveableItems.length)
        const isPlural = unmoveableItems.length !== 1
        notification.info({
          message: "Some items could not be moved",
          description:
            `${ countAsWords[0].toUpperCase() + countAsWords.slice(1) } ${ isPlural ? "items were" : "item was" } not moved because ${ isPlural ? "they are" : "it is" } already in ${ targetCart.name }.`,
          key: `cart-alert-move`
        })
      }
    }

    return unmoveableItems
  }, [carts, getCart, getCartItem])

  const copyCartItems = useCallback((
    sourceCartName: string | Cart,
    targetCartName: string | Cart,
    itemIds: (ID | Item)[],
    notify=false
  ): Item[] => {
    const targetCart = getCart(targetCartName)
    const targetItems = itemIds.map((itemId) => getCartItem(sourceCartName, itemId))
    const copyableItems = targetItems.filter((item) => !targetCart.items.find((_item) => _item.id === item.id))
    const uncopyableItems = targetItems.filter((item) => targetCart.items.find((_item) => _item.id === item.id))
    
    updateCart(targetCartName, {
      items: [
        ...targetCart.items,
        ...copyableItems
      ]
    })

    if (notify) {
      if (uncopyableItems.length === 0) {
        const countAsWords = toWords(copyableItems.length)
        const isPlural = copyableItems.length !== 1
        notification.success({
          message: "Copied items",
          description:
            `Copied ${ countAsWords } ${ isPlural ? "items" : "item" } to ${ targetCart.name }.`,
          key: `cart-alert-copy`
        })
      }
      else {
        const countAsWords = toWords(uncopyableItems.length)
        const isPlural = uncopyableItems.length !== 1
        notification.info({
          message: "Some items could not be copied",
          description:
            `${ countAsWords[0].toUpperCase() + countAsWords.slice(1) } ${ isPlural ? "items were" : "item was" } not copied because ${ isPlural ? "they are" : "it is" } already in ${ targetCart.name }.`,
          key: `cart-alert-copy`
        })
      }
    }

    return uncopyableItems
  }, [getCart, getCartItem, updateCart])

  const emptyCart = useCallback((cartName: string | Cart) => {
    updateCart(cartName, (cart) => ({
      items: []
    }))
  }, [updateCart])
  
  const openCreateCartModal = useCallback(() => {
    setShowCreateCartModal(true)
  }, [])
  const closeCreateCartModal = useCallback(() => {
    setShowCreateCartModal(false)
  }, [])
  const openImportCartModal = useCallback(() => {
    setShowImportCartModal(true)
  }, [])
  const closeImportCartModal = useCallback(() => {
    setShowImportCartModal(false)
  }, [])
  const openManageCartModal = useCallback((cartName: string | Cart) => {
    const cart = getCart(cartName)
    setShowManageCartModal(cart.name)
  }, [getCart])
  const closeManageCartModal = useCallback(() => {
    setShowManageCartModal(null)
  }, [])

  const isItemInCart = useCallback((cartName: string | Cart, itemId: ID | Item): boolean => {
    return !!getCartItem(cartName, itemId)

  }, [getCartItem])

  const getBucketTotal = useCallback((cartName: string | Cart, bucketId: ID): Total => {
    const cart = getCart(cartName)

    const subtotal = cart.items
      .filter((cartItem) => cartItem.bucketId === bucketId)
      .reduce((total: number | null, item: Item) => {
        if (item.price !== null) total += item.price
        return total
      }, null)
    const tax = cart.items
      .filter((cartItem) => cartItem.bucketId === bucketId)
      .reduce((total: number | null, item: Item) => {
        if (item.tax !== null) total += item.tax
        return total
      }, null)
    let total = null
    if (subtotal !== null) (total as number) += (subtotal as number)
    if (tax !== null) (total as number) += (tax as number)
    return {
      subtotal,
      tax,
      total
    }
  }, [getCart])
  
  const getCartTotal = useCallback((cartName: string | Cart): Total => {
    // const sumKeyWithNull = (key: string, a: { [key]: number | null }, b: { [key]: number | null }) => b[key] !== null ? a[key] + b[key] : a[key]
    return buckets
      .map((bucket) => getBucketTotal(cartName, bucket.id))
      .reduce((total: Total, bucketTotal: Total) => {
        const newTotal = {}  as Total
        Object.keys(bucketTotal).forEach((key: keyof Total) => {
          newTotal[key] = bucketTotal[key] !== null ? total[key] + bucketTotal[key] : total[key]
        })
        return newTotal
      }, {
        subtotal: null,
        tax: null,
        total: null,
      })
  }, [buckets, getBucketTotal])
  
  return (
    createElement(
      ShoppingCartContext.Provider,
      {
        value: {
          carts, addCart, removeCart, updateCart, emptyCart,
          addToCart, removeFromCart, updateCartItem, isItemInCart,
          moveCartItems, copyCartItems,
          activeCart, setActiveCart,
          getBucketTotal, getCartTotal,

          buckets, getBucket,

          currencyCode, currencySymbol,

          openCreateCartModal, closeCreateCartModal,
          openImportCartModal, closeImportCartModal,
          openManageCartModal, closeManageCartModal
        }
      },
      createElement(
        Fragment,
        null,
        children,
        createElement(
          CreateCartModal,
          {
            carts,
            onConfirm: (cartName: string, favorited: boolean) => {
              addCart({
                name: cartName,
                favorited,
              })
              setActiveCartName(cartName)
              setShowCreateCartModal(false)
              
            },
            visible: showCreateCartModal,
            onVisibleChange: setShowCreateCartModal
          }
        ),
        createElement(
          ImportCartModal,
          {
            carts,
            onConfirm: (cartName: string, favorited: boolean, itemIds: CartImport) => {
              importCart(cartName, itemIds, favorited)
            },
            visible: showImportCartModal,
            onVisibleChange: setShowImportCartModal
          }
        ),
        createElement(
          ManageCartModal,
          {
            cart: carts.find((cart) => cart.name === showManageCartModal),
            carts,
            onConfirm: (cartName: string, favorited: boolean) => {
              updateCart(showManageCartModal, {
                name: cartName,
                favorited
              })
              setActiveCartName(cartName)
              setShowManageCartModal(null)
            },
            onDelete: () => {
              removeCart(showManageCartModal)
              setShowManageCartModal(null)
            },
            visible: showManageCartModal !== null,
            onVisibleChange: () => setShowManageCartModal(null)
          }
        )
      )
    )
  )
}