'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { searchAddress, type AddressSearchResult } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: AddressSearchResult) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = 'Ketik alamat (minimal 3 karakter)...',
  disabled = false,
}) => {
  const [suggestions, setSuggestions] = useState<AddressSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search function (500ms delay)
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await searchAddress(searchQuery);
      if (response.success) {
        setSuggestions(response.data.results);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced search
    debounceTimer.current = setTimeout(() => {
      performSearch(value);
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [value, performSearch]);

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (suggestion: AddressSearchResult) => {
    onChange(suggestion.display_name);
    onSelect(suggestion);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => (value?.length || 0) > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 pr-10"
          autoComplete="off"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-8 w-8 p-0"
            onClick={handleClear}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute right-3 top-3 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          className={cn(
            'absolute top-full left-0 right-0 z-50 mt-1',
            'bg-white border border-input rounded-md shadow-lg',
            'max-h-60 overflow-y-auto'
          )}
        >
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => handleSelect(suggestion)}
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm',
                    'hover:bg-accent hover:text-accent-foreground',
                    'transition-colors duration-150'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium truncate">
                        {suggestion.display_name}
                      </p>
                      {suggestion.address && (
                        <p className="text-xs text-muted-foreground">
                          {[
                            suggestion.address.city_district,
                            suggestion.address.city,
                            suggestion.address.state,
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !loading && (value?.length || 0) >= 3 && suggestions.length === 0 && (
        <div
          className={cn(
            'absolute top-full left-0 right-0 z-50 mt-1',
            'bg-white border border-input rounded-md shadow-lg',
            'px-4 py-3 text-sm text-muted-foreground'
          )}
        >
          ℹ️ Tidak ada hasil untuk "{value}"
        </div>
      )}

      {/* Min characters message */}
      {showSuggestions &&
        !loading &&
        (value?.length || 0) > 0 &&
        (value?.length || 0) < 3 &&
        (
          <div
            className={cn(
              'absolute top-full left-0 right-0 z-50 mt-1',
              'bg-white border border-input rounded-md shadow-lg',
              'px-4 py-3 text-sm text-muted-foreground'
            )}
          >
            ℹ️ Ketik minimal {3 - (value?.length || 0)} karakter lagi
          </div>
        )}
    </div>
  );
};
