import React from "react"
import { Empty } from "components/Empty"
import { P, A } from "components/Markup"

export const PromotionEducationPrompt = () => {
  return (
    <Empty
      message={
        <>
          <P>It looks like you haven't started any promotions, yet.</P>

          <P>Here are some great ideas to get you started!</P>

          <P>
            {"\u2022"}
            <A
              onPress={() => {
                alert("Navigate browser to wix site")
              }}>
              Naked Beauty
            </A>
          </P>
        </>
      }
    />
  )
}
