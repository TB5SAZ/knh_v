import { useEffect } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { VisitorFormValues } from '@/src/schemas/visitorSchema';

export function useAutoTimeUpdate(
  setValue: UseFormSetValue<VisitorFormValues>,
  isSecurity: boolean,
  dirtyFields: any
) {
  useEffect(() => {
    const timer = setInterval(() => {
      const currentNow = new Date();
      if (isSecurity || !dirtyFields.visitDate) {
        setValue('visitDate', currentNow);
      }
      if (isSecurity || !dirtyFields.visitTime) {
        setValue('visitTime', currentNow);
      }
    }, 10000);

    return () => clearInterval(timer);
  }, [dirtyFields.visitDate, dirtyFields.visitTime, setValue, isSecurity]);
}
