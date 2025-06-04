"use client";

import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

type Props = {
  value: string;
  onChange: (address: string, lat: number, lng: number) => void;
};

export default function LocationAutocomplete({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!window.google || !inputRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["geocode"],
      componentRestrictions: { country: "ph" },
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();

      if (place.formatted_address && lat && lng) {
        onChange(place.formatted_address, lat, lng);
      }
    });
  }, []);

  return (
    <Input
      placeholder="Search for location"
      ref={inputRef}
      defaultValue={value}
    />
  );
}
