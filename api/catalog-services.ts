import { getgotRequest, GetGotSuccessResponse } from "./index"

/********************
 * Interests
 */

// TODO: Fetch this from the API
export const interests: InterestsResponse = {
  r: 0,
  interests: [
    {
      id: 3,
      name: "Sports",
      description: "",
      interests: [
        { id: 6, name: "Football", description: "" },
        { id: 5, name: "Baseball", description: "" },
      ],
    },
    {
      id: 4,
      name: "Arts",
      description: "",
      interests: [
        { id: 8, name: "Music", description: "" },
        { id: 7, name: "Painting", description: "" },
        { id: 9, name: "Reading", description: "" },
        { id: 10, name: "Woodworking", description: "" },
      ],
    },
    {
      id: 5,
      name: "Culture",
      description: "",
      interests: [
        { id: 11, name: "Traveling", description: "" },
        { id: 12, name: "Cooking", description: "" },
      ],
    },
    {
      id: 2,
      name: "Technology",
      description: "",
      interests: [
        { id: 3, name: "Blogging", description: "" },
        { id: 4, name: "Gaming", description: "" },
      ],
    },
    {
      id: 1,
      name: "Community",
      description: "",
      interests: [
        { id: 1, name: "Volunteer Work", description: "" },
        { id: 2, name: "Community Involvement", description: "" },
      ],
    },
  ],
}

export interface InterestsResponse extends GetGotSuccessResponse {
  interests: {
    id: number
    name: string
    description: string
    interests: {
      id: number
      name: string
      description: string
    }[]
  }[]
}

export const getInterests = async () => {
  // TODO: update with the final function name
  return await getgotRequest<InterestsResponse>("getinterests", {})
}
