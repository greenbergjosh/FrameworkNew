/**
 * NOTE: Structured this way due to:
 * https://github.com/facebook/react-native/issues/22592
 */

import * as _Post from "./Post"
import * as _PostInfo from "./PostHeader"
import * as _CommentThread from "./Comments"

const { Post } = _Post
const { UserPostHeader, InfluencerPostHeader } = _PostInfo
const { Comments } = _CommentThread

export { Post, UserPostHeader, InfluencerPostHeader, Comments }
