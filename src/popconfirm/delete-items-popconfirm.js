import React, { useCallback, useMemo } from 'react'
import { Popconfirm, Space, Typography } from 'antd'
import { useShoppingCart } from '../'

const { Text, Paragraph } = Typography

export const DeleteItemsPopconfirm = ({ items, cart: _cart=undefined, children, ...props }) => {
  const { activeCart, updateCart } = useShoppingCart()

  const cart = useMemo(() => _cart ? _cart : activeCart, [_cart, activeCart])

  const deleteItems = useCallback(() => {
    updateCart(cart, {
      items: cart.items.filter((item) => !items.includes(item))
    })
  }, [cart, items, updateCart])

  return (
    <Popconfirm
      overlayClassName="no-icon-popconfirm"
      title={
        <Space direction="vertical">
          <Space>
            <Text style={{ fontWeight: 500, fontSize: 15 }}>Are you sure you want to remove these items?</Text>
          </Space>
          <Paragraph>
            You won't be able to undo this action.
          </Paragraph>
        </Space>
      }
      icon={ null }
      onConfirm={ deleteItems }
      okText="Yes, remove them"
      cancelText="Cancel"
      { ...props }
    >
      { children }
    </Popconfirm>
  )
}