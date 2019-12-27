/**
 * NOTE: Structured this way due to:
 * https://github.com/facebook/react-native/issues/22592
 */

import * as _Comments from "./Comments"
import * as _Post from "./Post"
import * as _SocialButtons from "./SocialButtons"
import * as _PostInfo from "./PostHeader"

const { Comments } = _Comments
const { Post } = _Post
const { SocialButtons } = _SocialButtons
const { UserPostHeader, InfluencerPostHeader } = _PostInfo

export {
  Comments,
  Post,
  SocialButtons,
  UserPostHeader,
  InfluencerPostHeader,
}
