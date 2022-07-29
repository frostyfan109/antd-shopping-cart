import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import {
    List, Typography, Collapse, Space,
    Divider, Empty, Tabs, Select, Checkbox,
    Button, Dropdown, Menu, Tooltip
} from 'antd'
import { DeleteOutlined, FolderAddOutlined, CopyOutlined, CaretDownOutlined } from '@ant-design/icons'
import QueueAnim from 'rc-queue-anim'
import Texty from 'rc-texty'
import classNames from 'classnames'
import { useShoppingCart } from '../'
import './cart-list.css'

const { Text, Paragraph } = Typography
const { Panel } = Collapse
const { TabPane } = Tabs

const RemoveItemButton = ({ style={}, onClick, ...props }) => (
    <DeleteOutlined
        className="icon-btn"
        style={{ fontSize: 14, marginLeft: 8, ...style }}
        onClick={ onClick }
         {...props }
    />
)

const CartItem = ({
    name,
    nameSecondary,
    description,
    price,
    quantity,
    productUrl,
    imageUrl,

    onRemove,
    onMove,
    onQuantityChanged,
    onChecked,

    showPrice=true,
    showQuantity=true,
    showMove=true,
    showDelete=true,
    
    small=true,
    checked=null,
}) => {
    const { currencySymbol } = useShoppingCart()
    
    const removeButton = useMemo(() => ( small ? (
        <RemoveItemButton onClick={ onRemove } />
    ) : (
        <a type="button" onClick={ onRemove }>Remove</a>
    )), [small, onRemove])

    const moveButton = useMemo(() => (
        <a type="button" onClick={ onMove }>Move</a>
    ), [onMove])

    return (
        <div className="cart-item">
            { checked !== null && (
                <Checkbox
                    checked={ checked }
                    onChange={ (e) => onChecked(!checked) }
                    className="cart-item-checkbox"
                    style={{ marginRight: 12 }}
                />
            ) }
            { imageUrl && <img style={{ marginRight: 12 }} width={ 64 } height={ 64 } src={ imageUrl } /> }
            <div style={{ display: "flex", flexDirection: "column", width: 0, flex: 1 }}>
                <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
                    <Text style={{  flex: 1, color: "#434343", fontWeight: small ? 400 : 500, fontSIze: small ? 14 : 15 }} ellipsis>
                        { name }
                    </Text>
                    <Text type="secondary">
                        { nameSecondary }
                    </Text>
                </div>
                {description && (
                    <Paragraph className="cart-item-description" type="secondary" ellipsis style={{ marginTop: 4 }}>
                        { description }
                    </Paragraph>
                )}
                { !small && showQuantity && (
                    <Space size="middle" style={{ marginTop: 8 }}>
                        { price && showPrice && (
                            <Text style={{ fontSize: 14 }}>{ currencySymbol }{ (23.53 * quantity).toFixed(2) }</Text>
                        ) }
                        <Select value={ quantity } onChange={ onQuantityChanged }>
                            {
                                [1, 2, 3, 4].map((i) => (
                                    <Option key={ i } value={ i }>{ i }</Option>
                                ))
                            }
                        </Select>
                    </Space>
                )}
                { !small && (
                    <Space size="middle" className="cart-item-button-container" style={{ marginTop: 8 }}>
                        { showMove && moveButton }
                        { showDelete && removeButton }
                    </Space>
                ) }
            </div>
            <div style={{ flex: 0, display: "flex", alignItems: "center", marginLeft: 8 }}>
                { small && showDelete && removeButton }
                { small && price && showPrice && (
                    <Text style={{ marginLeft: 12, fontSize: 13 }}>{ currencySymbol }{ price.toFixed(2) }</Text>
                ) }
            </div>
        </div>
    )
}

const CartSection = ({
    cart,
    bucket,
    renderItem,
    small=true,
    
    checkableItems=false,
    checkedItems=[],
    onChecked=(item, checked) => {},

    cartItemProps={}
}) => {
    const { currencySymbol, buckets, getBucketTotal, updateCartItem, removeFromCart } = useShoppingCart()
    const [_expanded, setExpanded] = useState(true)
    
    const { id } = bucket
    const singleBucket = useMemo(() => buckets.length === 1, [buckets])
    const name = useMemo(() => !singleBucket ? bucket.name : null, [singleBucket, bucket])
    const price = useMemo(() => getBucketTotal(cart.name, id), [cart, id])

    const data = useMemo(() => cart.items.filter((item) => item.bucketId === id), [cart, id])
    
    const asList = useMemo(() => !name, [name])
    const disabled = useMemo(() => data.length === 0, [data])
    const expanded = useMemo(() => _expanded && !disabled, [_expanded, disabled])

    const list = (
        <List
            className={ classNames("cart-section-list", checkedItems.length > 0 && "show-checkboxes") }
            style={{ overflow: "hidden" }}
        >
            <QueueAnim
                className="ant-list-items"
                component="ul"
                duration={ 300 }
                type={["right", "left"]}
                leaveReverse
            >
                { expanded || asList ? data.map((item) => (
                    <List.Item key={ item.id }>
                        {
                            renderItem ? (
                                renderItem(item)
                            ) : (
                                <CartItem
                                    { ...item }
                                    { ...cartItemProps }

                                    checked={ checkableItems ? checkedItems.includes(item.id) : null }
                                    small={ small }

                                    onRemove={ () => removeFromCart(cart, item.id) }
                                    onQuantityChanged={ (quantity) => updateCartItem(cart.name, item.id, {
                                        quantity
                                    }) }
                                    onChecked={ (checked) => onChecked(item, checked) }

                                />
                            )
                        }
                    </List.Item>
                )) : null }
            </QueueAnim>
        </List>
    )

    const collapseHeader = useMemo(() => (
        <Collapse ghost activeKey={expanded ? [name] : []} onChange={ () => setExpanded(!expanded) }>
            <Panel
                key={name}
                collapsible={ disabled ? "disabled" : undefined }
                header={
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        userSelect: "none",
                        overflow: "hidden"
                    }}>
                        <Text style={{ fontWeight: 400 }} disabled={ disabled }>
                            {name} ({data.length})
                        </Text>
                        { !expanded && price.subtotal !== null && (
                            <Texty type="left" mode="" duration={ 300 } component="span">
                                {/* If not done like this, children is passed as an array of strings which breaks texty's string split. */}
                                { `${ currencySymbol }${ price.subtotal.toFixed(2) }` }
                            </Texty>
                        )}
                    </div>
                }
            />
        </Collapse>
    ), [expanded, disabled, name, data, price, currencySymbol ])

    useEffect(() => {
        setExpanded(true)
    }, [cart])


    if (asList) return list
    return (
        <Fragment>
            { small && collapseHeader }
            { list }
        </Fragment>
    )
}

export const CartListExtra = ({
    showSelect=true,
    showDelete=true,
    showMove=true,
    showCopy=true,
    renderCheckoutText=(selectedCount) => (
        selectedCount > 0 ? `Checkout with ${ selectedCount } selected item${ selectedCount !== 1 ? "s" : "" }` : "Checkout"
    ),
    
    activeBucket,
    selectedItems,
    setSelectedItems
}) => {
    const { buckets, carts, activeCart, setActiveCart } = useShoppingCart()
    const [selectDropdownVisible, setSelectDropdownVisible] = useState(false)

    const selected = selectedItems.length > 0
    const allSelected = selectedItems.length === activeCart.items.length
    const indeterminateSelection = selected && !allSelected
    const deselectAll = () => setSelectedItems([])
    const selectAll = () => setSelectedItems(activeCart.items)

    const checkoutText = useMemo(() => renderCheckoutText(selectedItems.length), [renderCheckoutText])

    return (
        <div style={{ display: "flex", alignItems: "center" }}>
            <Space size="small" className="selected-buttons" style={{ flex: 1 }}>
                { showSelect && (
                    <Button.Group style={{ marginRight: 4 }}>
                        <Button
                            className="selected-item-checkbox-button"
                            type="text"
                            size="large"
                            style={{ padding: "0 4px" }}
                            onClick={ () => {
                                if (selected) deselectAll()
                                else selectAll()
                            } }
                        >
                            <Checkbox
                                className="selected-item-checkbox"
                                indeterminate={ indeterminateSelection }
                                checked={ allSelected }
                            />
                        </Button>
                        <Dropdown
                            placement="topRight"
                            trigger="click"
                            visible={ selectDropdownVisible }
                            onVisibleChange={ setSelectDropdownVisible }
                            overlay={ (
                            <Menu
                                onClick={ (e) => e.domEvent.nativeEvent.stopImmediatePropagation() }
                                items={[
                                    // {
                                    //     label: "All",
                                    //     key: 1,
                                    //     onClick: selectAll
                                    // },
                                    // {
                                    //     label:  "None",
                                    //     key: 2,
                                    //     onClick: deselectAll
                                    // },
                                    ...buckets.map((bucket) => {
                                        const bucketItems = activeCart.items.filter((item) => item.bucketId === bucket.id)
                                        const bucketSelectedItems = bucketItems.filter((item) => selectedItems.includes(item) )
                                        const bucketSelected = bucketSelectedItems.length > 0
                                        const allBucketSelected = bucketItems.length === bucketSelectedItems.length
                                        const indeterminateBucketSelection = bucketSelected && !allBucketSelected

                                        const selectedOutsideBucket = selectedItems.filter((item) => !bucketItems.includes(item))
                                        
                                        const deselectBucketAll = () => setSelectedItems(
                                            selectedOutsideBucket
                                        )
                                        const selectBucketAll = () => setSelectedItems([
                                            ...selectedOutsideBucket,
                                            ...bucketItems
                                        ])

                                        return {
                                            label: (
                                                <Fragment>
                                                    <Checkbox
                                                        indeterminate={ indeterminateBucketSelection  }
                                                        checked={ allBucketSelected }
                                                    />
                                                    <Text style={{ marginLeft: 12 }}>{ bucket.name }</Text>
                                                </Fragment>
                                            ),
                                            key: bucket.id,
                                            onClick: () => {
                                                if (bucketSelected) deselectBucketAll()
                                                else selectBucketAll()
                                            }
                                        }
                                    })
                                ]}
                            />
                            ) }
                        >
                            <Button type="text" size="large" style={{ padding: "0 2px" }}>
                            <CaretDownOutlined style={{ fontSize: 10, paddingBottom: 2 }} />
                            </Button>
                        </Dropdown>
                    </Button.Group>
                ) }
                { selected && showMove && (
                    <Tooltip title="Move" align={{ offset: [0, 4] }}>
                        <Button
                            type="text"
                            size="large"
                            icon={ <FolderAddOutlined /> }
                            onClick={ () => null }
                        />
                    </Tooltip>
                ) }
                { selected && showCopy && (
                    <Tooltip title="Copy" align={{ offset: [0, 4] }}>
                        <Button
                            type="text"
                            size="large"
                            // This icon is somewhat larger than others in the menu
                            icon={ <CopyOutlined style={{ fontSize: 16 }} /> }
                            onClick={ () => null }
                        />
                    </Tooltip>
                ) }
                { selected && showDelete && (
                    <Tooltip title="Remove" align={{ offset: [0, 4] }}>
                        <Button
                            type="text"
                            size="large"
                            icon={ <DeleteOutlined /> }
                            onClick={ () => null }
                        />
                    </Tooltip>
                ) }
            </Space>
            { checkoutText && (
                <Button type="primary">
                    { checkoutText }
                </Button>
            ) }
        </div>
    )
}

export const CartList = ({
    small=true,
    checkableItems=false,
    renderExtra=(props) => <CartListExtra { ...props } />,
    cartItemProps={},
    renderItem=undefined,
    ...props
}) => {
    const { buckets, activeCart, getBucketTotal, removeFromCart, updateCartItem } = useShoppingCart()
    const [checkedItems, setCheckedItems] = useState([])
    const [activeBucket, setActiveBucket] = useState()

    const singleBucket = useMemo(() => buckets.length === 1, [buckets])


    const { style: divStyle, ...divProps } = props

    useEffect(() => {
        setCheckedItems([])
    }, [activeCart.name])

    const bucketList = (
        buckets.map((bucket, i) => {
            const bucketComponent = (
                <CartSection
                    key={ bucket.id }
                    cart={ activeCart }
                    bucket={ bucket }
                    renderItem={ renderItem }
                    checkableItems={ checkableItems }
                    checkedItems={ checkedItems }
                    onChecked={ (item, checked) => checked ? (
                        setCheckedItems([ ...checkedItems, item.id ])
                    ) : (
                        setCheckedItems(checkedItems.filter((id) => id !== item.id ))
                    ) }
                    small={ small }

                    cartItemProps={ cartItemProps }
                />
            )
            return small ? (
                <Fragment key={ `cart-bucket-${ activeCart.id }-${ bucket.id }` }>
                    { bucketComponent }
                    { i !== buckets.length -1 && <Divider className="cart-section-divider" /> }
                </Fragment>
            ) : (
                <TabPane key={ bucket.id } tab={
                    <span>
                        { bucket.name }
                    </span>
                }>
                    { bucketComponent }
                </TabPane>
            )
        })
    )

    const body = small || singleBucket ? (
        bucketList
    ) : (
        <Tabs activeKey={  activeBucket } onChange={ (bucketId) => setActiveBucket(bucketId) }>
            { bucketList }
        </Tabs>
    )

    return (
        <div className="shopping-cart-list" style={{ marginTop: singleBucket ? "12px" : undefined, ...divStyle }} {...divProps}>
            { singleBucket && activeCart.items.length === 0 && (
                <Empty
                    image={ Empty.PRESENTED_IMAGE_SIMPLE }
                    description="No items added"
                    style={{ margin: "24px 0" }}
                />
            ) }
            {
                body
            }
            { !small && renderExtra && (
                <div className="cart-list-extra">
                    {
                        renderExtra({
                            activeBucket: buckets.find((bucket) => bucket.id === activeBucket),
                            selectedItems: checkedItems.map((id) => activeCart.items.find((item) => item.id === id)),
                            setSelectedItems: (items) => setCheckedItems(items.map((item) => item.id))
                        })
                    }
                </div>
            ) }
            {/* <CartSection
                name="Concepts"
                data={ concepts }
                renderItem={(concept) => (
                    <List.Item key={ concept.id }>
                        <CartItem
                            name={ `${ concept.name } (${ concept.type })` }
                            description={ concept.description }
                            onRemove={ () => removeConceptFromCart(activeCart, concept) }
                        />
                    </List.Item>
                )}
            />
            <Divider className="cart-section-divider" />
            <CartSection
                name="Studies"
                data={ studies }
                renderItem={(study) => (
                    <List.Item key={ study.c_id  }>
                        <CartItem
                            key={ study.c_id }
                            name={ study.c_name }
                            nameSecondary={ `(${ study.elements.length } variable${study.elements.length !== 1 && "s"})` }
                            onRemove={ () => removeStudyFromCart(activeCart, study) }
                        />
                    </List.Item>
                )}
            />
            <Divider className="cart-section-divider" />
            <CartSection
                name="Variables"
                data={ variables }
                renderItem={(variable) => (
                    <List.Item key={ variable.id }>
                        <CartItem
                            name={ variable.name }
                            description={ variable.description }
                            onRemove={ () => removeVariableFromCart(activeCart, variable) }
                        />
                    </List.Item>
                )}
            /> */}
            {/* <Divider style={{ margin: "2px 0" }} /> */}
        </div>
    )
}