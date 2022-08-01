import React, { useMemo } from 'react'
import { Popconfirm, Space, Typography } from 'antd'
import { useShoppingCart } from '../'

const { Text, Paragraph } = Typography

export const EmptyCartPopconfirm = ({ cart: _cart=undefined, children, ...props }) => {
  const { activeCart, emptyCart } = useShoppingCart()

  const cart = useMemo(() => _cart ? _cart : activeCart, [_cart, activeCart])

  return (
    <Popconfirm
      overlayClassName="no-icon-popconfirm"
      title={
        <Space direction="vertical">
          <Space>
            <Text style={{ fontWeight: 500, fontSize: 15 }}>Are you sure you want to empty your cart?</Text>
          </Space>
          <Paragraph>
            You won't be able to undo this action.
          </Paragraph>
        </Space>
      }
      icon={ null }
      onConfirm={ () => emptyCart(cart) }
      okText="Yes, empty it"
      cancelText="Cancel"
      { ...props }
    >
      { children }
    </Popconfirm>
  )
}