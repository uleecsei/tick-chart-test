import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'uniq'
})

export class UniqPipe implements PipeTransform {
    transform<T extends { [key: string]: any }>(array: T[], key: string): T[] {
        return [...new Map(array.map(item => [item[key], item])).values()];
    }
}
