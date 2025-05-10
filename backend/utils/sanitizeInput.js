import { validate as isUUID } from "uuid";

// Middleware for å validere innkommende vakt
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
    start_time: `${startTimeParts[0]}:${startTimeParts[1]}`, // fjernet ":00"
    end_time: `${endTimeParts[0]}:${endTimeParts[1]}`, // fjernet ":00"
    store_id,
    posted_by: UserId,
    qualifications,
  };
};

// Middleware for å validere innkommende bruker
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

  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9+\- ]{6,20}$/;
  const validAvailability = ["Fleksibel", "Ikke-fleksibel"];
  const validRoles = ["employee", "store_manager", "admin"];

  if (!nameRegex.test(first_name || "")) {
    errors.first_name =
      "Fornavn må kun inneholde bokstaver og kan ikke være tomt.";
  }
  if (!nameRegex.test(last_name || "")) {
    errors.last_name =
      "Etternavn må kun inneholde bokstaver og kan ikke være tomt.";
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
    errors.availability =
      "Tilgjengelighet må være 'Fleksibel' eller 'Ikke-fleksibel'.";
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

// Middleware for å validere innkommende brukeroppdatering
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

  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9+\- ]{6,20}$/;
  const validAvailability = ["Fleksibel", "Ikke-fleksibel"];

  if (!nameRegex.test(first_name || "")) {
    errors.first_name =
      "Fornavn må kun inneholde bokstaver og kan ikke være tomt.";
  }
  if (!nameRegex.test(last_name || "")) {
    errors.last_name =
      "Etternavn må kun inneholde bokstaver og kan ikke være tomt.";
  }
  if (!email || !emailRegex.test(email)) {
    errors.email = "Ugyldig e-postadresse.";
  }
  if (!phoneRegex.test(phone_number)) {
    errors.phone_number = "Telefonnummeret er ugyldig.";
  }
  if (!validAvailability.includes(availability)) {
    errors.availability =
      "Tilgjengelighet må være 'Fleksibel' eller 'Ikke-fleksibel'.";
  }
  if (municipality_id && !isUUID(municipality_id)) {
    errors.municipality_id = "Kommune-ID må være en gyldig UUID.";
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
    phone_number: phone_number.trim(),
    availability,
    municipality_id,
    work_municipality_ids,
  };
};

export const sanitizeStoreUpdate = (storeData) => {
  const {
    store_name, // Butikkens navn
    address,
    postal_code,
    municipality_id,
    manager_id,
    store_phone, // store_phone instead of phone_number
    store_email, // store_email instead of store_email
    store_chain,
  } = storeData;

  const errors = {};

  // Validating the name of the store
  console.log("Validating store_name:", store_name); // Add log to check value
  if (typeof store_name !== "string" || store_name.trim() === "") {
    console.log("store_name is empty or not a string"); // Error if empty or not a string
    errors.store_name = "Navn på butikken er påkrevd.";
  } else if (!/^[a-zA-ZæøåÆØÅ\s]+$/.test(store_name.trim())) {
    console.log("store_name does not match the regex:", store_name); // Error if does not match pattern
    errors.store_name = "Butikknavn kan bare inneholde bokstaver og mellomrom.";
  }

  // Validating address
  console.log("Validating address:", address);
  if (typeof address !== "string" || address.trim() === "") {
    console.log("address is empty or not a string");
    errors.address = "Adresse er påkrevd.";
  }

  // Validating postal code if it's provided
  const postalCodeRegex = /^[0-9]{4}(\s[0-9]{4})?$/;
  if (postal_code && !postalCodeRegex.test(postal_code)) {
    console.log("postal_code does not match regex:", postal_code);
    errors.postal_code = "Postnummer må være i riktig format (f.eks. 1234 eller 1234 5678).";
  }

  // Validating municipality_id (UUID check)
  console.log("Validating municipality_id:", municipality_id);
  if (municipality_id && !isUUID(municipality_id)) {
    console.log("municipality_id is not a valid UUID");
    errors.municipality_id = "Kommune-ID må være en gyldig UUID.";
  }

  // Validating manager_id (UUID check)
  console.log("Validating manager_id:", manager_id);
  if (manager_id && !isUUID(manager_id)) {
    console.log("manager_id is not a valid UUID");
    errors.manager_id = "Manager-ID må være en gyldig UUID.";
  }

  // Validating store_phone if it's provided
  const phoneRegex = /^[0-9+\- ]{6,20}$/;
  console.log("Validating store_phone:", store_phone);
  if (store_phone && !phoneRegex.test(store_phone)) {
    console.log("store_phone does not match regex:", store_phone);
    errors.store_phone = "Telefonnummeret er ugyldig.";
  }

  // Validating store_email if it's provided
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  console.log("Validating store_email:", store_email);
  if (store_email && !emailRegex.test(store_email)) {
    console.log("store_email does not match regex:", store_email);
    errors.store_email = "E-postadressen er ugyldig.";
  }

  // Validating store_chain if it's provided
  console.log("Validating store_chain:", store_chain);
  if (store_chain && typeof store_chain !== "string") {
    console.log("store_chain is not a string");
    errors.store_chain = "Butikkjede må være en gyldig tekststreng.";
  }

  if (Object.keys(errors).length > 0) {
    console.log("Validation errors:", errors); // Log validation errors
    return { errors };
  }

  // Return sanitized data
  console.log("Returning sanitized data:", {
    store_name: store_name.trim(),
    address: address.trim(),
    postal_code,
    municipality_id,
    manager_id,
    store_phone: store_phone?.trim(),
    store_email: store_email?.trim(),
    store_chain: store_chain?.trim(),
  });

  return {
    store_name: store_name.trim(),
    address: address.trim(),
    postal_code,
    municipality_id,
    manager_id,
    store_phone: store_phone?.trim(),
    store_email: store_email?.trim(),
    store_chain: store_chain?.trim(),
  };
};
