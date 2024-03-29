import { Card, Layout, PageHeader } from "antd"
import React from "react"
import { Helmet } from "react-helmet"

export const QuickStartView: React.FC = (): JSX.Element => {
  return (
    <Layout.Content>
      <Card>
        <Helmet>
          <title>Quick Start | InterfaceBuilder.js</title>
        </Helmet>
        <PageHeader title="InterfaceBuilder.js Quick Start" subTitle="" />

        <blockquote>
          <p className="has-line-data" data-line-start={2} data-line-end={3}>
            Drag-and-drop forms and layouts with an extendable component architecture.
          </p>
        </blockquote>
        <p className="has-line-data" data-line-start={4} data-line-end={5}>
          <a href="https://www.npmjs.com/package/interface-builder">
            <img src="https://img.shields.io/npm/v/interface-builder.svg" alt="NPM" />
          </a>{" "}
          <a href="https://standardjs.com">
            <img
              src="https://img.shields.io/badge/code_style-standard-brightgreen.svg"
              alt="JavaScript Style Guide"
            />
          </a>
        </p>
        <h3 className="code-line" data-line-start={6} data-line-end={7}>
          Requirements
        </h3>
        <ul>
          <li className="has-line-data" data-line-start={7} data-line-end={8}>
            <a href="https://nodejs.org/en/">node and npm</a>
          </li>
          <li className="has-line-data" data-line-start={8} data-line-end={10}>
            <a href="https://classic.yarnpkg.com/en/docs/install/#mac-stable">yarn</a>
          </li>
        </ul>
        <h2 className="code-line" data-line-start={10} data-line-end={11}>
          Install
        </h2>
        <pre>
          <code className="has-line-data" data-line-start={12} data-line-end={14}>
            yarn @opg/interface-builder{"\n"}
          </code>
        </pre>
        <h2 className="code-line" data-line-start={15} data-line-end={16}>
          Usage
        </h2>
        <blockquote>
          <p className="has-line-data" data-line-start={16} data-line-end={17}>
            IMPORTANT: DragDropContext must be positioned above all instances of UserInterface.
          </p>
        </blockquote>
        <pre>
          <code className="has-line-data" data-line-start={19} data-line-end={50}>
            import &123; ComponentDefinition, UserInterface, antComponents, registry,
            DragDropContext &124; from &apos;@opg/interface-builder&apos; import config from
            &quot;./example-config.json&quot; registry.register(antComponents) const MyComponent:
            React.FC = () =&gt; &123; const [data, setData] = React.useState(&123;&124;) const
            [schema, setSchema] = React.useState&lt;ComponentDefinition[]&gt;([config]) return (
            &lt;DragDropContext.HTML5&gt; &lt;UserInterface mode=&quot;display&quot;
            components=&123;schema&124; data=&123;data&124; onChangeData=&123;(newData) =&gt; &123;
            console.log(&quot;New Data&quot;, newData) setData(newData) &124;&124; /&gt;
            &lt;/DragDropContext.HTML5&gt; ) &124;
          </code>
        </pre>
        <h2 className="code-line" data-line-start={51} data-line-end={52}>
          Demo
        </h2>
        <pre>
          <code className="has-line-data" data-line-start={53} data-line-end={56}>
            <span className="hljs-built_in">cd</span> interface-builder/example{"\n"}yarn &amp;&amp;
            yarn start{"\n"}
          </code>
        </pre>
        <h2 className="code-line" data-line-start={57} data-line-end={58}>
          Contributing to the project
        </h2>
        <h3 className="code-line" data-line-start={59} data-line-end={60}>
          Dev environment
        </h3>
        <blockquote>
          <p className="has-line-data" data-line-start={60} data-line-end={62}>
            Run the file watcher in <code>interface-builder</code> to compile changes,
            <br />
            then run the <code>example</code> demo to see changes.
          </p>
        </blockquote>
        <pre>
          <code className="has-line-data" data-line-start={63} data-line-end={69}>
            <span className="hljs-built_in">cd</span> interface-builder/{"\n"}yarn &amp;&amp; yarn
            start{"\n"}
            {"\n"}
            <span className="hljs-built_in">cd</span> interface-builder/example/{"\n"}yarn
            &amp;&amp; yarn start{"\n"}
          </code>
        </pre>
        <h3 className="code-line" data-line-start={70} data-line-end={71}>
          Publish
        </h3>
        <blockquote>
          <p className="has-line-data" data-line-start={71} data-line-end={72}>
            This project publishes as <code>@opg/interface-builder</code> to an OnPoint private
            module registry:
          </p>
          <ul>
            <li className="has-line-data" data-line-start={72} data-line-end={73}>
              <a href="http://ec2-35-170-186-135.compute-1.amazonaws.com:4000/">
                http://ec2-35-170-186-135.compute-1.amazonaws.com:4000/
              </a>
            </li>
            <li className="has-line-data" data-line-start={73} data-line-end={74}>
              See the <code>.npmrc</code> file for registry connection details
            </li>
            <li className="has-line-data" data-line-start={74} data-line-end={75}>
              Private registry is a Verdaccio site
            </li>
            <li className="has-line-data" data-line-start={75} data-line-end={76}>
              To view the published artifacts, go to the website above. You will need the username{" "}
              <code>opguser</code> and password for Verdaccio.
            </li>
          </ul>
        </blockquote>
        <pre>
          <code className="has-line-data" data-line-start={77} data-line-end={80}>
            <span className="hljs-comment">
              # First bump the version number in package.json, then
            </span>
            {"\n"}yarn publish{"\n"}
          </code>
        </pre>
        <h2 className="code-line" data-line-start={82} data-line-end={83}>
          License
        </h2>
        <p className="has-line-data" data-line-start={84} data-line-end={85}>
          ISC © <a href="https://onpointglobal.com/">OnPoint Global</a>
        </p>
      </Card>
    </Layout.Content>
  )
}
