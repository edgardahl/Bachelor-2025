import { validate as isUUID } from "uuid"; // Add this import

const sanitizeShift = (shiftData, userId) => {
  const { title, description, date, start_time, end_time, store_id } =
    shiftData;

  // Title: Ensure it's a non-empty string
  if (typeof title !== "string" || title.trim() === "") {
    throw new Error("Title is required and must be a non-empty string.");
  }

  // Description: Ensure it's a non-empty string
  if (typeof description !== "string" || description.trim() === "") {
    throw new Error("Description is required and must be a non-empty string.");
  }

  // Date: Ensure it's a valid date string in 'DD-MM-YYYY' format
  const isValidDate = /^\d{2}-\d{2}-\d{4}$/.test(date);
  if (!isValidDate) {
    throw new Error("Date must be in the format DD-MM-YYYY.");
  }

  // Start Time: Ensure it's a valid Date object
  const startTime = new Date(start_time);
  if (isNaN(startTime.getTime())) {
    throw new Error("Start time is invalid.");
  }

  // End Time: Ensure it's a valid Date object
  const endTime = new Date(end_time);
  if (isNaN(endTime.getTime())) {
    throw new Error("End time is invalid.");
  }

  // Ensure end time is after start time
  if (endTime <= startTime) {
    throw new Error("End time must be later than start time.");
  }

  // Store ID: Ensure it's a valid UUID
  if (!isUUID(store_id)) {
    throw new Error("Store ID must be a valid UUID.");
  }

  // User ID: Ensure it's a valid UUID
  if (!isUUID(userId)) {
    throw new Error("User ID must be a valid UUID.");
  }

  // Format start_time and end_time to "HH:mm:ss" (Time format)
  const start_time_formatted = startTime.toISOString().substring(11, 19); // Extract only time (HH:mm:ss)
  const end_time_formatted = endTime.toISOString().substring(11, 19); // Extract only time (HH:mm:ss)

  // Return sanitized data
  return {
    title: title.trim(),
    description: description.trim(),
    date,
    start_time: start_time_formatted,
    end_time: end_time_formatted,
    store_id,
    posted_by: userId,
  };
};

export default sanitizeShift;
