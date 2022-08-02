import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import {
    List, Typography, Collapse, Space,
    Divider, Empty, Tabs, Select, Checkbox,
    Button, Dropdown, Menu, Tooltip, Anchor
} from 'antd'
import { DeleteOutlined, FolderAddOutlined, CopyOutlined, CaretDownOutlined } from '@ant-design/icons'
import QueueAnim from 'rc-queue-anim'
import Texty from 'rc-texty'
import { SizeMe } from 'react-sizeme'
import classNames from 'classnames'
import { useShoppingCart, CartSelectDropdown, DeleteItemsPopconfirm } from '../'
import './cart-list.css'

const { Title, Text, Paragraph } = Typography
const { Panel } = Collapse
const { Link } = Anchor
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
        <CartSelectDropdown
            disableFavoriteButton
            disableNewCartEntry
            hideActiveCart={ true }
            cartIconRender={ () => <FolderAddOutlined /> }
            onSelect={ onMove }
            dropdownProps={{ placement: "bottomLeft", trigger: "click" }}
        >
            <a type="button">Move</a>
        </CartSelectDropdown>
    ), [onMove])

    return (
        <div className={ classNames("cart-item", checked && "cart-item-selected") } style={{ padding: small ? "2px 0" : "8px 0" }}>
            { checked !== null && (
                <Checkbox
                    checked={ checked }
                    onChange={ (e) => onChecked(!checked) }
                    className="cart-item-checkbox"
                    style={{ marginRight: 12 }}
                />
            ) }
            { imageUrl && (
                <SizeMe monitorHeight>
                    { ({ size: { height } }) => (
                        <div style={{ display: "flex", flexDirection: "column", marginRight: 12 }}>
                            <img src={ imageUrl } style={{ flexGrow: 1, objectFit: "contain", height }} />
                        </div>
                    ) }
                </SizeMe>
            ) }
            <div style={{ display: "flex", flexDirection: "column", width: 0, flex: 1 }}>
                <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
                    <Text 
                        className="cart-item-title"
                        style={{
                            flex: 1,
                            color: "#434343",
                            fontWeight: small ? 400 : 500,
                            fontSize: small ? 14 : 15
                        }} ellipsis
                    >
                        { name }
                    </Text>
                    <Text className="cart-item-secondary-title" type="secondary">
                        { nameSecondary }
                    </Text>
                </div>
                {description && (
                    <Paragraph className="cart-item-description" type="secondary" ellipsis style={{ marginTop: 4 }}>
                        { description }
                    </Paragraph>
                )}
                { !small && (
                    <Space size="middle" style={{ marginTop: 8 }}>
                        { price && showPrice && (
                            <Text className="cart-item-price" style={{ fontSize: 14 }}>
                                { currencySymbol }{ ( price * quantity).toFixed(2) }
                            </Text>
                        ) }
                        { showQuantity && (
                            <Select value={ quantity } onChange={ onQuantityChanged }>
                                {
                                    [1, 2, 3, 4].map((i) => (
                                        <Option key={ i } value={ i }>{ i }</Option>
                                    ))
                                }
                            </Select>
                        ) }
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
                    <Text className="cart-item-price" style={{ marginLeft: 12, fontSize: 13 }}>{ currencySymbol }{ price.toFixed(2) }</Text>
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
    const { currencySymbol, activeCart, buckets, getBucketTotal, updateCartItem, removeFromCart, moveCartItems } = useShoppingCart()
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

                                    onMove={ (cart) => moveCartItems(activeCart, cart, [ item.id ], notify=true) }
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
    setSelectedItems,

    onCheckout=() => {}
}) => {
    const { buckets, carts, activeCart, setActiveCart, moveCartItems, copyCartItems } = useShoppingCart()
    const [selectDropdownVisible, setSelectDropdownVisible] = useState(false)

    const selected = selectedItems.length > 0
    const allSelected = selectedItems.length === activeCart.items.length
    const indeterminateSelection = selected && !allSelected
    const deselectAll = () => setSelectedItems([])
    const selectAll = () => setSelectedItems(activeCart.items)

    const checkoutText = useMemo(() => renderCheckoutText(selectedItems.length), [selectedItems.length, renderCheckoutText])

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
                                className="selected-item-checkbox indeterminate-minus-checkbox"
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
                                                        className="indeterminate-minus-checkbox"
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
                    <CartSelectDropdown
                        disableFavoriteButton
                        disableNewCartEntry
                        hideActiveCart={ true }
                        cartIconRender={ () => <FolderAddOutlined /> }
                        onSelect={ (cart) => {
                            moveCartItems(activeCart, cart, selectedItems, notify=true)
                        } }
                        dropdownProps={{ placement: "topRight", trigger: "click" }}
                    >
                        <Tooltip title="Move" align={{ offset: [0, 4] }}>
                            <Button
                                type="text"
                                size="large"
                                icon={ <FolderAddOutlined /> }
                            />
                        </Tooltip>
                    </CartSelectDropdown>
                ) }
                { selected && showCopy && (
                    <CartSelectDropdown
                        disableFavoriteButton
                        disableNewCartEntry
                        hideActiveCart={ true }
                        cartIconRender={ () => <CopyOutlined /> }
                        onSelect={ (cart) => {
                            const uncopyableItems = copyCartItems(activeCart, cart, selectedItems, notify=true)
                            // setSelectedItems(uncopyableItems)
                        } }
                        dropdownProps={{ placement: "topRight", trigger: "click" }}
                    >
                        <Tooltip title="Copy" align={{ offset: [0, 4] }}>
                            <Button
                                type="text"
                                size="large"
                                // This icon is somewhat larger than others in the menu
                                icon={ <CopyOutlined style={{ fontSize: 16 }} /> }
                            />
                        </Tooltip>
                    </CartSelectDropdown>
                ) }
                { selected && showDelete && (
                    <DeleteItemsPopconfirm items={ selectedItems }>
                        <Tooltip title="Remove" align={{ offset: [0, 4] }}>
                            <Button
                                type="text"
                                size="large"
                                icon={ <DeleteOutlined /> }
                            />
                        </Tooltip>
                    </DeleteItemsPopconfirm>
                ) }
            </Space>
            { checkoutText && (
                <Button type="primary" disabled={ !selected && activeCart.items.length === 0 } onClick={ () => onCheckout(selectedItems) }>
                    { checkoutText }
                </Button>
            ) }
        </div>
    )
}

export const CartList = ({
    small=false,
    checkableItems=false,
    showExtra=true,
    extraProps={},
    cartItemProps={},
    renderItem=undefined,

    onCheckout=(selectedItems) => {},
    ...props
}) => {
    const { buckets, activeCart, getBucketTotal, removeFromCart, updateCartItem } = useShoppingCart()
    const [checkedItems, setCheckedItems] = useState([])
    const [activeBucket, setActiveBucket] = useState()

    const singleBucket = useMemo(() => buckets.length === 1, [buckets])


    const { style: divStyle, ...divProps } = props

    useEffect(() => {
        const itemIds = activeCart.items.map((item) => item.id)
        const removedCheckedItems = checkedItems.filter((item) => !itemIds.includes(item))
        if (removedCheckedItems.length > 0) setCheckedItems(checkedItems.filter((item) => !removedCheckedItems.includes(item)))
    }, [checkedItems, activeCart.items])

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
            return small || singleBucket ? (
                <Fragment key={ `cart-bucket-${ activeCart.id }-${ bucket.id }` }>
                    { bucketComponent }
                    { i !== buckets.length -1 && <Divider className="cart-section-divider" /> }
                </Fragment>
            ) : (   
                <Fragment key={ `cart-bucket-${ activeCart.id}-${ bucket.id} ` }>
                    {/* <Divider className="cart-section-divider" style={{ margin: "8px 0" }} plain>{ bucket.name }</Divider> */}
                    <Title
                        className="cart-section-header"
                        id={ `cart-section-header-${ bucket.id }` }
                        level={ 5 }
                        style={{
                            fontSize: 12,
                            letterSpacing: 0.5,
                            color: "#434343",
                            textTransform: "uppercase",
                            paddingTop: 16,
                            marginBottom: 8
                        }}
                    >
                        { bucket.name }
                    </Title>
                    { bucketComponent }
                    { i !== buckets.length - 1 && <Divider className="cart-section-divider" style={{ margin: "8px 0" }} /> }
                </Fragment>
            )
        })
    )

    const body = small ? (
        bucketList
    ) : singleBucket ? (
        <div className="section-tab-content">
            { bucketList }
        </div>
    ) : activeCart.items.length > 0 ? (
        <Fragment>
            <Tabs
                activeKey={ activeBucket }
                onChange={ (bucketId) => {
                    document.querySelector(`#cart-section-header-${ bucketId }`).scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    })
                } }
            >
                { buckets.map((bucket) => (
                    <TabPane key={ bucket.id } tab={
                        <span>
                            { bucket.name }
                        </span>
                    } />
                )) }
            </Tabs>
            <div className="section-tab-content">
                { bucketList }
            </div>
            <Anchor
                getContainer={ () => document.querySelector(".section-tab-content") }
                onChange={ (id) => {
                    const bucketId = id.replace("#cart-section-header-", "")
                    setActiveBucket(bucketId)
                } }
                // Only used for functionality, not for display component.
                style={{ display: "none" }}
            >
                { buckets.map((bucket) => (
                    <Link key={ bucket.id } href={ `#cart-section-header-${ bucket.id }` } title={ bucket.name } />
                ))}
            </Anchor>
        </Fragment>
    ) : null

    return (
        <div className="shopping-cart-list" style={{ marginTop: singleBucket ? "12px" : undefined, ...divStyle }} {...divProps}>
            { activeCart.items.length === 0 && (singleBucket || !small) && (
                <Empty
                    image={ Empty.PRESENTED_IMAGE_SIMPLE }
                    description="No items added"
                    style={{ margin: "24px 0", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
                />
            ) }
            {
                body
            }
            { !small && showExtra && (
                <div className="cart-list-extra">
                    <CartListExtra
                        activeBucket={ buckets.find((bucket) => bucket.id === activeBucket) }
                        selectedItems={ checkedItems.map((id) => activeCart.items.find((item) => item.id === id)) }
                        setSelectedItems={ (items) => setCheckedItems(items.map((item) => item.id)) }

                        onCheckout={ onCheckout }

                        { ...extraProps }
                    />
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