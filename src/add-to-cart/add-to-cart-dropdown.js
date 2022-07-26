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
    const { carts, activeCart, addCart, setActiveCart, isItemInBucket, addToCart, removeFromCart, getBucket } = useShoppingCart()
    const {
        className:  buttonClassName,
        style: buttonStyle,
        children: buttonChildren,
        ...buttonProps
    } = _buttonProps

    const bucket = useMemo(() => item.bucketId, [item.bucketId])
    const isInBucket = useCallback((cart) => isItemInBucket(cart, item, bucket), [item, bucket, isItemInBucket])
    const toggleCart = useCallback((cart) => {
        isInBucket(cart) ?
            removeFromCart(cart, item, bucket, notify) :
            addToCart(cart, item, bucket, notify)
    }, [isInBucket, item, bucket, notify])

    const buttonContent = useMemo(() => (
        buttonChildren ? buttonChildren : (
            small ? (
                isInBucket(activeCart) ?
                    <MinusOutlined /> :
                    <AddToCartIcon />
            ) : (
                isInBucket(activeCart) ?
                    `Remove ${ getBucket(bucket).itemName } from cart` :
                    `Add ${ getBucket(bucket).itemName } to cart`
            )
        )
    ), [activeCart, item, bucket, isInBucket, getBucket, buttonChildren])


    return (
        <Dropdown.Button
            className={ classNames("add-to-cart-dropdown-button", buttonClassName) }
            size={small ? "small" : "middle"}
            trigger="click"
            type={ small ? (
                "ghost"
            ) : (
                isInBucket(activeCart) ? "ghost" : "primary"
            )}
            placement={ "bottomRight" }
            overlay={
                <CartSelectDropdownMenu
                    cartIconRender={ (cart) => isInBucket(cart) ? (
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