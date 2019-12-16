/**
 * NOTE: Structured this way due to:
 * https://github.com/facebook/react-native/issues/22592
 */

import * as _Comments from "./Comments"
import * as _FeedItem from "./FeedItem"
import * as _SocialButtons from "./SocialButtons"
import * as _UserInfo from "./UserInfo"
import * as _mockData from "api/feed-services.mockData"

const { Comments } = _Comments
const { FeedItem } = _FeedItem
const { SocialButtons } = _SocialButtons
const { UserInfo, ProfileInfo } = _UserInfo

export { Comments, FeedItem, SocialButtons, UserInfo, ProfileInfo }
