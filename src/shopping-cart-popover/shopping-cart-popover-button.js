import React, { useState } from 'react'
import { Badge, Button } from 'antd'
import { ShoppingCartOutlined as ShoppingCartIcon } from '@ant-design/icons'
import { CartPopover } from './'
import { useShoppingCart } from '../'

export const CartPopoverButton = ({
    hideBadge=false,
    onCheckout,
    badgeProps={},
    buttonProps={},
    cartPopoverProps={}
}) => {
    const { activeCart } = useShoppingCart()
    const [showShoppingCart, setShowShoppingCart] = useState(false)

    return (
        <CartPopover
            visible={showShoppingCart}
            onVisibleChange={setShowShoppingCart}
            onCheckout={ onCheckout }
            { ...cartPopoverProps }
        >
            <Badge
                count={ hideBadge ? 0 : activeCart.items.length }
                showZero={ hideBadge ? false : undefined }
                offset={[ -8, 0 ]}
                { ...badgeProps }
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
            </Badge>
        </CartPopover>
    )
}