import React from 'react'
import { Popconfirm, Space, Typography } from 'antd'

const { Text, Paragraph } = Typography

export const DeleteCartPopconfirm = ({ onConfirm, children, ...props }) => {
  return (
    <Popconfirm
      overlayClassName="no-icon-popconfirm"
      title={
        <Space direction="vertical">
          <Space>
            <Text style={{ fontWeight: 500, fontSize: 15 }}>Are you sure you want to delete this cart?</Text>
          </Space>
          <Paragraph>
            You won't be able to undo this action.
          </Paragraph>
        </Space>
      }
      icon={ null }
      onConfirm={ onConfirm }
      okText="Yes, delete it"
      cancelText="Cancel"
      { ...props }
    >
      { children }
    </Popconfirm>
  )
}