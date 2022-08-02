import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Space, Typography, Modal, Form, Input, Button, Divider } from 'antd'
import { StarOutlined, StarFilled } from '@ant-design/icons'
import { DeleteCartPopconfirm } from '../'

const { Text } = Typography

const ManageCartModalContent = ({
  cartName,
  setCartName,
  cartNameError,
  setCartNameError,
  favorited,
  setFavorited,

  onDelete,

  nameDisabled=false,
  deleteDisabled=false
}) => {
  const inputRef = useRef()

  const StarIcon = favorited ? StarFilled : StarOutlined

  return (
    <Space size="middle" direction="vertical" style={{ width: "100%" }}>
      <Text style={{ fontWeight: 500 }}>Name</Text>
      <Form.Item
        validateStatus={ cartNameError && "error" }
        help={ cartNameError ? "Carts cannot have duplicate names." : undefined }
        style={{ margin: 0 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            placeholder="Cart name..."
            value={ cartName }
            onChange={ (e) => setCartName(e.target.value) }
            disabled={ nameDisabled }
            ref={inputRef}
          />
          <StarIcon
            className="icon-btn"
            onClick={ () => setFavorited(!favorited) }
            style={{
              fontSize: 16,
              marginLeft: 16,
              color: favorited ? "#1890ff" : undefined
            }}
          />
        </div>
      </Form.Item>
      <div />
      {/* <Divider style={{ margin: "4px 0" }} /> */}
      <DeleteCartPopconfirm onConfirm={ onDelete } disabled={ deleteDisabled } placement="bottom">
        <Button danger block disabled={ deleteDisabled }>Delete</Button>
      </DeleteCartPopconfirm>
    </Space>
  )
}

export const ManageCartModal = ({
  cart,
  carts,
  visible,
  onVisibleChange,
  onConfirm,
  onDelete
}) => {
  /** Form state */
  const [cartName, setCartName] = useState(cart?.name)
  const [cartNameError, setCartNameError] = useState(false)
  const [favorited, setFavorited] = useState(cart?.favorited)
  
  useEffect(() => {
    setCartName(cart?.name)
    setFavorited(cart?.favorited)
  }, [visible])
  useEffect(() => setCartNameError(false), [cartName])

  // const createShoppingCart = useCallback(() => {
  //   if (carts.find((cart) => cart.name === cartName)) {
  //     setCartNameError(true)
  //   } else {
  //     onConfirm(cartName, favorited)
  //   }
  // }, [carts, cartName, onConfirm])

  const confirmManage = () => {
    const existingCart = carts.find((cart) => cart.name === cartName)
    if (existingCart && existingCart.name !== cart.name) {
      setCartNameError(true)
    } else {
      onConfirm(cartName, favorited)
    }
  }

  return (
    <Modal
      title="Manage cart"
      okText="Save"
      cancelText="Cancel"
      destroyOnClose={ true }
      width={ 400 }
      visible={ visible }
      onVisibleChange={ onVisibleChange }
      onOk={ confirmManage }
      onCancel={ () => onVisibleChange(false) }
      zIndex={1032}
      maskStyle={{ zIndex: 1031 }}
      wrapClassName="cart-manage-modal-wrapper"
    >
      <ManageCartModalContent
        cartName={ cartName }
        setCartName={ setCartName }
        cartNameError={ cartNameError }
        favorited={ favorited }
        setFavorited={ setFavorited }
        onDelete={ onDelete }
        nameDisabled={ !cart?.canDelete }
        deleteDisabled={ !cart?.canDelete }
      />
    </Modal>
  )
}