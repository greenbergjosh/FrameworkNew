import { Button } from "@ant-design/react-native"
import React from "react"

interface FollowButtonProps {
  onPress: any
  following?: boolean
}

export function FollowButton({ onPress, following }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = React.useState(false)
  React.useMemo(() => {
    following ? setIsFollowing(following) : null
  }, [following])

  if (isFollowing) {
    return (
      <Button
        type="ghost"
        size="small"
        onPress={() => {
          setIsFollowing(false)
          onPress()
        }}>
        Unfollow
      </Button>
    )
  }
  return (
    <Button
      type="primary"
      size="small"
      onPress={() => {
        setIsFollowing(true)
        onPress()
      }}>
      Follow
    </Button>
  )
}
