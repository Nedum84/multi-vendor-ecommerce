import moment from "moment";
// import { v4 as uuidv4 } from "uuid";

class CONSTANTS {
  static NOW = moment().toDate(); //Date

  // static UUID = () => uuidv4();
  static GUARANTEE_PERIOD: number = 7; //days
}

export default CONSTANTS;
