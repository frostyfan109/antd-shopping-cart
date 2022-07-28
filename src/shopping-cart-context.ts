import React, { createContext, createElement, Fragment, ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { message } from 'antd'
import { PlusOutlined, MinusOutlined } from '@ant-design/icons'
import { CreateCartModal } from './modals/create-cart-modal'
import { useLocalStorage } from './hooks/use-local-storage'
import getSymbolFromCurrency from 'currency-symbol-map'

type ID = number | string

type Total = {
  subtotal: number | null,
  tax: number | null,
  total: number | null
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
  items: Item[]
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
    canDelete: false,
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
  
  activeCart: Cart,
  setActiveCart: (name: string | Cart) => void,
  getBucketTotal: (cartName: string | Cart, bucketId: ID) => Total,
  getCartTotal: (cartName: string | Cart) => Total,

  buckets: Bucket[], getBucket: (id?: ID) => Bucket,

  currencyCode: string, currencySymbol: string,

  openCreateCartModal: () => void, closeCreateCartModal: () => void
}

export const ShoppingCartContext = createContext<IShoppingCartContext>({} as IShoppingCartContext)
export const useShoppingCart = () => useContext(ShoppingCartContext)

interface ShoppingCartProviderProps {
  buckets: Bucket[],
  defaultCartName?: string,
  localStorageKey?: string,
  currency?: string,
  children: ReactNode
}
export const ShoppingCartProvider = ({
  buckets,
  defaultCartName="My cart",
  localStorageKey="shopping_carts",
  currency="USD",
  children
}: ShoppingCartProviderProps) => {
  const [carts, setCarts] = useLocalStorage<Cart[]>(localStorageKey, [ createCart({
    name: defaultCartName,
    canDelete: false
  }) ])
  const [showCreateCartModal, setShowCreateCartModal] = useState<boolean>(false)
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
    if (cart.name === activeCart.name) setActiveCart(defaultCartName)
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
          activeCart, setActiveCart,
          getBucketTotal, getCartTotal,

          buckets, getBucket,

          currencyCode, currencySymbol,

          openCreateCartModal, closeCreateCartModal
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
        )
      )
    )
  )
}