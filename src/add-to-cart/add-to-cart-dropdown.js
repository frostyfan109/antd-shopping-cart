import React, { useCallback, useMemo } from 'react'
import { Dropdown, Typography } from 'antd'
import { DownOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import { CartSelectDropdownMenu, useShoppingCart } from '../'
import { AddToCartIcon } from './'
import './add-to-cart.css'

const { Text } = Typography

export const AddToCartDropdownButton =  ({
    item,
    notify=true,
    small=false,
    buttonProps: _buttonProps={},
    cartSelectDropdownProps={}
}) => {
    const { carts, activeCart, buckets, addCart, setActiveCart, isItemInCart, addToCart, removeFromCart, getBucket } = useShoppingCart()
    const {
        className:  buttonClassName,
        style: buttonStyle,
        children: buttonChildren,
        ...buttonProps
    } = _buttonProps

    const bucket = useMemo(() => item.bucketId, [item.bucketId])
    const isInCart = useCallback((cart) => isItemInCart(cart, item), [item, isItemInCart])
    const toggleCart = useCallback((cart) => {
        isInCart(cart) ?
            removeFromCart(cart, item, notify) :
            addToCart(cart, item, notify)
    }, [isInCart, item, notify])

    const buttonContent = useMemo(() => (
        buttonChildren ? buttonChildren : (
            small ? (
                isInCart(activeCart) ?
                    <MinusOutlined /> :
                    <AddToCartIcon />
            ) : (
                isInCart(activeCart) ?
                    `Remove${ buckets.length > 1 ? ` ${ getBucket(bucket).itemName }` : "" } from cart` :
                    `Add ${ buckets.length > 1 ?  ` ${ getBucket(bucket).itemName }` : "" } to cart`
            )
        )
    ), [activeCart, item, bucket, buckets, isInCart, getBucket, buttonChildren])


    return (
        <Dropdown.Button
            className={ classNames("add-to-cart-dropdown-button", buttonClassName) }
            size={small ? "small" : "middle"}
            trigger="click"
            type={ small ? (
                "ghost"
            ) : (
                isInCart(activeCart) ? "ghost" : "primary"
            )}
            placement={ "bottomRight" }
            overlay={
                <CartSelectDropdownMenu
                    cartIconRender={ (cart) => isInCart(cart) ? (
                        <MinusOutlined />
                    ) : (
                        <PlusOutlined />
                    )}
                    newCartSearchEntry={{
                        enabled: false,
                        hint: "(Create and add)",
                        onClick: (cartName) => {
                            addCart(cartName)
                            setActiveCart(cartName)
                            toggleCart(cartName)
                        }
                    }}
                    disableFavoriteButton
                    disableNewCartEntry
                    disableActiveCart={ false }
                    onSelect={ (cart) => {
                        toggleCart(cart)
                    }}
                    { ...cartSelectDropdownProps }
                />
            }
            onClick={ (e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleCart(activeCart)
            } }
            icon={ <DownOutlined /> }
            style={{
                minWidth: !small ? 225 : undefined,
                ...buttonStyle
            }}
            {...buttonProps}
        >
            { buttonContent }
        </Dropdown.Button>
    )
}