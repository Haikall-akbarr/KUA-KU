'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { MapSelector } from './MapSelector';

interface OutsideKUALocationProps {
  isVisible: boolean;
}

interface LocationData {
  alamat: string;
  latitude: number;
  longitude: number;
}

export const OutsideKUALocation: React.FC<OutsideKUALocationProps> = ({
  isVisible,
}) => {
  const { control, setValue } = useFormContext<any>();

  const handleLocationSelect = (location: LocationData) => {
    // Store location data in form
    setValue('outside_kua_location_alamat', location.alamat, {
      shouldValidate: true,
    });
    setValue('outside_kua_location_latitude', location.latitude, {
      shouldValidate: true,
    });
    setValue('outside_kua_location_longitude', location.longitude, {
      shouldValidate: true,
    });

    console.log('📍 Location selected:', location);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="space-y-4">
      <MapSelector
        onLocationSelect={handleLocationSelect}
        disabled={false}
      />

      {/* Hidden fields to store location data */}
      <Controller
        name="outside_kua_location_alamat"
        control={control}
        defaultValue=""
        render={({ field }) => <input {...field} type="hidden" />}
      />
      <Controller
        name="outside_kua_location_latitude"
        control={control}
        defaultValue={0}
        render={({ field }) => <input {...field} type="hidden" />}
      />
      <Controller
        name="outside_kua_location_longitude"
        control={control}
        defaultValue={0}
        render={({ field }) => <input {...field} type="hidden" />}
      />
    </div>
  );
};
