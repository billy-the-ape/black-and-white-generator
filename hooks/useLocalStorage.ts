import { JSONValue } from "@/types";
import { useEffect, useState } from "react";

const getLocalStorageValue = <T extends JSONValue | null>(
  key: string,
  initialValue: T
) => {
  if (typeof window === "undefined") {
    return initialValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    return initialValue;
  }
};

const useLocalStorage = <T extends JSONValue | null>(
  key: string,
  initialValue: T
): [T, (val: T) => void] => {
  const [storedValue, setStoredValue] = useState(() =>
    getLocalStorageValue<T>(key, initialValue)
  );
  const setValue = (value: T | ((val?: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        if (typeof valueToStore === "undefined") {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setStoredValue(getLocalStorageValue<T>(key, initialValue));
  }, [key]);

  return [storedValue, setValue];
};

export default useLocalStorage;
