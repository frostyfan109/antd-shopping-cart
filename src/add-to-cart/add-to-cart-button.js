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
    const { activeCart, isItemInBucket, addToCart, removeFromCart } = useShoppingCart()
    
    const bucket = useMemo(() => item.bucketId, [item.bucketId])
    const isInBucket = useMemo(() => isItemInBucket(activeCart, item, bucket), [activeCart, item, bucket, isItemInBucket])

    return (
        <Button
            type="text"
            icon={ <ShoppingCartIcon /> }
            onClick={ (e) => {
                e.preventDefault()
                e.stopPropagation()
                isInBucket ?
                    removeFromCart(activeCart, item, bucket, notify) :
                    addToCart(activeCart, item, bucket, notify)
            } }
            style={{
                color: isInBucket ? "#1890ff" : undefined,
                ...style
            }}
            {...props}
        />
    )
}