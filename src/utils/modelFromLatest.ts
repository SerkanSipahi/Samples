import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

/**
 * modelFromLatest<modelType> is an util that helps you to create observable model's
 * under the hood it uses combineLatest, and it fires of a new model when any of the properties update.
 * if no modelType is provided, it uses the parameters to type the result
 * (can be nested)
 * @param modelBase an object that only contains observable properties
 * sample :
 * ```
const invoice$ = modelFromLatest<testModel>({
  customer: customer$,
  invoiceHeader : ivh$,
  invoiceLines : ivh$.pipe(switchmap(ivh => this.loadLines(ivh.id)))
})
 ```
 */
export function modelFromLatest<T>(modelBase: {[P in keyof T]: Observable<T[P]>}): Observable<T> {
  /** spread out the values into an array, and use combineLatest to "watch" for changes */
  return combineLatest(Object.values(modelBase)).pipe(
    map((values :any[]) =>
      /** user reduce to reassemble the original structure, but then with the data */
      Object.keys(modelBase).reduce(
        (vm, key, i) => {
          vm[key] = values[i];
          return vm;
        },
        /** make sure it conforms to given types. */
        {} as T
      )
    )
  );
}

/**
 * Sample usage:
 *
   const demo$ = modelFromLatest({
     one: of(1),
     two: of('jj'),
     sub: modelFromLatest({
       tree: of(false)
     })
   })
 *
 */
