import { StyleProp, View, ViewStyle } from "react-native"
import React from "react"
import { A, H3, H4 } from "components/Markup"
import { InputItem, List, Radio, WhiteSpace } from "@ant-design/react-native"
import { styles, Units } from "constants"
import moment from "moment"
import DateTimePicker from "react-native-modal-datetime-picker"

interface EditProfileFormProps {
  style: StyleProp<ViewStyle>
  user: UserProfileType
}

export function EditProfileForm({ user, style }: EditProfileFormProps) {
  const [showDOBPicker, setShowDOBPicker] = React.useState(false)
  const [editedUser, setEditedUser] = React.useState(user)
  return (
    <View style={style}>
      <H4>Name</H4>
      <InputItem
        type="text"
        name="name"
        placeholder="Your full name"
        clearButtonMode="always"
        defaultValue={editedUser.name}
      />
      <WhiteSpace size="lg" />
      <H4>Username</H4>
      <InputItem
        type="text"
        name="username"
        placeholder="Your username"
        clearButtonMode="always"
        defaultValue={editedUser.handle}
      />
      <WhiteSpace size="lg" />
      <H4>Website</H4>
      <InputItem
        type="url"
        name="website"
        placeholder="http://"
        clearButtonMode="always"
        defaultValue={editedUser.bioLink.toString()}
        multiline={true}
      />
      <WhiteSpace size="lg" />
      <H4>About You</H4>
      <InputItem
        type="text"
        name="about"
        placeholder="Describe yourself"
        clearButtonMode="always"
        numberOfLines={3}
        defaultValue={editedUser.bio}
        multiline={true}
      />
      <WhiteSpace size="xl" />
      <H3 style={[styles.SubHeader, { marginLeft: -Units.margin, marginRight: -Units.margin }]}>
        Private Information
      </H3>
      <WhiteSpace size="lg" />
      <H4>Email</H4>
      <InputItem
        type="email-address"
        name="email"
        placeholder="Your email address"
        clearButtonMode="always"
        defaultValue={editedUser.contact.email}
      />
      <WhiteSpace size="lg" />
      <H4>Phone</H4>
      <InputItem
        type="phone"
        name="phone"
        placeholder="Your phone number"
        clearButtonMode="always"
        defaultValue={editedUser.contact.phone}
      />
      <WhiteSpace size="lg" />
      <H4>Gender</H4>
      <List>
        <Radio.RadioItem
          key={0}
          checked={editedUser.gender === "M"}
          onChange={(event: any) => {
            if (event.target.checked) {
              setEditedUser({ ...editedUser, gender: "M" })
            }
          }}>
          Male
        </Radio.RadioItem>
        <Radio.RadioItem
          key={1}
          checked={editedUser.gender === "F"}
          onChange={(event: any) => {
            if (event.target.checked) {
              setEditedUser({ ...editedUser, gender: "F" })
            }
          }}>
          Female
        </Radio.RadioItem>
        <Radio.RadioItem
          key={2}
          checked={editedUser.gender === "U"}
          onChange={(event: any) => {
            if (event.target.checked) {
              setEditedUser({ ...editedUser, gender: "U" })
            }
          }}>
          Undisclosed
        </Radio.RadioItem>
      </List>
      <WhiteSpace size="lg" />
      <H4>Birthday</H4>
      <A
        onPress={() => setShowDOBPicker(true)}
        style={{
          fontSize: styles.H3.fontSize,
          lineHeight: styles.H3.lineHeight,
          margin: Units.margin,
        }}>
        {editedUser.dob ? moment(editedUser.dob).format("MMMM DD, YYYY") : "Select Date"}
      </A>
      <DateTimePicker
        isVisible={showDOBPicker}
        date={moment(editedUser.dob).toDate()}
        onConfirm={(newDOB) => {
          setEditedUser({ ...editedUser, dob: newDOB.toISOString() })
          setShowDOBPicker(false)
        }}
        onCancel={() => setShowDOBPicker(false)}
      />
      <WhiteSpace size="xl" />
    </View>
  )
}
