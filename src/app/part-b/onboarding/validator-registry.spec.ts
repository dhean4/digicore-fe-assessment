import { FormControl } from '@angular/forms';
import { FieldConfig } from '../tenant/tenant.model';
import { buildValidators, errorMessage } from './validator-registry';

const validate = (field: FieldConfig, value: string) => {
  const control = new FormControl(value, { validators: buildValidators(field.validators) });
  return errorMessage(field, control.errors);
};

describe('validator registry', () => {
  const bvn: FieldConfig = {
    key: 'bvn',
    label: 'BVN',
    type: 'text',
    validators: [{ rule: 'required' }, { rule: 'bvn' }],
  };

  it('reports the first failing rule in config order', () => {
    expect(validate(bvn, '')).toBe('BVN is required.');
    expect(validate(bvn, '123')).toBe('BVN must be exactly 11 digits.');
    expect(validate(bvn, '22212345678')).toBeNull();
  });

  it('prefers the bank-specific message over the default', () => {
    const rc: FieldConfig = {
      key: 'rc',
      label: 'RC',
      type: 'text',
      validators: [{ rule: 'pattern', value: '^RC\\d{5,7}$', message: 'Use your CAC number.' }],
    };
    expect(validate(rc, 'ABC')).toBe('Use your CAC number.');
    expect(validate(rc, 'RC123456')).toBeNull();
  });

  it('maps Angular built-in error keys (minLength → minlength)', () => {
    const name: FieldConfig = {
      key: 'name',
      label: 'Name',
      type: 'text',
      validators: [{ rule: 'minLength', value: 3 }],
    };
    expect(validate(name, 'Al')).toBe('Name must be at least 3 characters.');
  });

  it('enforces minAge', () => {
    const dob: FieldConfig = {
      key: 'dob',
      label: 'DOB',
      type: 'date',
      validators: [{ rule: 'minAge', value: 18 }],
    };
    const year = new Date().getFullYear();
    expect(validate(dob, `${year - 10}-01-01`)).toBe('You must be at least 18 years old.');
    expect(validate(dob, `${year - 30}-01-01`)).toBeNull();
  });

  it('validates Nigerian phone numbers', () => {
    const phone: FieldConfig = {
      key: 'phone',
      label: 'Phone',
      type: 'tel',
      validators: [{ rule: 'nigerianPhone' }],
    };
    expect(validate(phone, '08031234567')).toBeNull();
    expect(validate(phone, '+2348031234567')).toBeNull();
    expect(validate(phone, '12345')).not.toBeNull();
  });

  it('skips rules this build does not know instead of crashing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const validators = buildValidators([{ rule: 'fromTheFuture' as never }, { rule: 'required' }]);
    expect(validators).toHaveLength(1);
    warn.mockRestore();
  });
});
