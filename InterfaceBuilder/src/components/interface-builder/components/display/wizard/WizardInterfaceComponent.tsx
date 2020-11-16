import { Button, Icon, Steps } from "antd"
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
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
  disableStepNumbersChangingTabs?: boolean
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
    disableStepNumbersChangingTabs: true,
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
      const nextStepIndex = activeStepIndex + 1
      const step = this.props.steps[activeStepIndex]
      const payload = { stepIndex: nextStepIndex, step }

      this.raiseEvent(EVENTS.nextClick, payload)
      console.log("WizardInterfaceComponent", "handleNextClick", { payload })
      this.setState({ activeStep: nextStepIndex })
    }
  }

  handlePrevClick(activeStepIndex: number): () => void {
    return () => {
      const nextStepIndex = activeStepIndex - 1
      const step = this.props.steps[activeStepIndex]
      const payload = { stepIndex: nextStepIndex, step }

      this.raiseEvent(EVENTS.prevClick, payload)
      console.log("WizardInterfaceComponent", "handlePrevClick", { payload })
      this.setState({ activeStep: nextStepIndex })
    }
  }

  handleChangeStep = (activeStepIndex: number): ((nextStepIndex: number) => void) => {
    if (this.props.disableStepNumbersChangingTabs) return () => null

    return (nextStepIndex: number) => {
      const step = this.props.steps[activeStepIndex]
      const payload = { stepIndex: nextStepIndex, step }
      const eventName = nextStepIndex > activeStepIndex ? EVENTS.nextClick : EVENTS.prevClick

      this.raiseEvent(eventName, payload)
      console.log("WizardInterfaceComponent", "handleChangeStep", { payload })
      this.setState({ activeStep: nextStepIndex })
    }
  }

  render() {
    const {
      onChangeData,
      steps,
      userInterfaceData,
      getRootUserInterfaceData,
      disableStepNumbersChangingTabs,
    } = this.props
    const { activeStep } = this.state
    const activeStepIndex = activeStep || 0

    return (
      <DataPathContext path="steps">
        <div>
          <Steps current={activeStepIndex} onChange={this.handleChangeStep(activeStepIndex)}>
            {steps.map(({ title }) => (
              <Steps.Step key={title} title={title} disabled={disableStepNumbersChangingTabs} />
            ))}
          </Steps>
          <div className="steps-content">
            <DataPathContext path={`${activeStepIndex}.components`}>
              <ComponentRenderer
                components={steps.length ? steps[activeStepIndex].components : []}
                data={userInterfaceData}
                getRootData={getRootUserInterfaceData}
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
            <Button.Group>
              <Button type="primary" disabled={activeStepIndex === 0} onClick={this.handlePrevClick(activeStepIndex)}>
                <Icon type="left" />
                Previous
              </Button>
              <Button
                type="primary"
                disabled={activeStepIndex === steps.length - 1}
                onClick={this.handleNextClick(activeStepIndex)}>
                Next
                <Icon type="right" />
              </Button>
            </Button.Group>
          </div>
        </div>
      </DataPathContext>
    )
  }
}
