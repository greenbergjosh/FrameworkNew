export default [
  {
    _id: 1,
    text: "What are you feeling like?",
    createdAt: new Date(),
    user: {
      _id: 2,
      name: "React Native",
      avatar: "https://placeimg.com/140/140/any",
    },
  },
  {
    _id: 2,
    text: "Yeah, let's go somewhere soon",
    createdAt: new Date(),
    user: {
      _id: 1,
      name: "React Native",
      avatar: "https://placeimg.com/140/140/any",
    },
  },
  {
    _id: 3,
    text: "Are you getting hungry? Wanna go somewhere?",
    createdAt: new Date(),
    user: {
      _id: 2,
      name: "React Native",
      avatar: "https://placeimg.com/140/140/any",
    },
  },
]