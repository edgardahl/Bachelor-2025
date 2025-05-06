import { validate as isUUID } from "uuid";

export const sanitizeShift = (shiftData) => {
  const {
    title,
    description,
    date,
    start_time,
    end_time,
    store_id,
    posted_by: UserId,
    qualifications,
  } = shiftData;

  const errors = {};
  // Title validation
  if (typeof title !== "string" || title.trim() === "") {
    errors.title = "Title is required and must be a non-empty string.";
  } else if (!/^[a-zA-ZæøåÆØÅ\s]+$/.test(title.trim())) {
    errors.title = "Tittelen kan bare innholde bokstaver og mellomrom.";
  }

  if (typeof description !== "string" || description.trim() === "") {
    errors.description = "Beskrivelse er påkrevd";
  }

  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(date);

if (!isValidDate) {
  errors.date = "Datoen må være i formatet YYYY-MM-DD.";
} else {
  const inputDate = new Date(date);
  const today = new Date();
  const oneWeekFromNow = new Date(today);
  oneWeekFromNow.setDate(today.getDate() + 7); // Setter datoen til 7 dager fremover

  // Sjekk om datoen er i fremtiden, og at den ikke er mer enn en uke frem i tid
  if (inputDate < today) {
    errors.date = "Datoen har allerede vært.";
  } else if (inputDate > oneWeekFromNow) {
    errors.date = "Datoen kan ikke være mer enn 7 dager frem i tid.";
  }
}

  const startTimeParts = start_time?.split(":") || [];
  const endTimeParts = end_time?.split(":") || [];

  if (
    startTimeParts.length !== 2 ||
    isNaN(+startTimeParts[0]) ||
    isNaN(+startTimeParts[1])
  ) {
    errors.start_time = "Start tiden er ugyldig. Sørg for at den er i HH:mm format.";
  }

  if (
    endTimeParts.length !== 2 ||
    isNaN(+endTimeParts[0]) ||
    isNaN(+endTimeParts[1])
  ) {
    errors.end_time = "End tiden er ugyldig. Sørg for at den er i HH:mm format.";
  }

  if (!errors.start_time && !errors.end_time) {
    const startTimeInMinutes = +startTimeParts[0] * 60 + +startTimeParts[1];
    const endTimeInMinutes = +endTimeParts[0] * 60 + +endTimeParts[1];

    if (endTimeInMinutes <= startTimeInMinutes) {
      errors.end_time = "End tiden må være etter start tiden.";
    }
  }

  if (!isUUID(store_id)) {
    errors.store_id = "Store ID must be a valid UUID.";
  }

  if (!isUUID(UserId)) {
    errors.posted_by = `User ID is invalid. Expected a valid UUID, but received: ${UserId}`;
  }

  if (qualifications && qualifications.length > 0) {
    qualifications.forEach((q) => {
      if (!isUUID(q)) {
        if (!errors.qualifications) errors.qualifications = [];
        errors.qualifications.push(`Invalid qualification ID: ${q}`);
      }
    });
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const start_time_formatted = `${startTimeParts[0]}:${startTimeParts[1]}:00`;
  const end_time_formatted = `${endTimeParts[0]}:${endTimeParts[1]}:00`;

  return {
    title: title.trim(),
    description: description.trim(),
    date,
    start_time: start_time_formatted,
    end_time: end_time_formatted,
    store_id,
    posted_by: UserId,
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

  const errors = {};

  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9+\- ]{6,20}$/;
  const validAvailability = ["Fleksibel", "Ikke-fleksibel"];
  const validRoles = ["employee", "store_manager", "admin"];

  if (typeof first_name !== "string" || first_name.trim() === "" || !nameRegex.test(first_name)) {
    errors.first_name = "Fornavn må kun inneholde bokstaver og kan ikke være tomt.";
  }
  if (typeof last_name !== "string" || last_name.trim() === "" || !nameRegex.test(last_name)) {
    errors.last_name = "Etternavn må kun inneholde bokstaver og kan ikke være tomt.";
  }
  if (!email || !emailRegex.test(email)) {
    errors.email = "Ugyldig e-postformat.";
  }
  if (typeof password !== "string" || password.length < 6) {
    errors.password = "Passordet må være minst 6 tegn langt.";
  }
  if (!phoneRegex.test(phone_number)) {
    errors.phone_number = "Telefonnummeret er ugyldig.";
  }
  if (!validAvailability.includes(availability)) {
    errors.availability = "Tilgjengelighet må være 'Fleksibel' eller 'Ikke-fleksibel'.";
  }
  if (!validRoles.includes(role)) {
    errors.role = `Role må være en av følgende: ${validRoles.join(", ")}.`;
  }
  if (store_id && !isUUID(store_id)) {
    errors.store_id = "Store ID must be a valid UUID.";
  }
  if (municipality_id && !isUUID(municipality_id)) {
    errors.municipality_id = "Municipality ID must be a valid UUID.";
  }
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

  console.log("Errors:", errors);

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

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
    work_municipality_ids,
    qualifications: qualifications ?? [],
  };
};

export const sanitizeUserProfileUpdateData = (userData) => {
  const {
    first_name,
    last_name,
    email,
    phone_number,
    availability,
    municipality_id,
    work_municipality_ids,
  } = userData;

  const errors = {};

  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9+\- ]{6,20}$/;
  const validAvailability = ["Fleksibel", "Ikke-fleksibel"];

  if (typeof first_name !== "string" || first_name.trim() === "" || !nameRegex.test(first_name)) {
    errors.first_name = "Fornavn må kun inneholde bokstaver og kan ikke være tomt.";
  }
  if (typeof last_name !== "string" || last_name.trim() === "" || !nameRegex.test(last_name)) {
    errors.last_name = "Etternavn må kun inneholde bokstaver og kan ikke være tomt.";
  }
  if (!email || !emailRegex.test(email)) {
    errors.email = "Ugyldig e-postformat.";
  }
  if (!phoneRegex.test(phone_number)) {
    errors.phone_number = "Telefonnummeret er ugyldig.";
  }
  if (!validAvailability.includes(availability)) {
    errors.availability = "Tilgjengelighet må være 'Fleksibel' eller 'Ikke-fleksibel'.";
  }
  if (municipality_id && !isUUID(municipality_id)) {
    errors.municipality_id = "Municipality ID must be a valid UUID.";
  }
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

  console.log("Errors:", errors);

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    email: email.toLowerCase().trim(),
    phone_number: phone_number.trim(),
    availability,
    municipality_id,
    work_municipality_ids,
  };
};
