import * as yup from "yup";

export const registerSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .required("First name is required"),

  surname: yup
    .string()
    .trim()
    .min(2, "Surname must be at least 2 characters")
    .required("Last name is required"),

  email: yup
    .string()
    .trim()
    .email("Please enter a valid email")
    .required("Email is required"),

  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),

  role: yup.string().oneOf(["client", "business"]).optional(),
});

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Please enter a valid email")
    .required("Email is required"),

  password: yup.string().required("Password is required"),
});

export const profileSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .required("First name is required"),

  surname: yup
    .string()
    .trim()
    .min(2, "Surname must be at least 2 characters")
    .required("Last name is required"),

  email: yup
    .string()
    .trim()
    .email("Please enter a valid email")
    .required("Email is required"),

  lesson_info: yup.string().optional(),
  conditions: yup.string().optional(),
  description: yup.string().optional(),
});

export const bookingSchema = yup.object({
  fullName: yup
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .required("Full name is required"),

  email: yup
    .string()
    .trim()
    .email("Please enter a valid email")
    .required("Email is required"),

  phone: yup
    .string()
    .trim()
    .min(6, "Please enter a valid phone number")
    .required("Phone number is required"),

  reason: yup.string().required("Please select a reason"),
});
