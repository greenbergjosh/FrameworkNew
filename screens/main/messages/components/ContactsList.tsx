import React from "react"
import { FlatList, ScrollView } from "react-native"
import { ContactRow } from "./ContactRow"
import { Contact } from "data/api/messages"
import { MessagesScreenProps } from "../MessagesScreen"
import { Empty } from "components/Empty"
import { Units } from "constants"

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
      <FlatList
        data={contacts}
        keyExtractor={(contact) => contact.id}
        renderItem={({ item }) => <ContactRow contact={item} />}
        ListEmptyComponent={
          <Empty message="You have no contacts" style={{ padding: Units.margin }} />
        }
      />
    </ScrollView>
  )
}
