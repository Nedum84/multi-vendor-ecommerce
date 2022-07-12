/**
 * Guarantee period in days that must elapse before vendors
 * can claim their cash after order delivery
 * @abstract Past this time(days), user cannot return this product
 */
export const RETURNABLE_DAYS: number = 7; // 7days

export const RETURNABLE_DAYS_MILLISECONDS: number = RETURNABLE_DAYS * 24 * 3600 * 1000;

/**
 * @override calcs time between now to the guanrantee period,
 * @inner i.e => now() - GUARANTEE_PERIOD
 * @return Date
 */
export const RETURNABLE_PERIOD = new Date(Date.now() - RETURNABLE_DAYS_MILLISECONDS);
