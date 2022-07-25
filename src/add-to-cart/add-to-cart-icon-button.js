import React, { useMemo } from 'react'
import { ShoppingCartOutlined as ShoppingCartIcon } from '@ant-design/icons'
import { useShoppingCart } from '../'

export const AddToCartIconButton = ({
    item,
    notify=true,
    style={},
    ...props
}) => {
    const { activeCart, isItemInBucket, addToCart, removeFromCart } = useShoppingCart()
    
    const bucket = useMemo(() => item.bucketId, [item.bucketId])
    const isInBucket = useMemo(() => isItemInBucket(activeCart, item, bucket), [activeCart, item, bucket, isItemInBucket])

    return (
        <ShoppingCartIcon
            className="icon-btn no-hover"
            onClick={ (e) => {
                e.preventDefault()
                e.stopPropagation()
                isInBucket ?
                    removeFromCart(activeCart, item, bucket, notify) :
                    addToCart(activeCart, item, bucket, notify)
            } }
            style={{
                fontSize: 16,
                color: isInBucket ? "#1890ff" : undefined,
                ...style
            }}
            {...props}
        />
    )
}