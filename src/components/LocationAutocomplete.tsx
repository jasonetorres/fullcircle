import { useEffect, useRef, useState } from 'react';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  onFocus?: () => void;
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

let mapsLoaded = false;
let mapsLoading = false;
const loadCallbacks: Array<() => void> = [];

const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  return new Promise((resolve) => {
    if (mapsLoaded) {
      resolve();
      return;
    }

    loadCallbacks.push(resolve);

    if (mapsLoading) {
      return;
    }

    mapsLoading = true;

    window.initGoogleMaps = () => {
      mapsLoaded = true;
      mapsLoading = false;
      loadCallbacks.forEach((callback) => callback());
      loadCallbacks.length = 0;
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });
};

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'Where were you?',
  className = '',
  required = false,
  onFocus,
}: LocationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [mapsReady, setMapsReady] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setMapsReady(false);
      return;
    }

    loadGoogleMapsScript(apiKey).then(() => {
      setMapsReady(true);
    });
  }, []);

  useEffect(() => {
    if (!mapsReady || !inputRef.current || !window.google) {
      return;
    }

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['establishment', 'geocode'],
      fields: ['formatted_address', 'name', 'address_components'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        onChange(place.formatted_address);
      } else if (place.name) {
        onChange(place.name);
      }
    });

    autocompleteRef.current = autocomplete;

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [mapsReady, onChange]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      placeholder={placeholder}
      required={required}
      className={className}
      autoComplete="off"
    />
  );
}
