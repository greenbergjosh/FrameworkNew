# interface-builder

> Drag-and-drop forms and layouts with an extendable component architecture.

[![NPM](https://img.shields.io/npm/v/interface-builder.svg)](https://www.npmjs.com/package/interface-builder) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save interface-builder
```

## Usage

```tsx
import * as React from 'react'
import { 
    ComponentDefinition, 
    UserInterface, 
    antComponents, 
    registry 
} from 'interface-builder'
import config from "./example-config.json"

registry.register(antComponents)

const MyComponent: React.FC = () => {
  const [data, setData] = React.useState({})
  const [schema, setSchema] = React.useState<ComponentDefinition[]>([config])

  return (
        <UserInterface
            mode="display"
            components={schema}
            data={data}
            onChangeData={(newData) => {
                console.log("New Data", newData)
                setData(newData)
            }}
        />

  )
}
```

## License

ISC © [OnPoint Global](https://onpointglobal.com/)
