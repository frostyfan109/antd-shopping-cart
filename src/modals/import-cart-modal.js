import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Modal, Space, Form, Input, Typography, Alert, Collapse } from 'antd'
import { StarOutlined, StarFilled, UploadOutlined } from '@ant-design/icons'
import Dragger from 'antd/lib/upload/Dragger'
import { z } from 'zod'
import { parse as yamlParse } from 'yaml'

import './cart-modal.css'

const { Text, Paragraph } = Typography

/**
 * Zod validator to check that the cart uploaded by the user conforms to the
 * internal data structure
 */
const cartSchema = z.object({
  concept_id: z.string().array(),
  study_id: z.string().array(),
  variable_id: z.string().array(),
  cde_id: z.string().array()
})

export const ImportCartModalContent = ({
  createShoppingCart,
  cartName,
  setCartName,
  cartNameError,
  favorited,
  setFavorited
}) => {
  const inputRef = useRef()

  const StarIcon = favorited ? StarFilled : StarOutlined

  useEffect(() => {
    // Autofocus input
    inputRef.current.focus({
      cursor: 'end'
    })
  }, [])

  // Workaround for antd bug where Tooltip-based elements will close when interacting with a modal.
  // Only occurs when the modal is not a child of the active Tooltip-based component.
  useEffect(() => {
    // This component is a child of the modal, so the modal wrapper is guarenteed to exist on mount.
    const modalWrapper = document.querySelector('.cart-creation-modal-wrapper')
    const modalMask = modalWrapper.parentNode
    const modalRoot = modalMask.parentNode
    const modalDOMRoot = modalRoot.parentNode

    const stopPropagation = (e) => {
      e.stopPropagation()
    }
    modalDOMRoot.addEventListener('mousedown', stopPropagation)

    return () => {
      modalDOMRoot.removeEventListener('mousedown', stopPropagation)
    }
  }, [])

  const [fileList, setFileList] = useState([])
  const [error, setError] = useState({
    message: '',
    raw: null
  })

  const [fileContents, setFileContents] = useState({})
  useEffect(() => {
    ;(async () => {
      if (fileList.length === 0) return
      const [file] = fileList
      if (file.status !== 'done' || !file.originFileObj) return

      const fileText = await file.originFileObj.text()

      // all of the input file types need to become json anyway, so
      // store in this variable
      let translatedJson

      // this switch takes care of converting the various file formats into json
      switch (file.type) {
        case 'application/json': {
          try {
            translatedJson = JSON.parse(fileText)
          } catch (e) {
            setError({
              message: 'The file contains invalid JSON.',
              raw: e
            })
            return
          }
          setCartName(file.name.replace('.json', ''))
          break
        }

        case 'application/x-yaml': {
          try {
            translatedJson = yamlParse(fileText)
          } catch (e) {
            setError({
              message: 'The file contains invalid YAML.',
              raw: e
            })
            return
          }
          setCartName(file.name.replace('.yaml', ''))
          break
        }

        case 'text/csv': {
          try {
            const lines = fileText.split('\n')
            if (lines.length === 0) {
              throw new Error('CSV file is empty')
            }

            // create a new object with the columns titles as keys and
            // empty arrays (rows) to fill out
            const columns = lines.shift().split(',')
            translatedJson = columns.reduce(
              (acc, col) => ({
                ...acc,
                [col]: []
              }),
              {}
            )

            // fill out the rows
            for (const row of lines) {
              const rowCells = row.split(',')
              for (const [colIndex, cell] of Object.entries(rowCells)) {
                if (cell !== '') translatedJson[columns[colIndex]].push(cell)
              }
            }
          } catch (e) {
            setError({
              message: 'There was an error parsing the CSV file.',
              raw: e
            })
            return
          }
          setCartName(file.name.replace('.csv', ''))
          break
        }

        default: {
          setError({
            message: 'Uploaded an unsupported file type.',
            raw: null
          })
          return
        }
      }

      const validatedJson = cartSchema.safeParse(translatedJson)
      if (validatedJson.success) {
        const { data } = validatedJson
        setFileContents(data)
        setError({
          message: '',
          raw: null
        })
      } else {
        setError({
          message: 'The file selected is not compatible with DUG.',
          raw: validatedJson.error
        })
      }
    })()
  }, [fileList])

  return (
    <Space direction='vertical' size='middle' style={{ width: '100%' }}>
      <Paragraph>
        Import a Dug JSON file saved locally on your computer.
      </Paragraph>
      <Dragger
        name='imported-cart-file'
        accept='application/json, application/x-yaml, text/csv'
        fileList={fileList}
        onChange={({ file }) => {
          setFileList([file])
          setCartName(file.name.replace('.json', ''))
        }}
      >
        <UploadOutlined />
        <p className='ant-upload-text'>
          Click or drag file to this area to upload
        </p>
        <p className='ant-upload-hint'>
          Supported file types: <code>.json</code>, <code>.yaml</code>,{' '}
          <code>.csv</code>
        </p>
      </Dragger>
      {error.message && (
        <Alert
          className='import-modal-error-alert'
          message={error.message}
          description={
            <Collapse ghost className='import-modal-error-collapse'>
              <Collapse.Panel header='See error details'>
                <pre>{error.raw.toString()}</pre>
              </Collapse.Panel>
            </Collapse>
          }
          type='error'
          closable
        />
      )}
      <Space direction='vertical' style={{ width: '100%' }}>
        <Text style={{ fontWeight: 500 }}>Name</Text>
        <Form.Item
          validateStatus={cartNameError && 'error'}
          help={
            cartNameError ? 'Carts cannot have duplicate names.' : undefined
          }
          style={{ margin: 0 }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Input
              placeholder='Cart name...'
              value={cartName}
              onChange={(e) => setCartName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createShoppingCart()}
              ref={inputRef}
            />
            <StarIcon
              className='icon-btn'
              onClick={() => setFavorited(!favorited)}
              style={{
                fontSize: 16,
                marginLeft: 16,
                color: favorited ? '#1890ff' : undefined
              }}
            />
          </div>
        </Form.Item>
      </Space>
      <pre style={{ maxHeight: 500, overflowY: 'auto' }}>
        {JSON.stringify(fileContents, null, 2)}
      </pre>
    </Space>
  )
}

export const ImportCartModal = ({
  carts,
  visible,
  onVisibleChange,
  onConfirm
}) => {
  /** Form state */
  const [cartName, setCartName] = useState('')
  const [cartNameError, setCartNameError] = useState(false)
  const [favorited, setFavorited] = useState(false)

  useEffect(() => {
    setCartName('')
    setFavorited(false)
    if (visible) {
      const highestExistingDefault = carts
        .map((cart) => /Shopping Cart (?<num>\d+)/.exec(cart.name)?.groups.num)
        .filter((match) => match !== undefined)
        .sort((a, b) => b - a)[0]
      const defaultName = `Shopping Cart ${
        highestExistingDefault !== undefined
          ? parseInt(highestExistingDefault) + 1
          : 1
      }`
      setCartName(defaultName)
    }
  }, [visible])

  useEffect(() => setCartNameError(false), [cartName])

  const createShoppingCart = useCallback(() => {
    if (carts.find((cart) => cart.name === cartName)) {
      setCartNameError(true)
    } else {
      onConfirm(cartName, favorited)
    }
  }, [carts, cartName, onConfirm])

  return (
    <Modal
      title='Import a cart'
      okText='Import'
      cancelText='Cancel'
      destroyOnClose
      width={400}
      visible={visible}
      onVisibleChange={onVisibleChange}
      onOk={createShoppingCart}
      onCancel={() => onVisibleChange(false)}
      zIndex={1032}
      maskStyle={{ zIndex: 1031 }}
      wrapClassName='cart-creation-modal-wrapper'
    >
      <ImportCartModalContent
        cartName={cartName}
        setCartName={setCartName}
        cartNameError={cartNameError}
        favorited={favorited}
        setFavorited={setFavorited}
        createShoppingCart={createShoppingCart}
      />
    </Modal>
  )
}
