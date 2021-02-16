import {Observable, Subscription, SubscriptionObserver} from "../observable/observable"

export const share = <T>() => (observable:Observable<T>) => {
  let subscription:Subscription|null
  let observers:SubscriptionObserver<T>[] = []

  return new Observable(observer => {
    observers.push(observer)

    subscription = subscription || observable.subscribe({
      next(value) {
        for (const observer of observers) observer.next(value)
      },
      error(error) {
        for (const observer of observers) observer.error(error)
      },
      complete() {
        for (const observer of observers) observer.complete()
      }
    })

    return () => {
      observers = observers.filter(o => o !== observer)
      if (observers.length === 0) {
        subscription?.unsubscribe()
        subscription = null
      }
    }
  })
}

declare module "../observable/observable" {
  interface Observable<T> {
    share():Observable<T>
  }
}

// @ts-ignore
Observable.prototype.share = function() { return share(...arguments)(this) }