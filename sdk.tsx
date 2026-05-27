import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

class DateUtils {
    /**
     * Проверяет, истекла ли дата (сравнение в UTC)
     * @param dateString - дата в формате ISO (например "2026-05-21T20:59:59Z")
     * @returns true - истекла, false - не истекла
     */
    public hasExpired(dateString: string | null | undefined): boolean {
        if (!dateString) return true;
        
        const nowUTC = dayjs.utc(); // текущая дата в UTC
        const parsedDate = dayjs.utc(dateString); // парсим дату как UTC
        
        if (!parsedDate.isValid()) return true;
        
        return nowUTC.isAfter(parsedDate);
    }

    public getRuDateTimeFormat(): string {
        return this.RU_DATE_FORMAT;
    }

    public getFormatDate(): string {
        const currentDate = new Date();
        const parsedDate = dayjs(currentDate);
        return parsedDate.locale(this.LOCALE).format(this.FORMAT_DATE);
    }

    public getLocaleDate(dtoDate: string | number | Date): string {
        if (!dtoDate) {
            return LONG_DASH;
        }
        return dayjs(dtoDate).locale(this.LOCALE).format(this.FORMAT_DATE);
    }
}