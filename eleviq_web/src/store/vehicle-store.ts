'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Vehicle, CreateVehicleInput, FuelType } from '@/types/expense';

interface VehicleState {
    vehicles: Vehicle[];
    isLoading: boolean;
    error: string | null;

    // Actions
    addVehicle: (input: CreateVehicleInput) => string;
    updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
    deleteVehicle: (id: string) => void;
    getVehicleById: (id: string) => Vehicle | undefined;
    updateOdometer: (vehicleId: string, odometer: number, mileage?: number) => void;
    clearError: () => void;
}

const generateId = () => `vehicle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useVehicleStore = create<VehicleState>()(
    persist(
        (set, get) => ({
            vehicles: [],
            isLoading: false,
            error: null,

            addVehicle: (input: CreateVehicleInput) => {
                const id = generateId();
                const now = new Date();

                const newVehicle: Vehicle = {
                    id,
                    userId: 'current-user', // Will be replaced with actual user ID
                    name: input.name,
                    registrationNumber: input.registrationNumber,
                    vehicleType: input.vehicleType,
                    fuelType: input.fuelType,
                    createdAt: now,
                    updatedAt: now,
                };

                set((state) => ({
                    vehicles: [...state.vehicles, newVehicle],
                }));

                return id;
            },

            updateVehicle: (id: string, updates: Partial<Vehicle>) => {
                set((state) => ({
                    vehicles: state.vehicles.map((v) =>
                        v.id === id
                            ? { ...v, ...updates, updatedAt: new Date() }
                            : v
                    ),
                }));
            },

            deleteVehicle: (id: string) => {
                set((state) => ({
                    vehicles: state.vehicles.filter((v) => v.id !== id),
                }));
            },

            getVehicleById: (id: string) => {
                return get().vehicles.find((v) => v.id === id);
            },

            updateOdometer: (vehicleId: string, odometer: number, mileage?: number) => {
                set((state) => ({
                    vehicles: state.vehicles.map((v) =>
                        v.id === vehicleId
                            ? {
                                ...v,
                                lastOdometer: odometer,
                                ...(mileage !== undefined && { averageMileage: mileage }),
                                updatedAt: new Date(),
                            }
                            : v
                    ),
                }));
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'eleviq-vehicles',
            partialize: (state) => ({ vehicles: state.vehicles }),
        }
    )
);

// Helper hooks
export const useVehicles = () => useVehicleStore((state) => state.vehicles);
export const useVehiclesByFuelType = (fuelType: FuelType) =>
    useVehicleStore((state) => state.vehicles.filter((v) => v.fuelType === fuelType));
