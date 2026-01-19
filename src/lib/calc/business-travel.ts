
import { AIR_DISTANCES_DB } from "@/lib/constants/upstream-transport-data";

// Interfaces
export interface BusinessTravelInput {
    // Common
    description?: string;

    // Air
    air_calc_method?: "airport_iata" | "distance";
    air_origin_iata?: string;
    air_dest_iata?: string;
    air_distance_km?: number;
    air_passengers?: number;
    air_trechos?: number; // Number of legs
    air_type?: "short" | "long"; // Short < 482km, Long > 1600km, etc. (Simplified)

    // Rail
    rail_type?: "train" | "subway";
    rail_passengers?: number;
    rail_distance_km?: number;
    rail_trechos?: number; // One way trip count

    // Bus
    bus_type?: "intercity" | "urban";
    bus_passengers?: number;
    bus_distance_km?: number;
    bus_trechos?: number;

    // Car
    car_calc_method?: "fleet" | "fuel" | "distance";
    car_fuel_id?: string;
    car_fuel_amount_liters?: number; // Option 2
    car_distance_km?: number; // Option 3
    car_fleet_type?: string; // Option 1
    car_fleet_year?: string; // Option 1
    car_passengers?: number; // For aggregation if needed, usually car calc is per vehicle or fuel

    // Ferry
    ferry_type?: string;
    ferry_passengers?: number;
    ferry_distance_km?: number;
    ferry_trechos?: number;
}

export interface BusinessTravelResult {
    emissions_tCO2e: number;
    emissions_tCO2_bio: number;
    ch4_emissions_t: number;
    n2o_emissions_t: number;
    co2_emissions_t: number;
    details: string;
}

// Factors (Simplified for MVP, would come from DB/Constants in prod)
// Units: kg/p.km or kg/L
const EF = {
    AIR: {
        short_haul: { co2: 0.150, ch4: 0.00001, n2o: 0.00001 }, // < 482 km
        medium_haul: { co2: 0.110, ch4: 0.00001, n2o: 0.00001 }, // 482 - 1600 km
        long_haul: { co2: 0.090, ch4: 0.00001, n2o: 0.00001 }, // > 1600 km
    },
    RAIL: {
        train: { co2: 0.041, ch4: 0.00001, n2o: 0.00001 },
        subway: { co2: 0.035, ch4: 0.0, n2o: 0.0 } // Electric mostly
    },
    BUS: {
        intercity: { co2: 0.028, ch4: 0.00001, n2o: 0.00001 },
        urban: { co2: 0.080, ch4: 0.00001, n2o: 0.00001 }
    },
    CAR_FUEL: {
        gasoline: { co2: 2.212, ch4: 0.0005, n2o: 0.0002, bio: 0.5 }, // kg/L
        ethanol: { co2: 0.0, ch4: 0.0002, n2o: 0.0001, bio: 1.5 }, // kg/L
        diesel: { co2: 2.603, ch4: 0.0001, n2o: 0.00015, bio: 0.1 }, // kg/L
    },
    FERRY: {
        passenger: { co2: 0.019, ch4: 0.00001, n2o: 0.00001 } // p.km
    }
};

// Utils
export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function calculateBusinessTravel(input: BusinessTravelInput, type: "air" | "rail" | "bus" | "car" | "ferry"): BusinessTravelResult {
    let co2 = 0; // kg
    let ch4 = 0; // kg
    let n2o = 0; // kg
    let bio = 0; // kg
    let details = "";

    // AIR
    if (type === "air") {
        let distance = input.air_distance_km || 0;

        // Option 1: Calculate from IATA
        if (input.air_calc_method === "airport_iata" && input.air_origin_iata && input.air_dest_iata) {
            const org = AIR_DISTANCES_DB[input.air_origin_iata.toUpperCase()];
            const dst = AIR_DISTANCES_DB[input.air_dest_iata.toUpperCase()];
            if (org && dst) {
                distance = calculateHaversineDistance(org.lat, org.lon, dst.lat, dst.lon);
                details = `IATA: ${input.air_origin_iata}-${input.air_dest_iata} (${distance.toFixed(0)} km)`;
            }
        } else {
            details = `Distância Informada: ${distance.toFixed(0)} km`;
        }

        // Multiplier by legs and passengers
        const total_pkm = distance * (input.air_passengers || 1) * (input.air_trechos || 1);

        // Determine haul
        let factors = EF.AIR.medium_haul;
        if (distance < 482) factors = EF.AIR.short_haul;
        else if (distance > 1600) factors = EF.AIR.long_haul;

        co2 = total_pkm * factors.co2;
        ch4 = total_pkm * factors.ch4;
        n2o = total_pkm * factors.n2o;
        details += ` | Pax: ${input.air_passengers} | Trechos: ${input.air_trechos}`;
    }

    // RAIL
    else if (type === "rail") {
        const total_pkm = (input.rail_distance_km || 0) * (input.rail_passengers || 1) * (input.rail_trechos || 1);
        const factors = input.rail_type === "subway" ? EF.RAIL.subway : EF.RAIL.train;

        co2 = total_pkm * factors.co2;
        ch4 = total_pkm * factors.ch4;
        n2o = total_pkm * factors.n2o;
        details = `Ferroviário (${input.rail_type}) | Dist: ${input.rail_distance_km}km | Pax: ${input.rail_passengers}`;
    }

    // BUS
    else if (type === "bus") {
        const total_pkm = (input.bus_distance_km || 0) * (input.bus_passengers || 1) * (input.bus_trechos || 1);
        const factors = input.bus_type === "urban" ? EF.BUS.urban : EF.BUS.intercity;

        co2 = total_pkm * factors.co2;
        ch4 = total_pkm * factors.ch4;
        n2o = total_pkm * factors.n2o;
        details = `Ônibus (${input.bus_type}) | Dist: ${input.bus_distance_km}km | Pax: ${input.bus_passengers}`;
    }

    // CAR
    else if (type === "car") {
        // Simple Fuel Option
        if (input.car_calc_method === "fuel" && input.car_fuel_id) {
            let factors = EF.CAR_FUEL.gasoline; // Default
            if (input.car_fuel_id.includes("ethanol")) factors = EF.CAR_FUEL.ethanol;
            if (input.car_fuel_id.includes("diesel")) factors = EF.CAR_FUEL.diesel;

            const liters = input.car_fuel_amount_liters || 0;
            co2 = liters * factors.co2;
            ch4 = liters * factors.ch4;
            n2o = liters * factors.n2o;
            bio = liters * (factors.bio || 0);
            details = `Automóvel (Combustível) | Litros: ${liters}`;
        }
        // Distance Option (Simplified Assumption: 10km/L Gasoline)
        else { // fleet or distance
            const distance = input.car_distance_km || 0;
            const consumption = distance / 10; // 10 km/L estimate
            const factors = EF.CAR_FUEL.gasoline; // Assume gasoline for generic car

            co2 = consumption * factors.co2;
            ch4 = consumption * factors.ch4;
            n2o = consumption * factors.n2o;
            bio = consumption * (factors.bio || 0);
            details = `Automóvel (Estimado 10km/L) | Dist: ${distance}km`;
        }
    }

    // FERRY
    else if (type === "ferry") {
        const total_pkm = (input.ferry_distance_km || 0) * (input.ferry_passengers || 1) * (input.ferry_trechos || 1);
        const factors = EF.FERRY.passenger;

        co2 = total_pkm * factors.co2;
        ch4 = total_pkm * factors.ch4;
        n2o = total_pkm * factors.n2o;
        details = `Balsa | Dist: ${input.ferry_distance_km}km | Pax: ${input.ferry_passengers}`;
    }

    // Final Conversion to t
    return {
        emissions_tCO2e: (co2 + (ch4 * 28) + (n2o * 265)) / 1000,
        emissions_tCO2_bio: bio / 1000,
        ch4_emissions_t: ch4 / 1000,
        n2o_emissions_t: n2o / 1000,
        co2_emissions_t: co2 / 1000,
        details
    };
}
