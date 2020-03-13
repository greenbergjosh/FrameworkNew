import React from "react"
import { FlatList, ScrollView } from "react-native"
import { ContactRow } from "./ContactRow"
import { MessagesScreenProps } from "../MessagesScreen"
import { Empty } from "components/Empty"
import { Units } from "styles"

export interface ContactRowProps {
  contacts?: UserType[]
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
        keyExtractor={(contact) => contact.userId}
        renderItem={({ item }) => <ContactRow contact={item} />}
        ListEmptyComponent={
          <Empty message="You have no contacts" style={{ padding: Units.margin }} />
        }
      />
    </ScrollView>
  )
}
