import { Button, Steps } from "antd"
import { set } from "lodash/fp"
import React from "react"
import { DataPathContext } from "../../../util/DataPathContext"
import { ComponentRenderer } from "../../../ComponentRenderer"
import { UserInterfaceProps } from "../../../UserInterface"
import { wizardManageForm } from "./wizard-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  ComponentDefinitionNamedProps,
} from "../../base/BaseInterfaceComponent"

interface WizardStep {
  title: string
  components: ComponentDefinition[]
}

enum EVENTS {
  nextClick = "nextClick",
  prevClick = "prevClick",
}

export interface IWizardInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "wizard"
  steps: WizardStep[]
  defaultActiveStep?: number
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData?: UserInterfaceProps["data"]
}

interface WizardInterfaceComponentDisplayModeProps extends IWizardInterfaceComponentProps {
  mode: "display"
}

interface WizardInterfaceComponentEditModeProps extends IWizardInterfaceComponentProps {
  mode: "edit"
  onChangeSchema?: (newSchema: ComponentDefinition) => void
  userInterfaceSchema?: ComponentDefinition
}

type WizardInterfaceComponentProps = WizardInterfaceComponentDisplayModeProps | WizardInterfaceComponentEditModeProps

export interface WizardInterfaceComponentState {
  activeStep: number
}

export class WizardInterfaceComponent extends BaseInterfaceComponent<
  WizardInterfaceComponentProps,
  WizardInterfaceComponentState
> {
  static defaultProps = {
    steps: [],
  }

  static getLayoutDefinition() {
    return {
      category: "Display",
      name: "wizard",
      title: "Wizard",
      icon: "thunderbolt",
      componentDefinition: {
        component: "wizard",
        steps: [],
      },
    }
  }

  static manageForm = wizardManageForm

  static availableEvents = [EVENTS.nextClick, EVENTS.prevClick]

  state = { activeStep: 0 }

  componentDidMount() {
    if (this.props.defaultActiveStep) {
      this.setState({ activeStep: this.props.defaultActiveStep })
    }
  }

  handleNextClick(activeStepIndex: number): () => void {
    return () => {
      const activeStep = activeStepIndex + 1
      const step = this.props.steps[activeStepIndex]
      const payload = { stepIndex: activeStep, step }

      this.raiseEvent(EVENTS.nextClick, payload)
      console.log("WizardInterfaceComponent", "handleNextClick", { payload })
      this.setState({ activeStep })
    }
  }

  handlePrevClick(activeStepIndex: number): () => void {
    return () => {
      const activeStep = activeStepIndex - 1
      const step = this.props.steps[activeStepIndex]
      const payload = { stepIndex: activeStep, step }

      this.raiseEvent(EVENTS.prevClick, payload)
      console.log("WizardInterfaceComponent", "handlePrevClick", { payload })
      this.setState({ activeStep })
    }
  }

  render() {
    const { onChangeData, steps, userInterfaceData } = this.props
    const { activeStep } = this.state
    const activeStepIndex = activeStep || 0

    return (
      <DataPathContext path="steps">
        <div>
          <Steps current={activeStepIndex} onChange={(stepIndex: number) => this.setState({ activeStep: stepIndex })}>
            {steps.map(({ title }) => (
              <Steps.Step key={title} title={title} />
            ))}
          </Steps>
          <div className="steps-content">
            <DataPathContext path={`${activeStepIndex}.components`}>
              <ComponentRenderer
                components={steps.length ? steps[activeStepIndex].components : []}
                data={userInterfaceData}
                onChangeData={onChangeData}
                onChangeSchema={(newSchema) => {
                  if (this.props.mode === "edit") {
                    const { onChangeSchema, userInterfaceSchema } = this.props
                    console.warn("WizardInterfaceComponent.render", {
                      newSchema,
                      activeStepIndex,
                      onChangeSchema: this.props.onChangeSchema,
                      userInterfaceSchema: this.props.userInterfaceSchema,
                    })
                    onChangeSchema &&
                      userInterfaceSchema &&
                      onChangeSchema(set(`steps.${activeStepIndex}.components`, newSchema, userInterfaceSchema))
                  }
                }}
              />
            </DataPathContext>
          </div>
          <div className="steps-action">
            {activeStepIndex < steps.length - 1 && (
              <Button type="primary" onClick={this.handleNextClick(activeStepIndex)}>
                Next
              </Button>
            )}
            {/* {activeStepIndex === steps.length - 1 && (
              <Button type="primary"
              onClick={() => console.log("Wizard.render", "Done")}>
                Done
              </Button>
            )} */}
            {activeStepIndex > 0 && (
              <Button style={{ marginLeft: 8 }} onClick={this.handlePrevClick(activeStepIndex)}>
                Previous
              </Button>
            )}
          </div>
        </div>
      </DataPathContext>
    )
  }
}
