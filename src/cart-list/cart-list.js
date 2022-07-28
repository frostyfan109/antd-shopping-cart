import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { List, Typography, Collapse, Space, Divider, InputNumber, Empty, Tabs, Select } from 'antd'
import { DeleteOutlined  } from '@ant-design/icons'
import QueueAnim from 'rc-queue-anim'
import Texty from 'rc-texty'
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

    showPrice=true,
    showQuantity=true,
    showMove=true,
    showDelete=true,
    
    small=true
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

    useEffect(() => console.log("mount", name), [])

    return (
        <div className="cart-item">
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
                        { (price || true ) && showPrice && (
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
                    <Space size="middle" className="cart-item-button-container" style={{ marginTop: 12 }}>
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
    bucketId: id,
    bucketName: name,
    bucketPrice: price,
    data,
    renderItem,
    small=true
}) => {
    const { currencySymbol } = useShoppingCart()

    const [_expanded, setExpanded] = useState(true)
    
    const asList = useMemo(() => !name, [name])
    const disabled = useMemo(() => data.length === 0, [data])
    const expanded = useMemo(() => _expanded && !disabled, [_expanded, disabled])

    useEffect(() => console.log("mount", name), [])

    const listChildren = small || true ? (
        <QueueAnim
            className="ant-list-items"
            component="ul"
            duration={ 300 }
            type={["right", "left"]}
            leaveReverse
        >
            { expanded || asList ? data.map((item) => renderItem(item) ) : null }
        </QueueAnim>
    ) : (
        expanded || asList ? data.map((item) => renderItem(item) ) : null
    )

    const list = (
        <List
            style={{ overflow: "hidden" }}
        >
            { listChildren }
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

export const CartList = ({
    small=true,
    cartItemProps={},
    renderItem=undefined,
    ...props
}) => {
    const { buckets, activeCart, getBucketTotal, removeFromCart, updateCartItem } = useShoppingCart()
    const singleBucket = useMemo(() => buckets.length === 1, [buckets])

    const { style: divStyle, ...divProps } = props

    const Bucket = ({ bucket }) => (
        <CartSection
            key={ bucket.id }
            cart={ activeCart.name }
            bucketId={ bucket.id }
            bucketName={ !singleBucket ? bucket.name : null }
            bucketPrice={ getBucketTotal(activeCart, bucket.id) }
            data={ activeCart.items.filter((item) => item.bucketId === bucket.id) }
            renderItem={(item) => (
                <List.Item key={ item.id }>
                    {
                        renderItem ? (
                            renderItem(item)
                        ) : (
                            <CartItem
                                { ...item }
                                { ...cartItemProps }
                                onRemove={ () => removeFromCart(activeCart, item.id) }
                                onQuantityChanged={ (quantity) => updateCartItem(activeCart.name, item.id, {
                                    quantity
                                }) }

                                small={ small }
                            />
                        )
                    }
                </List.Item>
            )}
            small={ small }
        />
    )

    const bucketList = (
        buckets.map((bucket, i) => small ? (
            <Fragment key={ `cart-bucket-${ activeCart.id }-${ bucket.id }` }>
                <Bucket bucket={ bucket } />
                { i !== buckets.length -1 && <Divider className="cart-section-divider" /> }
            </Fragment>
        ) : (
            <TabPane key={ bucket.id } tab={ bucket.name }>
                <Bucket bucket={ bucket } />
            </TabPane>
        ))
    )

    const body = small || singleBucket ? (
        bucketList
    ) : (
        <Tabs defaultActiveKey="a">
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