import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Popover, Space, Typography, Popconfirm, Tooltip } from 'antd'
import { DownOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import Texty from 'rc-texty'
import { CartList, useShoppingCart } from '../'
import { CartSelectDropdown } from '../'
import './shopping-cart-popover.css'

const { Title, Text, Paragraph } = Typography

export const CartPopover = ({
  visible,
  onVisibleChange,
  onCheckout,
  cartListProps={},
  popoverContentProps={},
  children
}) => {
  const { activeCart, setActiveCart, emptyCart, getCartTotal } = useShoppingCart()
  const [name, setName] = useState("")

  const popoverRef = useRef()

  const checkoutDisabled = activeCart.items.length === 0
  const cartTotal = useMemo(() => getCartTotal(activeCart), [activeCart, getCartTotal])

  /* Forces   */
  useEffect(() => {
    setName("")
  }, [activeCart.name])

  useEffect(() => {
    if (!name) setName(activeCart.name)
  }, [name])
  
  return (
    <Popover
      overlayClassName="shopping-cart-popover"
      ref={popoverRef}
      title={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "8px 0" }}>
          <Title
            level={5}
            style={{
              margin: 0,
              fontSize: 12,
              letterSpacing: "0.5px",
              color: "#434343",
              textTransform: "uppercase",
              overflow: "hidden",
              // border: "1px solid red"
            }}
          >
            <Texty type="alpha" mode="sync" duration={ 300 } component="span">{name}</Texty>
          {/* <> &bull; { countCart(activeCart) } items </> */}
          </Title>
          <CartSelectDropdown onSelect={ (cart) => setActiveCart(cart) }>
            <a type="button" style={{ marginLeft: 8 }}>
              <Space>
                Change
                <DownOutlined />
              </Space>
            </a>
          </CartSelectDropdown>
        </div>
      }
      content={
        <div className="cart-popover-content" { ...popoverContentProps }>
          <div className="cart-list-container">
            <CartList { ...cartListProps }/>
          </div>
          { cartTotal.subtotal !== null && (
            <div className="cart-total">
              <div className="cart-subtotal">
                <span className="subtotal-text">Subtotal</span>
                <span className="subtotal-value">
                  ${ cartTotal.subtotal.toFixed(2) }
                </span>
              </div>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
            <Popconfirm
              overlayClassName="clear-cart-confirm"
              title={
                <Space direction="vertical">
                  <Space>
                    {/* <Text type="warning"><ExclamationCircleOutlined /></Text> */}
                    <Text style={{ fontWeight: 500, fontSize: 15 }}>Are you sure you want to empty your cart?</Text>
                  </Space>
                  <Paragraph>
                    You won't be able to undo this action.
                  </Paragraph>
                  {/* <Divider style={{ margin: "8px 0" }} /> */}
                </Space>
              }
              icon={ null }
              onConfirm={ () => emptyCart(activeCart) }
              okText="Yes, empty it"
              cancelText="Cancel"
            >
              <Button type="ghost">
                Empty
              </Button>
            </Popconfirm>
            <Tooltip placement="bottom" title={ checkoutDisabled ? "You need to add items to the cart." : undefined}>
              {/* Button transitions don't currently work properly on Tooltip-wrapped buttons due to a bug in antd.  */}
              <span style={{
                flexGrow: 1,
                marginLeft: 8,
                ...( checkoutDisabled ? { display: "inline-block", cursor: "not-allowed", width: "100%" } : {} )
              }}>
                <Button
                  type="primary"
                  block
                  icon={ <ShoppingCartOutlined /> }
                  disabled={ checkoutDisabled }
                  onClick={ (e) => {
                    onCheckout(e)
                    if (!e.defaultPrevented) {
                      popoverRef.current?.close()
                    }
                  } }
                  style={{
                    pointerEvents: checkoutDisabled ? "none" : undefined
                  }}
                >
                  Checkout
                </Button>
              </span>
            </Tooltip>
          </div>
        </div>
      }
      placement="bottomLeft"
      trigger="click"
      visible={ visible }
      onVisibleChange={ onVisibleChange }
      overlayStyle={{ minWidth: 300 }}
    >
      { children }
    </Popover>
  )
}