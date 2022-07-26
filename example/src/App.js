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

const basePath = process.env.NODE_ENV === "production" ? "/antd-shopping-cart/" : "/"

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
          <Link to={ basePath }>
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
            <Menu.Item key={ basePath }>
              <Link to={ basePath }>Products</Link>
            </Menu.Item>
            <Menu.Item key={ `${ basePath }cart` }>
              <Link to={ `${ basePath }cart` }>Cart</Link>
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ background: "#f0f2f5", padding: 32 }}>
          <Router>
            <ProductsPage path={ `${ basePath }` } />
            <CartPage path={ `${ basePath }cart` } />
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
