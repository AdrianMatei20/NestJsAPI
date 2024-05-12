import { Injectable } from '@nestjs/common';

@Injectable()
export class ObjectValidationService {

    getMissingProperties(input: any, schema: any): string[] {
        return Object.keys(schema)
            .filter(key => input[key] === undefined)
            .map(key => key as keyof typeof input)
            .map(key => `${key.toString()}`);
    }

}