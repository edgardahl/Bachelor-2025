import { validate as isUUID } from "uuid";

// Felles regex og konstanter
const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^[0-9+\- ]{6,20}$/;
const validAvailability = ["Fleksibel", "Ikke-fleksibel"];
const validRoles = ["employee", "store_manager", "admin"];

// Oppretter ny bruker
export const sanitizeUser = (userData) => {
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

  if (!nameRegex.test(first_name || "")) {
    errors.first_name = "Fornavn må kun inneholde bokstaver og kan ikke være tomt.";
  }
  if (!nameRegex.test(last_name || "")) {
    errors.last_name = "Etternavn må kun inneholde bokstaver og kan ikke være tomt.";
  }
  if (!email || !emailRegex.test(email)) {
    errors.email = "Ugyldig e-postadresse.";
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
    errors.role = `Rolle må være en av: ${validRoles.join(", ")}.`;
  }
  if (store_id && !isUUID(store_id)) {
    errors.store_id = "Butikk-ID må være en gyldig UUID.";
  }
  if (municipality_id && !isUUID(municipality_id)) {
    errors.municipality_id = "Kommune-ID må være en gyldig UUID.";
  }
  if (qualifications?.length) {
    qualifications.forEach((q) => {
      if (!isUUID(q)) {
        errors.qualifications = `Ugyldig kvalifikasjons-ID: ${q}`;
      }
    });
  }
  if (work_municipality_ids?.length) {
    work_municipality_ids.forEach((id) => {
      if (!isUUID(id)) {
        errors.work_municipality_ids = `Ugyldig kommune-ID: ${id}`;
      }
    });
  }

  if (Object.keys(errors).length > 0) return { errors };

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

// Oppdaterer eksisterende bruker
export const sanitizeUserUpdate = (userData) => {
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
  const sanitized = {};

  if (first_name !== undefined) {
    if (!nameRegex.test(first_name || "")) {
      errors.first_name = "Fornavn må kun inneholde bokstaver og kan ikke være tomt.";
    } else {
      sanitized.first_name = first_name.trim();
    }
  }

  if (last_name !== undefined) {
    if (!nameRegex.test(last_name || "")) {
      errors.last_name = "Etternavn må kun inneholde bokstaver og kan ikke være tomt.";
    } else {
      sanitized.last_name = last_name.trim();
    }
  }

  if (email !== undefined) {
    if (!email || !emailRegex.test(email)) {
      errors.email = "Ugyldig e-postadresse.";
    } else {
      sanitized.email = email.toLowerCase().trim();
    }
  }

  if (phone_number !== undefined) {
    if (!phoneRegex.test(phone_number)) {
      errors.phone_number = "Telefonnummeret er ugyldig.";
    } else {
      sanitized.phone_number = phone_number.trim();
    }
  }

  if (availability !== undefined) {
    if (!validAvailability.includes(availability)) {
      errors.availability = "Tilgjengelighet må være 'Fleksibel' eller 'Ikke-fleksibel'.";
    } else {
      sanitized.availability = availability;
    }
  }

  if (municipality_id !== undefined) {
    if (!isUUID(municipality_id)) {
      errors.municipality_id = "Kommune-ID må være en gyldig UUID.";
    } else {
      sanitized.municipality_id = municipality_id;
    }
  }

  if (work_municipality_ids !== undefined) {
    if (!Array.isArray(work_municipality_ids)) {
      errors.work_municipality_ids = "Arbeidskommuner må være en liste.";
    } else {
      const invalidIds = work_municipality_ids.filter((id) => !isUUID(id));
      if (invalidIds.length > 0) {
        errors.work_municipality_ids = `Ugyldige kommune-IDer: ${invalidIds.join(", ")}`;
      } else {
        sanitized.work_municipality_ids = work_municipality_ids;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return sanitized;
};


// Validerer innkommende vakt
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

  if (typeof title !== "string" || title.trim() === "") {
    errors.title = "Tittel er påkrevd.";
  } else if (!/^[a-zA-ZæøåÆØÅ0-9\s]+$/.test(title.trim())) {
    errors.title = "Tittelen kan bare inneholde bokstaver, tall og mellomrom.";
  }

  if (typeof description !== "string" || description.trim() === "") {
    errors.description = "Beskrivelse er påkrevd.";
  }

  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
  if (!isValidDate) {
    errors.date = "Datoen må være i formatet ÅÅÅÅ-MM-DD.";
  } else {
    const inputDate = new Date(date);
    const today = new Date();
    const oneWeekFromNow = new Date(today);
    oneWeekFromNow.setDate(today.getDate() + 7);

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
    errors.start_time = "Starttid må være i HH:mm-format.";
  }

  if (
    endTimeParts.length !== 2 ||
    isNaN(+endTimeParts[0]) ||
    isNaN(+endTimeParts[1])
  ) {
    errors.end_time = "Sluttid må være i HH:mm-format.";
  }

  if (!errors.start_time && !errors.end_time) {
    const startTimeInMinutes = +startTimeParts[0] * 60 + +startTimeParts[1];
    const endTimeInMinutes = +endTimeParts[0] * 60 + +endTimeParts[1];
    if (endTimeInMinutes <= startTimeInMinutes) {
      errors.end_time = "Sluttiden må være etter starttiden.";
    }
  }

  if (!isUUID(store_id)) {
    errors.store_id = "Butikk-ID må være en gyldig UUID.";
  }

  if (!isUUID(UserId)) {
    errors.posted_by = `Bruker-ID er ugyldig. Forventet en gyldig UUID, men fikk: ${UserId}`;
  }

  if (qualifications?.length) {
    qualifications.forEach((q) => {
      if (!isUUID(q)) {
        if (!errors.qualifications) errors.qualifications = [];
        errors.qualifications.push(`Ugyldig kvalifikasjons-ID: ${q}`);
      }
    });
  }

  if (Object.keys(errors).length > 0) return { errors };

  return {
    title: title.trim(),
    description: description.trim(),
    date,
    start_time: `${startTimeParts[0]}:${startTimeParts[1]}`,
    end_time: `${endTimeParts[0]}:${endTimeParts[1]}`,
    store_id,
    posted_by: UserId,
    qualifications,
  };
  
};

// Validerer passordendring (brukes ved PATCH /users/current/password)
export const sanitizePasswordUpdate = ({ currentPassword, newPassword }) => {
  const errors = {};

  if (!currentPassword || typeof currentPassword !== "string") {
    errors.currentPassword = "Nåværende passord er påkrevd.";
  }

  if (!newPassword || typeof newPassword !== "string" || newPassword.trim().length < 6) {
    errors.newPassword = "Nytt passord må være minst 6 tegn langt.";
  }

  if (Object.keys(errors).length > 0) return { errors };

  return {
    currentPassword: currentPassword.trim(),
    newPassword: newPassword.trim(),
  };
};

