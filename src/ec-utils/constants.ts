import moment from "moment";

class CONSTANTS {
  static NOW = moment().toDate();

  /**
   * Guarantee period in days that must elapse before vendors
   * can claim their cash after order delivery
   * @abstract Past this time(days), user cannot return this product
   */
  static RETURNABLE_DAYS: number = 7; //7days

  static RETURNABLE_DAYS_MILLISECONDS: number = CONSTANTS.RETURNABLE_DAYS * 24 * 3600 * 1000;

  /**
   * @override calcs time between now to the guanrantee period,
   * @inner i.e => now() - GUARANTEE_PERIOD
   * @return Date
   */
  static RETURNABLE_PERIOD = new Date(Date.now() - CONSTANTS.RETURNABLE_DAYS_MILLISECONDS);
}

export default CONSTANTS;
