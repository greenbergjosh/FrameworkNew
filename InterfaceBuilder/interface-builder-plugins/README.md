# interface-builder

> Drag-and-drop forms and layouts with an extendable component architecture.

[![NPM](https://img.shields.io/npm/v/interface-builder.svg)](https://www.npmjs.com/package/interface-builder) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

### Requirements
- [node and npm](https://nodejs.org/en/)
- [yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable)

## Install
```bash
yarn @opg/interface-builder
```

## Usage
> IMPORTANT: DragDropContext must be positioned above all instances of UserInterface.

```tsx
import * as React from 'react'
import {
    ComponentDefinition,
    UserInterface,
    antComponents,
    registry,
    DragDropContext
} from '@opg/interface-builder'
import config from "./example-config.json"

registry.register(antComponents)

const MyComponent: React.FC = () => {
  const [data, setData] = React.useState({})
  const [schema, setSchema] = React.useState<ComponentDefinition[]>([config])

  return (
     <DragDropContext.HTML5>
        <UserInterface
            mode="display"
            components={schema}
            data={data}
            onChangeData={(newData) => {
                console.log("New Data", newData)
                setData(newData)
            }}
        />
     </DragDropContext.HTML5>
  )
}
```

## Demo
```bash
cd interface-builder/example
yarn && yarn start
```

## Contributing to the project

### Dev environment
> Run the file watcher in `interface-builder` to compile changes,
> then run the `example` demo to see changes.
```bash
cd interface-builder/
yarn && yarn start

cd interface-builder/example/
yarn && yarn start
```

### Publish
> This project publishes as `@opg/interface-builder` to an OnPoint private module registry:
> - http://ec2-35-170-186-135.compute-1.amazonaws.com:4000/
> - See the `.npmrc` file for registry connection details
> - Private registry is a Verdaccio site
> - To view the published artifacts, go to the website above. You will need the username `opguser` and password for Verdaccio.
```bash
# First bump the version number in package.json, then
yarn publish
```


## License

ISC © [OnPoint Global](https://onpointglobal.com/)
