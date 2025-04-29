import { validate as isUUID } from "uuid";
export const sanitizeShift = (shiftData) => {
  const {
    title,
    description,
    date,
    start_time,
    end_time,
    store_id,
    posted_by: UserId, // Renaming posted_by to UserId
    qualifications,
  } = shiftData;

  // Title: Ensure it's a non-empty string
  if (typeof title !== "string" || title.trim() === "") {
    throw new Error("Title is required and must be a non-empty string.");
  }

  // Description: Ensure it's a non-empty string
  if (typeof description !== "string" || description.trim() === "") {
    throw new Error("Description is required and must be a non-empty string.");
  }

  // Date: Ensure it's a valid date string in 'YYYY-MM-DD' format
  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
  if (!isValidDate) {
    throw new Error("Date must be in the format YYYY-MM-DD.");
  }

  // Start Time: Ensure it's a valid time string (HH:mm)
  const startTimeParts = start_time.split(":");
  if (
    startTimeParts.length !== 2 ||
    isNaN(Number(startTimeParts[0])) ||
    isNaN(Number(startTimeParts[1]))
  ) {
    throw new Error("Start time is invalid. Ensure it's in HH:mm format.");
  }

  // End Time: Ensure it's a valid time string (HH:mm)
  const endTimeParts = end_time.split(":");
  if (
    endTimeParts.length !== 2 ||
    isNaN(Number(endTimeParts[0])) ||
    isNaN(Number(endTimeParts[1]))
  ) {
    throw new Error("End time is invalid. Ensure it's in HH:mm format.");
  }

  // Ensure end time is after start time (Comparing times in "HH:mm" format)
  const startTimeInMinutes =
    Number(startTimeParts[0]) * 60 + Number(startTimeParts[1]);
  const endTimeInMinutes =
    Number(endTimeParts[0]) * 60 + Number(endTimeParts[1]);

  if (endTimeInMinutes <= startTimeInMinutes) {
    throw new Error("End time must be later than start time.");
  }

  // Store ID: Ensure it's a valid UUID
  if (!isUUID(store_id)) {
    throw new Error("Store ID must be a valid UUID.");
  }

  // User ID (posted_by): Ensure it's a valid UUID
  if (!isUUID(UserId)) {
    throw new Error(
      `User ID is invalid. Expected a valid UUID, but received: ${UserId}`
    );
  }

  // Ensure qualifications is an array of valid UUIDs (if provided)
  if (qualifications && qualifications.length > 0) {
    qualifications.forEach((qualification) => {
      if (!isUUID(qualification)) {
        throw new Error(`Qualification ID is invalid: ${qualification}`);
      }
    });
  }

  // Format start_time and end_time to "HH:mm:ss" (Time format)
  const start_time_formatted = `${startTimeParts[0]}:${startTimeParts[1]}:00`; // Add seconds to make it HH:mm:ss
  const end_time_formatted = `${endTimeParts[0]}:${endTimeParts[1]}:00`; // Add seconds to make it HH:mm:ss

  // Return sanitized data
  return {
    title: title.trim(),
    description: description.trim(),
    date,
    start_time: start_time_formatted,
    end_time: end_time_formatted,
    store_id,
    posted_by: UserId, // Use UserId here as it's passed in as that
    qualifications,
  };
};










export const sanitizeUserData = (userData) => {
  const {
    first_name,
    last_name,
    email,
    password,
    phone_number,
    availability,
    role,
    store_id,
    municipality_id,
    qualifications,
    work_municipality_ids,
  } = userData;

  const errors = {}; // To store field-specific error messages

  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/; // Supports accents, spaces, hyphens, apostrophes

  // First name validation
  if (typeof first_name !== "string" || first_name.trim() === "" || !nameRegex.test(first_name)) {
    errors.first_name = "First name must only contain letters and cannot be empty.";
  }

  // Last name validation
  if (typeof last_name !== "string" || last_name.trim() === "" || !nameRegex.test(last_name)) {
    errors.last_name = "Last name must only contain letters and cannot be empty.";
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.email = "Invalid email format.";
  }

  // Password validation
  if (typeof password !== "string" || password.length < 6) {
    errors.password = "Password must be at least 6 characters long.";
  }
  
  // Phone number validation
  const phoneRegex = /^[0-9+\- ]{6,20}$/;
  if (!phoneRegex.test(phone_number)) {
    errors.phone_number = "Telefonnummeret er ugyldig.";
  }
  
  // Availability validation
  const validAvailability = ["Fleksibel", "Ikke-fleksibel"];
  if (!validAvailability.includes(availability)) {
    errors.availability = "Availability must be 'Fleksibel' or 'Ikke-fleksibel'.";
  }
  
  // Role validation
  const validRoles = ["employee", "store_manager", "admin"];
  if (!validRoles.includes(role)) {
    errors.role = `Role must be one of: ${validRoles.join(", ")}`;
  }
  
  // UUID validation for store_id and municipality_id
  if (store_id && !isUUID(store_id)) {
    errors.store_id = "Store ID must be a valid UUID.";
  }
  
  if (municipality_id && !isUUID(municipality_id)) {
    errors.municipality_id = "Municipality ID must be a valid UUID.";
  }
  
  // Qualifications validation
  if (qualifications && !Array.isArray(qualifications)) {
    errors.qualifications = "Qualifications must be an array.";
  }
  
  if (qualifications?.length) {
    qualifications.forEach((q) => {
      if (!isUUID(q)) {
        errors.qualifications = `Invalid qualification ID: ${q}`;
      }
    });
  }

  // work_municipality_ids validation
  if (work_municipality_ids && !Array.isArray(work_municipality_ids)) {
    errors.work_municipality_ids = "Work municipality IDs must be an array.";
  }

  if (work_municipality_ids?.length) {
    work_municipality_ids.forEach((id) => {
      if (!isUUID(id)) {
        errors.work_municipality_ids = `Invalid Municipality ID: ${id}`;
      }
    });
  }
  console.log("!!!!!!!!!!!!!!!!!!!")

  console.log("Errors:", errors);

  // If errors exist, return them
  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // Return sanitized data if no errors
  return {
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    email: email.toLowerCase().trim(),
    password: password.trim(),
    phone_number: phone_number.trim(),
    availability,
    role,
    store_id,
    municipality_id,
    work_municipality_ids, // Include in returned sanitized data
    qualifications: qualifications ?? [],
  };
};
