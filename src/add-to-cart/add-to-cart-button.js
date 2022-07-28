import React, { useMemo } from 'react'
import { Button } from 'antd'
import { ShoppingCartOutlined as ShoppingCartIcon } from '@ant-design/icons'
import { useShoppingCart } from '../'
import './add-to-cart.css'

export const AddToCartButton = ({
    item,
    notify=true,
    style={},
    ...props
}) => {
    const { activeCart, isItemInCaart, addToCart, removeFromCart } = useShoppingCart()
    
    const isInCart = useMemo(() => isItemInCart(activeCart, item), [activeCart, item, isItemInCart])

    return (
        <Button
            type="text"
            icon={ <ShoppingCartIcon /> }
            onClick={ (e) => {
                e.preventDefault()
                e.stopPropagation()
                isInCart ?
                    removeFromCart(activeCart, item, notify) :
                    addToCart(activeCart, item, notify)
            } }
            style={{
                color: isInCart ? "#1890ff" : undefined,
                ...style
            }}
            {...props}
        />
    )
}