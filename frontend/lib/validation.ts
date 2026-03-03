import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Minimum 6 characters")
    .required("Password is required"),
});

export const registerSchema = yup.object({
  name: yup
    .string()
    .min(2, "Minimum 2 characters")
    .required("Name is required"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Minimum 6 characters")
    .required("Password is required"),
  role: yup.string().oneOf(["client", "business"]).required("Role is required"),
  languages: yup
    .array()
    .of(yup.string())
    .when("role", {
      is: "business",
      then: (schema) =>
        schema.min(1, "Select at least one language").required(),
      otherwise: (schema) => schema.optional(),
    }),
});

export const bookingSchema = yup.object({
  reason: yup
    .string()
    .oneOf([
      "Career and business",
      "Lesson for kids",
      "Living abroad",
      "Exams and coursework",
      "Culture, travel or hobby",
    ])
    .required("Please select a reason"),
  fullName: yup
    .string()
    .min(2, "Minimum 2 characters")
    .required("Full name is required"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: yup
    .string()
    .matches(
      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
      "Invalid phone number",
    )
    .required("Phone number is required"),
});

export const profileSchema = yup.object({
  name: yup
    .string()
    .min(2, "Minimum 2 characters")
    .required("Name is required"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  languages: yup.array().of(yup.string()).optional(),
  lesson_info: yup.string().optional(),
  conditions: yup.string().optional(),
  description: yup.string().optional(),
});
