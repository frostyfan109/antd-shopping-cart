import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { List, Typography, Collapse, Space, Divider, InputNumber, Empty } from 'antd'
import { DeleteOutlined  } from '@ant-design/icons'
import QueueAnim from 'rc-queue-anim'
import Texty from 'rc-texty'
import { useShoppingCart } from '../'
import './cart-list.css'

const { Text, Paragraph } = Typography
const { Panel } = Collapse

const CartSection = ({
    cart,
    name,
    price,
    data,
    renderItem
}) => {
    const [_expanded, setExpanded] = useState(true)
    
    const asList = useMemo(() => !name, [name])
    const disabled = useMemo(() => data.length === 0, [data])
    const expanded = useMemo(() => _expanded && !disabled, [_expanded, disabled])

    const list = useMemo(() => (
        <List
            style={{ overflow: "hidden" }}
        >
            <QueueAnim
                className="ant-list-items"
                component="ul"
                duration={ 300 }
                type={["right", "left"]}
                leaveReverse
            >
                { expanded || asList ? data.map((item) => renderItem(item) ) : null }
            </QueueAnim>
        </List>
    ), [expanded, asList, data, renderItem])

    useEffect(() => {
        setExpanded(true)
    }, [cart])


    if (asList) return list
    return (
        <Fragment>
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
                            <Text style={{ fontWeight: 500 }} disabled={ disabled }>
                                {name} ({data.length})
                            </Text>
                            { !expanded && price.subtotal !== null && (
                                <Texty type="left" mode="" duration={ 300 } component="span">
                                    {/* If not done like this, children is passed as an array of strings which breaks texty's string split. */}
                                    { `$${ price.subtotal.toFixed(2) }` }
                                </Texty>
                            )}
                            {/* {!disabled && (
                                <a type="button">Empty</a>
                            )} */}
                        </div>
                    }
                />
            </Collapse>
            { list }
        </Fragment>
    )
}

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
    productUrl,
    imageUrl,
    onRemove
}) => (
    <div className="cart-item">
        { imageUrl && <img style={{ marginRight: 12 }} width={ 64 } height={ 64 } src={ imageUrl } /> }
        <div style={{ display: "flex", flexDirection: "column", width: 0, flex: 1 }}>
            <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
                <Text style={{  flex: 1, color: "#434343" }} ellipsis>
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
        </div>
        <div style={{ flex: 0, display: "flex", alignItems: "center", marginLeft: 8 }}>
            <RemoveItemButton onClick={ onRemove } />
            { price && (
                <Text style={{ marginLeft: 12, fontSize: 13 }}>${ price.toFixed(2) }</Text>
            ) }
        </div>
    </div>
)

export const CartList = ({
    renderItem=undefined
}) => {
    const { buckets, activeCart, getBucketTotal, removeFromCart } = useShoppingCart()
    const singleBucket = useMemo(() => buckets.length === 1, [buckets])

    const bucketList = useMemo(() => (
        buckets.map((bucket, i) => (
            <Fragment key={ `cart-bucket-${ activeCart.id }-${ bucket.id }` }>
            <CartSection
                cart={ activeCart.name }
                name={ !singleBucket ? bucket.name : null }
                price={ getBucketTotal(activeCart, bucket.id) }
                data={ activeCart.items.filter((item) => item.bucketId === bucket.id) }
                renderItem={(item) => (
                    <List.Item key={ item.id }>
                        {
                            renderItem ? (
                                renderItem(item)
                            ) : (
                                <CartItem
                                    name={ item.name }
                                    nameSecondary={ item.nameSecondary }
                                    description={ item.description }
                                    price={ item.price }
                                    productUrl={ item.productUrl }
                                    imageUrl={ item.imageUrl }
                                    onRemove={ () => removeFromCart(activeCart, item.id, bucket.id) }
                                />
                            )
                        }
                    </List.Item>
                )}

            />
            { i !== buckets.length -1 && <Divider className="cart-section-divider" /> }
            </Fragment>
        ))
    ), [buckets, activeCart, singleBucket, getBucketTotal, removeFromCart, renderItem ])

    return (
        <div className="shopping-cart-list" style={{ marginTop: singleBucket ? "12px" : undefined }}>
            { singleBucket && activeCart.items.length === 0 && (
                <Empty
                    image={ Empty.PRESENTED_IMAGE_SIMPLE }
                    description="No items added"
                    style={{ margin: "24px 0" }}
                />
            ) }
            {
                bucketList
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