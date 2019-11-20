import { getgotRequest, GetGotResponse, GetGotSuccessResponse } from "./index"

/********************
 * Interests
 */

export type Interest = {
  id: number
  groupId: number
  name: string
  description: string
}

export type InterestGroup = {
  id: number
  name: string
  description: string
  interests: Interest[]
}

// TODO: Fetch this from the API
export const interests: InterestsResponse = {
  r: 0,
  results: [
    {
      id: 3,
      name: "Sports",
      description: "",
      interests: [
        { id: 6, groupId: 3, name: "Football", description: "" },
        { id: 5, groupId: 3, name: "Baseball", description: "" },
      ],
    },
    {
      id: 4,
      name: "Arts",
      description: "",
      interests: [
        { id: 8, groupId: 4, name: "Music", description: "" },
        { id: 7, groupId: 4, name: "Painting", description: "" },
        { id: 9, groupId: 4, name: "Reading", description: "" },
        { id: 10, groupId: 4, name: "Woodworking", description: "" },
      ],
    },
    {
      id: 5,
      name: "Culture",
      description: "",
      interests: [
        { id: 11, groupId: 5, name: "Traveling", description: "" },
        { id: 12, groupId: 5, name: "Cooking", description: "" },
      ],
    },
    {
      id: 2,
      name: "Technology",
      description: "",
      interests: [
        { id: 3, groupId: 2, name: "Blogging", description: "" },
        { id: 4, groupId: 2, name: "Gaming", description: "" },
      ],
    },
    {
      id: 1,
      name: "Community",
      description: "",
      interests: [
        { id: 1, groupId: 1, name: "Volunteer Work", description: "" },
        { id: 2, groupId: 1, name: "Community Involvement", description: "" },
      ],
    },
  ],
}

export interface InterestsResponse extends GetGotSuccessResponse {
  results: InterestGroup[]
}

export const loadInterests = async () => {
  console.log("loadInterests!")
  // TODO: update with the final api function name
  // return await getgotRequest<InterestsResponse>("getinterests", {})
  return new Promise<InterestsResponse>(resolve => {
    setTimeout(resolve, 2000, interests);
  })
}
