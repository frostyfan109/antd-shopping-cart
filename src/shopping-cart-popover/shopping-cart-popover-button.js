import React, { useState } from 'react'
import { Button } from 'antd'
import { ShoppingCartOutlined as ShoppingCartIcon } from '@ant-design/icons'
import { CartPopover } from './'

export const CartPopoverButton = ({
    buttonProps={},
    cartPopoverProps={}
}) => {
    const [showShoppingCart, setShowShoppingCart] = useState(false)

    return (
        <CartPopover
            visible={showShoppingCart}
            onVisibleChange={setShowShoppingCart}
            { ...cartPopoverProps }
        >
            <Button
                className="shopping-cart-button"
                type="primary"
                size="middle"
                icon={ <ShoppingCartIcon style={{ fontSize: 16 }} /> }
                onClick={ () => setShowShoppingCart(true) }
                { ...buttonProps }
            >
                Cart
            </Button>
        </CartPopover>
    )
}