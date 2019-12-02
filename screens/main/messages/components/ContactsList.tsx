import React from "react"
import { ScrollView } from "react-native"
import { List } from "@ant-design/react-native"
import { ContactRow } from "./ContactRow"
import { Contact } from "api/messages-services"
import { MessagesScreenProps } from "../MessagesScreen"

export interface ContactRowProps {
  contacts?: Contact[]
  navigate: MessagesScreenProps["navigation"]["navigate"]
}

export const ContactsList = ({ navigate, contacts }: ContactRowProps) => {
  return (
    <ScrollView
      style={{ flex: 1 }}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}>
      <List>
        {contacts.map((contact) => (
          <ContactRow key={contact.id} navigate={navigate} contact={contact} />
        ))}
      </List>
    </ScrollView>
  )
}
