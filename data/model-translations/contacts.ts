import { Contact as ExpoContactType } from "expo-contacts/build/Contacts"

export function ExpoContactsToContacts(expoContacts: ExpoContactType[]): ContactType[] {
  return expoContacts.map((expoContact) => ExpoContactToContact(expoContact))
}

export const ExpoContactToContact = (expoContact) => ({
  fname: expoContact.firstName || null,
  lname: expoContact.lastName || null,
  phone: (expoContact.phoneNumbers && expoContact.phoneNumbers[0].number) || null,
  email: (expoContact.emails && expoContact.emails[0].email) || null,
  dob: null,
  gender: null,
})

export function toExpoContacts(ggContacts: ContactType[]): ExpoContactType[] {
  return ggContacts.map((contact) => toExpoContact(contact))
}

export const toExpoContact = (contact: ContactType): ExpoContactType => ({
  id: null,
  contactType: "person",
  name: `${contact.fname} ${contact.lname}`,
  firstName: contact.fname || null,
  lastName: contact.lname || null,
  phoneNumbers: [
    {
      id: null,
      label: null,
      number: contact.phone || null,
    },
  ],
  emails: [
    {
      id: null,
      label: null,
      email: contact.email || null,
    },
  ],
})
