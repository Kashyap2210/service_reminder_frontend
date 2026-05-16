export const VALIDATION_MESSAGES: Record<string, (val?: any) => string> = {
  required:  ()    => 'This field is required',
  email:     ()    => 'Invalid email address',
  minlength: (val) => `Minimum ${val.requiredLength} characters`,
  maxlength: (val) => `Maximum ${val.requiredLength} characters`,
  pattern:   ()    => 'Invalid format',
  min:       (val) => `Minimum value is ${val.min}`,
  max:       (val) => `Maximum value is ${val.max}`,
};