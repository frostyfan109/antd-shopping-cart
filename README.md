# antd-shopping-cart
antd-shopping-cart is a collection of React UI components for constructing shopping cart UI's in antd projects.

[![NPM](https://img.shields.io/npm/v/antd-shopping-cart.svg)](https://www.npmjs.com/package/antd-shopping-cart) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save antd-shopping-cart
```

## Basic overview
This package provides the following components:

**Add to cart**

- AddToCartIconButton
- AddToCartButton
- AddToCartDropdownButton

**Cart popover**
- CartPopover
- CartPopoverButton

**Cart selection**
- CartSelectDropdown

**Cart creation**
- CartCreateModal

**Context**<br />
The components are all based on ShoppingCartContext, which implements `IShoppingCartContext`.

This package natively provides a local storage-based implementation of the context provider, but you can implement the provider yourself if more control over data flow is necessary. The context is currently strictly synchronous, though asynchronous support will be added in the future. 

## Demo
[Check out a small demo here](https://frostyfan109.github.io/antd-shopping-cart/) to see the components in action.

## Documentation
TODO

## License

MIT © [frostyfan109](https://github.com/frostyfan109)
