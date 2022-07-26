import { Layout, Menu, Typography } from 'antd'
import { ShoppingOutlined } from '@ant-design/icons'
import { Link, LocationProvider, Router, useLocation } from '@reach/router'
import { ShoppingCartProvider } from 'antd-shopping-cart'
import { ProductsPage } from './products-page'
import { CartPage } from './cart-page'
import 'antd/dist/antd.css'
import 'antd-shopping-cart/dist/bundle.css'

const { Title, Text } = Typography
const { Header, Content, Footer } = Layout

const App = () => {
  const location = useLocation()

  return (
    <ShoppingCartProvider
      buckets={[{
        id: "items",
        name: "Items",
        itemName: "item"
      }]}
      localStorageKey="example_carts"
      defaultCartName="My cart"
    >
      <Layout className="layout" style={{ minHeight: "100%" }}>
        <Header style={{ display: "flex", alignItems: "center", background: "#fff" }}>
          <Link to="/">
            <Title
              level={ 4 }
              style={{
                float: "left",
                color: "#1890ff",
                marginBottom: 0,
                marginRight: 8,
                display: "flex",
                alignItems: "center"
              }}
            >
              <ShoppingOutlined style={{ fontSize: 36, marginRight: 8 }} />
              E-Commerce Site
            </Title>
          </Link>
          <Menu theme="light" mode="horizontal" selectedKeys={ location.pathname } style={{ flex: 1 }}>
            <Menu.Item key="/">
              <Link to="/">Products</Link>
            </Menu.Item>
            <Menu.Item key="/cart">
              <Link to="/cart">Cart</Link>
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ background: "#f0f2f5", padding: 32 }}>
          <Router basepath="/">
            <ProductsPage path="/" />
            <CartPage path="/cart" />
          </Router>
        </Content>
      </Layout>
    </ShoppingCartProvider>
  )
}

export default () => (
  <LocationProvider>
    <App />
  </LocationProvider>
)
