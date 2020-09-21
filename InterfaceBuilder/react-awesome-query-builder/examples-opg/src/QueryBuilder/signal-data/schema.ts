import { Fields } from "react-awesome-query-builder"

const PersonSchema = {
  Gender: {
    label: "Gender",
    type: "select",
    operators: ["select_equals"],
    listValues: ["Male", "Female", "TEST"],
  },
  firstName: {
    label: "First Name",
    type: "text",
    operators: ["equal", "not_equal", "starts_with", "ends_with", "contains"],
  },
  DpvZipPlusFour: {
    label: "DpvZipPlusFour",
    type: "multiselect",
    operators: ["multiselect_equals", "multiselect_not_equals"],
  },
  Zip: {
    label: "Zip",
    type: "select",
    operators: ["select_equals"],
    listValues: ["33442", "33444", "33448", "33449", "TEST"],
  },
  HairColor: {
    label: "Hair Color",
    type: "select",
    operators: ["select_equals"],
    listValues: ["Black", "Brown", "Grey", "Blond", "Red", "Other"],
  },
  EyeColor: {
    label: "Eye Color",
    type: "select",
    operators: ["select_equals"],
    listValues: ["Black", "Brown", "Hazel", "Blue", "Other"],
  },
}

const AlienSchema = {
  label: "AlienN",
  tooltip: "AlienN",
  type: "!group",
  subfields: {
    Role: {
      label: "Role",
      type: "select",
      operators: ["select_equals"],
      listValues: ["Queen", "Drone"],
    },
    Stage: {
      label: "Stage",
      type: "select",
      operators: ["select_equals"],
      listValues: ["Egg", "Facehugger", "Chestburster", "Xenomorph"],
    },
    Meal: {
      label: "MealN",
      tooltip: "MealN",
      type: "!group",
      subfields: {
        PersonSchema,
      },
    },
  },
}

const PeopleN = {
  label: "PeopleN",
  tooltip: "PeopleN",
  type: "!group",
  subfields: {
    ...PersonSchema,
    PeopleN: {
      label: "PeopleN",
      tooltip: "PeopleN",
      type: "!group",
      subfields: {
        ...PersonSchema,
      },
    },
  },
}

const schema: Fields = {
  ...PersonSchema,
  PeopleN: {
    ...PeopleN,
  },
  AlienN: {
    ...AlienSchema,
  },
}

export default schema
