import type { ValidationOptions } from 'class-validator';
import {
  isNumberString,
  IsPhoneNumber as isPhoneNumber,
  registerDecorator,
  ValidateIf,
} from 'class-validator';
import { isString } from 'lodash';
import { Transform } from 'class-transformer';
import { BadRequestException, ParseFloatPipe } from '@nestjs/common';
import { RESPONSE_MESSAGE } from '../constants/response-message';

export function IsPassword(
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return (object, propertyName: string) => {
    registerDecorator({
      propertyName,
      name: 'isPassword',
      target: object.constructor,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: string) {
          return /^[\d!#$%&*@A-Z^a-z]*$/.test(value);
        },
      },
    });
  };
}

export function IsPhoneNumber(
  validationOptions?: ValidationOptions & {
    region?: Parameters<typeof isPhoneNumber>[0];
  }
): PropertyDecorator {
  return isPhoneNumber(validationOptions?.region, {
    message: 'error.phoneNumber',
    ...validationOptions,
  });
}

export function IsTmpKey(
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return (object, propertyName: string) => {
    registerDecorator({
      propertyName,
      name: 'tmpKey',
      target: object.constructor,
      options: validationOptions,
      validator: {
        validate(value: string): boolean {
          return isString(value) && /^tmp\//.test(value);
        },
        defaultMessage(): string {
          return 'error.invalidTmpKey';
        },
      },
    });
  };
}

export function IsUndefinable(options?: ValidationOptions): PropertyDecorator {
  return ValidateIf((obj, value) => value !== undefined, options);
}

export function IsNullable(options?: ValidationOptions): PropertyDecorator {
  return ValidateIf((obj, value) => value !== null, options);
}

export function IsBigInt(options?: ValidationOptions): PropertyDecorator {
  return ValidateIf((obj, value) => typeof value === 'bigint', options);
}

export function TransformBigInt(): PropertyDecorator {
  return Transform((val) => {
    if (val.value === null) {
      return null;
    }

    if (!isNumberString(val.value)) {
      throw new BadRequestException(
        `${val.key}${RESPONSE_MESSAGE.exceptionMessage.validator.must_be_a_number}`
      );
    }

    try {
      return BigInt(val.value);
    } catch (e) {
      throw new BadRequestException(
        `${val.key}${RESPONSE_MESSAGE.exceptionMessage.validator.must_be_bigint}`
      );
    }
  });
}
export function TransformArrayNumber(): PropertyDecorator {
  return Transform((val) => {
    try {
      let items = val.value.split(',');
      if (!items) {
        items = val.value.split('%2C'); // %2C is encoded url of ','
      }
      const result = items.map(Number);
      if (result.some((num) => isNaN(num))) {
        throw new BadRequestException(
          `${val.key}${RESPONSE_MESSAGE.exceptionMessage.validator.must_be_a_number}`
        );
      }
      return result;
    } catch (e) {
      throw new BadRequestException(
        `${val.key}${RESPONSE_MESSAGE.exceptionMessage.validator.must_be_a_number}`
      );
    }
  });
}

export function TransformBigIntArray(): PropertyDecorator {
  return Transform((val) => {
    if (!Array.isArray(val.value)) {
      val.value = [val.value];
    }

    const transformedValues = [];

    for (const value of val.value) {
      if (!isNumberString(value)) {
        throw new BadRequestException(
          `${val.key}${RESPONSE_MESSAGE.exceptionMessage.validator.must_be_a_number}`
        );
      }

      try {
        transformedValues.push(BigInt(value));
      } catch (e) {
        throw new BadRequestException(
          `${val.key}${RESPONSE_MESSAGE.exceptionMessage.validator.must_be_bigint}`
        );
      }
    }

    return transformedValues;
  });
}
export function TransformNumber(): PropertyDecorator {
  return Transform((val) => {
    try {
      return Number(val.value);
    } catch (e) {
      throw new BadRequestException(
        `${val.key}${RESPONSE_MESSAGE.exceptionMessage.validator.must_be_a_number}`
      );
    }
  });
}

export function TransformFloat(): PropertyDecorator {
  return Transform((val) => {
    try {
      return parseFloat(val.value);
    } catch (e) {
      throw new BadRequestException(
        `${val.key}${RESPONSE_MESSAGE.exceptionMessage.validator.must_be_a_number}`
      );
    }
  });
}
export function TransformBoolean(): PropertyDecorator {
  return Transform((val) => {
    if (typeof val.value === 'boolean') {
      return val.value;
    } else {
      const strValue = `${val.value}`.toLowerCase();
      const validValues = ['true', 'false', '1', '0'];
      if (validValues.includes(strValue)) {
        return strValue === 'true' || strValue === '1';
      } else {
        throw new BadRequestException(
          `${val.key}${RESPONSE_MESSAGE.exceptionMessage.validator.must_be_boolean}`
        );
      }
    }
  });
}
export function TransformObject(): PropertyDecorator {
  return Transform((val) => {
    try {
      return JSON.parse(val.value);
    } catch (e) {
      throw new BadRequestException(
        `${val.key}${RESPONSE_MESSAGE.exceptionMessage.validator.must_be_json}`
      );
    }
  });
}
