import { List, Card, Typography, Button } from 'antd'
import { AddToCartDropdownButton } from 'antd-shopping-cart'

const { Title, Text } = Typography

const products = [
    {
        id: "aaa",
        name: "Parrot",
        description: "Parrots are intelligent birds. They have relatively large brains, they can learn, and they can use simple tools.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Red-browed_Amazon_parrot.jpg/1600px-Red-browed_Amazon_parrot.jpg?20071010185212",
        price: 250
    },
    {
        id: "bbb",
        name: "Gerbil",
        description: "A gentle and hardy animal, the Mongolian gerbil has become a popular small house pet.",
        image: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Meriones_unguiculatus_%28wild%29.jpg",
        price: 30
    },
]

export const ProductsPage = () => {
    return (
        <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
            dataSource={ products }
            renderItem={ (item) => (
                <List.Item key={ item.id }>
                    <Card
                        hoverable
                        cover={ <img src={ item.image } /> }
                        style={{ textAlign: "center" }}
                        actions={[
                            <div style={{ padding: "0 16px" }}>
                                <AddToCartDropdownButton
                                    item={{
                                        id: item.name,
                                        name: item.name,
                                        description: item.description,
                                        price: item.price,
                                        tax: item.price * .075,
                                        
                                        from: null,
                                        bucketId: "items",
                                        item: item,
                                    }}
                                    buttonProps={{ style: { width: "100%", minWidth: undefined } }}
                                />
                            </div>
                        ]}
                    >
                        <Title level={ 5 } style={{ fontWeight: 500, marginBottom: 16 }}>{ item.name }</Title>
                        <Text style={{ display: "block", fontSize: 15, marginBottom: 16 }}>${ item.price }</Text>
                        <Text type="secondary">{ item.description }</Text>
                        {/* <Card.Meta title={ item.name } description={ item.description }  /> */}
                    </Card>
                </List.Item>
            ) }
        />
    )
}