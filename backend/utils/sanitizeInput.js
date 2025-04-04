import { validate as isUUID } from "uuid";

const sanitizeShift = (shiftData) => {
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

  console.log("Received shiftData:", shiftData);

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
  console.log(
    "returning data",
    title.trim(),
    description.trim(),
    date,
    start_time_formatted,
    end_time_formatted,
    store_id,
    UserId,
    qualifications
  );
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

export default sanitizeShift;
