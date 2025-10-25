import clsx from 'clsx';
import { ChangeEvent, SelectHTMLAttributes } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: DropdownOption[];
  label?: string;
  onChange: (value: string, event: ChangeEvent<HTMLSelectElement>) => void;
}

export function Dropdown({
  options,
  label,
  id,
  className,
  onChange,
  value,
  defaultValue,
  ...rest
}: DropdownProps) {
  return (
    <label style={{ display: 'grid', gap: 'var(--mhp-spacing-xs)' }} htmlFor={id}>
      {label && <span>{label}</span>}
      <select
        id={id}
        className={clsx('mhp-dropdown', className)}
        value={value}
        defaultValue={defaultValue}
        onChange={(event) => onChange(event.target.value, event)}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
