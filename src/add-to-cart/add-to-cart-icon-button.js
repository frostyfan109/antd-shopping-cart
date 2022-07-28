import React, { useMemo } from 'react'
import { ShoppingCartOutlined as ShoppingCartIcon } from '@ant-design/icons'
import { useShoppingCart } from '../'

export const AddToCartIconButton = ({
    item,
    notify=true,
    style={},
    ...props
}) => {
    const { activeCart, isItemInCart, addToCart, removeFromCart } = useShoppingCart()
    
    const isInCart = useMemo(() => isItemInCart(activeCart, item), [activeCart, item, isItemInCart])

    return (
        <ShoppingCartIcon
            className="icon-btn no-hover"
            onClick={ (e) => {
                e.preventDefault()
                e.stopPropagation()
                isInCart ?
                    removeFromCart(activeCart, item, notify) :
                    addToCart(activeCart, item, notify)
            } }
            style={{
                fontSize: 16,
                color: isInCart ? "#1890ff" : undefined,
                ...style
            }}
            {...props}
        />
    )
}