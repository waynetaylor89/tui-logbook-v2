import { useState } from "react";

export const useMovementForm = (initialDate = new Date().toISOString().slice(0, 10)) => {
  const [movementDate, setMovementDate] = useState(initialDate);
  const [aircraft, setAircraft] = useState("");
  const [movementType, setMovementType] = useState("Tow");
  const [fromStand, setFromStand] = useState("");
  const [toStand, setToStand] = useState("");
  const [notes, setNotes] = useState("");
  const [showAircraftSuggestions, setShowAircraftSuggestions] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!aircraft.trim()) {
      newErrors.aircraft = "Aircraft is required";
    }
    
    if (!fromStand.trim()) {
      newErrors.fromStand = "From stand is required";
    }
    
    if (!toStand.trim()) {
      newErrors.toStand = "To stand is required";
    }
    
    if (fromStand === toStand) {
      newErrors.toStand = "From and to stands cannot be the same";
    }
    
    if (!movementDate) {
      newErrors.movementDate = "Date is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setAircraft("");
    setFromStand("");
    setToStand("");
    setNotes("");
    setMovementType("Tow");
    setShowAircraftSuggestions(false);
    setErrors({});
  };

  return {
    movementDate,
    setMovementDate,
    aircraft,
    setAircraft,
    movementType,
    setMovementType,
    fromStand,
    setFromStand,
    toStand,
    setToStand,
    notes,
    setNotes,
    showAircraftSuggestions,
    setShowAircraftSuggestions,
    errors,
    validateForm,
    resetForm,
  };
};
