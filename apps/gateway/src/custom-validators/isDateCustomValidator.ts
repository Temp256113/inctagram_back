import { BadRequestException, Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isValid, parseISO } from 'date-fns';

export function IsDateCustomValidator(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsDateCustomValidation,
    });
  };
}

@ValidatorConstraint({ name: 'date', async: false })
@Injectable()
export class IsDateCustomValidation implements ValidatorConstraintInterface {
  constructor() {}

  validate(
    value: string,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> | boolean {
    const parsedDate = parseISO(value);

    if (!isValid(parsedDate)) {
      throw new BadRequestException('Provided value must be valid date');
    }

    return true;
  }
}
