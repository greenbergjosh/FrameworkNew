import { StyleProp, View, ViewStyle } from "react-native"
import React from "react"
import { A, H3, H4 } from "components/Markup"
import { InputItem, List, Radio, WhiteSpace } from "@ant-design/react-native"
import { styles, Units } from "constants"
import moment from "moment"
import DateTimePicker from "react-native-modal-datetime-picker"

interface EditProfileFormProps {
  style: StyleProp<ViewStyle>
  profile: ProfileType
}

export function EditProfileForm({ profile, style }: EditProfileFormProps) {
  const [showDOBPicker, setShowDOBPicker] = React.useState(false)
  const [editedProfile, setEditedProfile] = React.useState(profile)
  return (
    <View style={style}>
      <H4>Name</H4>
      <InputItem
        type="text"
        name="name"
        placeholder="Your full name"
        clearButtonMode="always"
        defaultValue={editedProfile.name}
      />
      <WhiteSpace size="lg" />
      <WhiteSpace size="lg" />
      <H4>Website</H4>
      <InputItem
        type="url"
        name="website"
        placeholder="http://"
        clearButtonMode="always"
        defaultValue={editedProfile.bioLink.toString()}
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
        defaultValue={editedProfile.bio}
        multiline={true}
      />
      <WhiteSpace size="xl" />
      <H3 style={[styles.SubHeader, { marginLeft: -Units.margin, marginRight: -Units.margin }]}>
        Private Information
      </H3>
      <WhiteSpace size="lg" />
      <WhiteSpace size="lg" />
      <H4>Gender</H4>
      <List>
        <Radio.RadioItem
          key={0}
          checked={editedProfile.gender === "M"}
          onChange={(event: any) => {
            if (event.target.checked) {
              setEditedProfile({ ...editedProfile, gender: "M" })
            }
          }}>
          Male
        </Radio.RadioItem>
        <Radio.RadioItem
          key={1}
          checked={editedProfile.gender === "F"}
          onChange={(event: any) => {
            if (event.target.checked) {
              setEditedProfile({ ...editedProfile, gender: "F" })
            }
          }}>
          Female
        </Radio.RadioItem>
        <Radio.RadioItem
          key={2}
          checked={editedProfile.gender === "U"}
          onChange={(event: any) => {
            if (event.target.checked) {
              setEditedProfile({ ...editedProfile, gender: "U" })
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
        {editedProfile.dob ? moment(editedProfile.dob).format("MMMM DD, YYYY") : "Select Date"}
      </A>
      <DateTimePicker
        isVisible={showDOBPicker}
        date={moment(editedProfile.dob).toDate()}
        onConfirm={(newDOB) => {
          setEditedProfile({ ...editedProfile, dob: newDOB.toISOString() })
          setShowDOBPicker(false)
        }}
        onCancel={() => setShowDOBPicker(false)}
      />
      <WhiteSpace size="xl" />
    </View>
  )
}
