import React from 'react'
import { Dropdown } from 'antd'
import { CartSelectDropdownMenu } from './'

export const CartSelectDropdown = ({
  dropdownProps={},
  children,
  ...dropdownMenuProps
}) => {
  return (
    <Dropdown
      arrow={true}
      placement="bottomRight"
      trigger="hover"
      overlay={
        <CartSelectDropdownMenu { ...dropdownMenuProps } />
      }
      { ...dropdownProps }
    >
      { children }
    </Dropdown>
  )
}