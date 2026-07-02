import { FlightProvider } from "./FlightProvider.js";

const MOCK_FLIGHTS = [
  {
    id: "mock-flt-001",
    flightNumber: "BY2134",
    aircraftRegistration: "G-TUKA",
    aircraftType: "Boeing 737-800",
    movement: "Departure",
    origin: "Manchester",
    destination: "Palma de Mallorca",
    scheduledTime: "06:40",
    status: "Boarding",
    stand: "206",
  },
  {
    id: "mock-flt-002",
    flightNumber: "BY2017",
    aircraftRegistration: "G-TUMH",
    aircraftType: "Boeing 787-8 Dreamliner",
    movement: "Arrival",
    origin: "Cancun",
    destination: "Manchester",
    scheduledTime: "07:25",
    status: "Landed",
    stand: "15",
  },
];

const MOCK_AIRCRAFT = [
  {
    registration: "G-TUKA",
    aircraftType: "Boeing 737-800",
    seatConfiguration: "189Y",
  },
  {
    registration: "G-TUMH",
    aircraftType: "Boeing 787-8 Dreamliner",
    seatConfiguration: "47J / 241Y",
  },
];

export class MockFlightProvider extends FlightProvider {
  async fetchFlights() {
    return structuredClone(MOCK_FLIGHTS);
  }

  async fetchAircraft() {
    return structuredClone(MOCK_AIRCRAFT);
  }
}
