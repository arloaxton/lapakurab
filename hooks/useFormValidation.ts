"use client";

import { useCallback, useState } from "react";

export type Validator<V> = (value: V[keyof V], all: V) => string | null | undefined;
export type Rules<V> = { [K in keyof V]?: Validator<V> };

export interface FormValidationApi<V> {
  values: V;
  errors: Partial<Record<keyof V, string | null | undefined>>;
  touched: Partial<Record<keyof V, boolean>>;
  setField: <K extends keyof V>(key: K, value: V[K]) => void;
  blur: (key: keyof V) => void;
  validate: (vs?: V) => boolean;
  setValues: (next: V | ((prev: V) => V)) => void;
  touchAll: () => void;
}

export function useFormValidation<V extends object>(
  initial: V,
  rules: Rules<V>
): FormValidationApi<V> {
  const [values, setValues] = useState<V>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof V, string | null | undefined>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof V, boolean>>>({});

  const validate = useCallback(
    (vs: V = values) => {
      const errs: Partial<Record<keyof V, string | null | undefined>> = {};
      (Object.entries(rules) as [keyof V, Validator<V> | undefined][]).forEach(([k, fn]) => {
        if (!fn) return;
        const e = fn(vs[k], vs);
        if (e) errs[k] = e;
      });
      setErrors(errs);
      return Object.keys(errs).length === 0;
    },
    [rules, values]
  );

  const setField = useCallback(
    <K extends keyof V>(k: K, v: V[K]) => {
      setValues((s) => ({ ...s, [k]: v }));
      if (touched[k]) {
        const fn = rules[k];
        if (fn) {
          const e = fn(v, { ...values, [k]: v });
          setErrors((s) => ({ ...s, [k]: e }));
        }
      }
    },
    [rules, touched, values]
  );

  const blur = useCallback(
    (k: keyof V) => {
      setTouched((s) => ({ ...s, [k]: true }));
      const fn = rules[k];
      if (fn) {
        const e = fn(values[k], values);
        setErrors((s) => ({ ...s, [k]: e }));
      }
    },
    [rules, values]
  );

  const touchAll = useCallback(() => {
    const all: Partial<Record<keyof V, boolean>> = {};
    (Object.keys(rules) as (keyof V)[]).forEach((k) => {
      all[k] = true;
    });
    setTouched(all);
  }, [rules]);

  return { values, errors, touched, setField, blur, validate, setValues, touchAll };
}
